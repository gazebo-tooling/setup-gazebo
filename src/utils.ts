import * as actions_exec from "@actions/exec";
import * as core from "@actions/core";
import * as im from "@actions/exec/lib/interfaces";
import { parseDocument } from "yaml";

// List of Valid Gazebo distributions with compatible
// Ubuntu distributions
const validGazeboDistroList: string[] = [
	"citadel",
	"fortress",
	"garden",
	"harmonic",
	"ionic",
];

// List of valid ROS 2 distributions
const validRosGzDistrosList: {
	rosDistro: string;
	compatibleGazeboDistros: string[];
	useWithCautionGazeboDistros: string[];
}[] = [
	{
		rosDistro: "humble",
		compatibleGazeboDistros: ["fortress"],
		useWithCautionGazeboDistros: ["garden", "harmonic"],
	},
	{
		rosDistro: "iron",
		compatibleGazeboDistros: ["fortress"],
		useWithCautionGazeboDistros: ["garden", "harmonic"],
	},
	{
		rosDistro: "jazzy",
		compatibleGazeboDistros: ["harmonic"],
		useWithCautionGazeboDistros: ["garden"],
	},
	{
		rosDistro: "rolling",
		compatibleGazeboDistros: ["harmonic"],
		useWithCautionGazeboDistros: ["garden"],
	},
];

/**
 * Execute a command and wrap the output in a log group.
 *
 * @param   commandLine     command to execute (can include additional args). Must be correctly escaped.
 * @param   args            optional arguments for tool. Escaping is handled by the lib.
 * @param   options         optional exec options.  See ExecOptions
 * @param   log_message     log group title.
 * @returns Promise<number> exit code
 */
export async function exec(
	commandLine: string,
	args?: string[],
	options?: im.ExecOptions,
	log_message?: string,
): Promise<number> {
	const argsAsString = (args || []).join(" ");
	const message = log_message || `Invoking "${commandLine} ${argsAsString}"`;
	return core.group(message, () => {
		return actions_exec.exec(commandLine, args, options);
	});
}

/**
 * Determines the Ubuntu distribution codename.
 *
 * This function directly source /etc/lsb-release instead of invoking
 * lsb-release as the package may not be installed.
 *
 * @returns Promise<string> Ubuntu distribution codename (e.g. "focal")
 */
export async function determineDistribCodename(): Promise<string> {
	let distribCodename = "";
	const options: im.ExecOptions = {};
	options.listeners = {
		stdout: (data: Buffer) => {
			distribCodename += data.toString();
		},
	};
	await exec(
		"bash",
		["-c", 'source /etc/lsb-release ; echo -n "$DISTRIB_CODENAME"'],
		options,
	);
	return distribCodename;
}

/**
 * Validate all Gazebo input distribution names
 *
 * @param requiredGazeboDistributionsList
 * @returns boolean Validity of Gazebo distribution
 */
export function validateDistro(
	requiredGazeboDistributionsList: string[],
): boolean {
	for (const gazeboDistro of requiredGazeboDistributionsList) {
		if (validGazeboDistroList.indexOf(gazeboDistro) <= -1) {
			return false;
		}
	}
	return true;
}

/**
 * Validate all ROS distribution names
 *
 * @param rosGzDistrosList
 * @returns boolean Validaity of the ROS distribution
 */
export function validateRosDistro(rosGzDistrosList: string[]): boolean {
	if (rosGzDistrosList.length > 0) {
		const validDistro: string[] = validRosGzDistrosList.map(
			(obj) => obj.rosDistro,
		);
		for (const rosDistro of rosGzDistrosList) {
			if (validDistro.indexOf(rosDistro) <= -1) {
				return false;
			}
		}
	}
	return true;
}

/**
 * Gets the input of the Gazebo distributions to be installed and
 * validates them
 *
 * @returns string[] List of validated Gazebo distributions
 */
export function getRequiredGazeboDistributions(): string[] {
	let requiredGazeboDistributionsList: string[] = [];
	const requiredGazeboDistributions = core.getInput(
		"required-gazebo-distributions",
	);
	if (requiredGazeboDistributions) {
		requiredGazeboDistributionsList = requiredGazeboDistributions.split(
			RegExp("\\s"),
		);
	} else {
		throw new Error("Input cannot be empty.");
	}
	if (!validateDistro(requiredGazeboDistributionsList)) {
		throw new Error("Input has invalid distribution names.");
	}
	return requiredGazeboDistributionsList;
}

/**
 * Check the compatability of the Ubuntu version against the
 * Gazebo distribution. Throws an error if incompatible
 * combination found
 *
 * @param requiredGazeboDistributionsList
 * @param ubuntuCodename
 * @returns Promise<void>
 */
export async function checkUbuntuCompatibility(
	requiredGazeboDistributionsList: string[],
	ubuntuCodename: string,
): Promise<void> {
	await fetch(
		"https://raw.githubusercontent.com/gazebo-tooling/release-tools/master/jenkins-scripts/dsl/gz-collections.yaml",
	)
		.then((response) => response.blob())
		.then((blob) => blob.text())
		.then((yamlStr) => {
			const collections = parseDocument(yamlStr).toJSON();
			collections["collections"].forEach((indexCollection: any) => {
				requiredGazeboDistributionsList.forEach((requiredCollectionName) => {
					// If the name of the Gazebo Distribution in the index matches the
					// name in the requiredGazeboDistributionsList then look for the
					// supported packaging configs.
					if (indexCollection["name"] === requiredCollectionName) {
						const availableDistros: string[] = [];
						indexCollection["packaging"]["configs"].forEach(
							(collectionPkgConfigName: any) => {
								const packagingInfo = collections["packaging_configs"].find(
									(packaging: any) =>
										packaging.name === collectionPkgConfigName,
								);
								// The interested packaging configurations are the system.version for ubuntu
								// which are the names of the Ubuntu distribution (i.e noble)
								if (packagingInfo.system.distribution === "ubuntu") {
									availableDistros.push(packagingInfo.system.version);
								}
							},
						);
						if (availableDistros.indexOf(ubuntuCodename) <= -1) {
							throw new Error(
								"Incompatible Gazebo and Ubuntu combination. \
                All compatible combinations can be found at \
                https://gazebosim.org/docs/latest/getstarted/#step-1-install",
							);
						}
					}
				});
			});
		});
}

/**
 * Check for unstable repository inputs
 *
 * @returns unstableRepos unstable repository names
 */
export function checkForUnstableAptRepos(): string[] {
	const unstableRepos: string[] = [];
	const useGazeboPrerelease = core.getInput("use-gazebo-prerelease") === "true";
	if (useGazeboPrerelease) {
		unstableRepos.push("prerelease");
	}
	const useGazeboNightly = core.getInput("use-gazebo-nightly") === "true";
	if (useGazeboNightly) {
		unstableRepos.push("nightly");
	}
	return unstableRepos;
}

/**
 * Check for inputs to install ros-gz
 *
 * @returns requiredRosDistroList list of valid ROS 2 distributions
 */
export function checkForRosGz(): string[] {
	let requiredRosDistroList: string[] = [];
	const installRosGz = core.getInput("install-ros-gz");
	console.log(installRosGz);
	if (installRosGz) {
		requiredRosDistroList = installRosGz.split(RegExp("\\s"));
		if (!validateRosDistro(requiredRosDistroList)) {
			throw new Error("Input has invalid ROS 2 distribution names.");
		}
	}
	return requiredRosDistroList;
}

export function generateRosAptPackageNames(
	rosGzDistrosList: string[],
	requiredGazeboDistributionsList: string[],
): string[] {
	const rosAptPackageNames: string[] = [];
	for (const rosDistro of rosGzDistrosList) {
		const distroInfo = validRosGzDistrosList.find(
			(distro) => distro.rosDistro === rosDistro,
		);
		for (const gazeboDistro of requiredGazeboDistributionsList) {
			if (distroInfo!.compatibleGazeboDistros.indexOf(gazeboDistro) > -1) {
				rosAptPackageNames.push(`ros-${rosDistro}-ros-gz`);
			} else if (
				distroInfo!.useWithCautionGazeboDistros.indexOf(gazeboDistro) > -1
			) {
				rosAptPackageNames.push(`ros-${rosDistro}-ros_gz${gazeboDistro}`);
			} else {
				throw new Error(
					"Impossible ROS 2 and Gazebo combination requested. \
          Please check the list of compatible combinations at \
          https://gazebosim.org/docs/latest/ros_installation/#summary-of-compatible-ros-and-gazebo-combinations",
				);
			}
		}
	}
	return rosAptPackageNames;
}
