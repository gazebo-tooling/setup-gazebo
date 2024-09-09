import * as actions_exec from "@actions/exec";
import * as core from "@actions/core";
import * as im from "@actions/exec/lib/interfaces";
import { parseDocument } from "yaml";

// Collections file that contains all the valid Gazebo distributions along all compatiblity information
const collections_url: string =
	"https://raw.githubusercontent.com/gazebo-tooling/release-tools/master/jenkins-scripts/dsl/gz-collections.yaml";

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
 * @returns Promise<void>
 */
export async function validateDistro(
	requiredGazeboDistributionsList: string[],
): Promise<void> {
	await fetch(collections_url)
		.then((response) => response.blob())
		.then((blob) => blob.text())
		.then((yamlStr) => {
			const collections = parseDocument(yamlStr).toJSON();
			requiredGazeboDistributionsList.forEach((gazeboDistro) => {
				const valid: boolean = collections["collections"].some(
					(collectionsDistro: any) => collectionsDistro.name === gazeboDistro,
				);
				if (!valid) {
					throw new Error("Input has invalid distribution names.");
				}
			});
		});
}

/**
 * Gets the input of the Gazebo distributions to be installed and
 * validates them
 *
 * @returns Promise<string[]> List of validated Gazebo distributions
 */
export async function getRequiredGazeboDistributions(): Promise<string[]> {
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

	await validateDistro(requiredGazeboDistributionsList);

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
	await fetch(collections_url)
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
