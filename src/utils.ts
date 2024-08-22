import * as actions_exec from "@actions/exec";
import * as core from "@actions/core";
import * as im from "@actions/exec/lib/interfaces";

// List of Valid Gazebo distributions with compatible
// Ubuntu distributions
const validGazeboDistroList: {
	name: string;
	compatibleUbuntuDistros: string[];
	compatibleRosDistros: string[];
}[] = [
	{
		name: "citadel",
		compatibleUbuntuDistros: ["focal"],
		compatibleRosDistros: ["foxy"],
	},
	{
		name: "fortress",
		compatibleUbuntuDistros: ["focal", "jammy"],
		compatibleRosDistros: ["humble", "iron"],
	},
	{
		name: "garden",
		compatibleUbuntuDistros: ["focal", "jammy"],
		compatibleRosDistros: [],
	},
	{
		name: "harmonic",
		compatibleUbuntuDistros: ["jammy", "noble"],
		compatibleRosDistros: ["jazzy", "rolling"],
	},
	{
		name: "ionic",
		compatibleUbuntuDistros: ["noble"],
		compatibleRosDistros: [],
	},
];

// List of valid ROS 2 distributions
const validRosGzDistrosList: string[] = ["humble", "iron", "jazzy", "rolling"];

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
	const validDistro: string[] = validGazeboDistroList.map((obj) => obj.name);
	for (const gazeboDistro of requiredGazeboDistributionsList) {
		if (validDistro.indexOf(gazeboDistro) <= -1) {
			return false;
		}
	}
	return true;
}

/**
 * Validate all ROS distribution names
 *
 * @returns boolean Validaity of the ROS distribution
 */
export function validateRosDistro(rosGzDistrosList: string[]): boolean {
	if (rosGzDistrosList.length <= 0) {
		return true;
	}
	for (const rosDistro of rosGzDistrosList) {
		if (validRosGzDistrosList.indexOf(rosDistro) <= -1) {
			return false;
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
 */
export function checkUbuntuCompatibility(
	requiredGazeboDistributionsList: string[],
	ubuntuCodename: string,
) {
	requiredGazeboDistributionsList.forEach((element) => {
		const compatibleDistros = validGazeboDistroList.find(
			(obj) => obj.name === element,
		)!.compatibleUbuntuDistros;
		if (compatibleDistros.indexOf(ubuntuCodename) <= -1) {
			throw new Error(
				"Incompatible Gazebo and Ubuntu combination. \
        All compatible combinations can be found at \
        https://gazebosim.org/docs/latest/getstarted/#step-1-install",
			);
		}
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
	if (installRosGz) {
		requiredRosDistroList = installRosGz.split(RegExp("\\s"));
	}
	if (!validateRosDistro(requiredRosDistroList)) {
		throw new Error("Input has invalid ROS 2 distribution names.");
	}
	return requiredRosDistroList;
}
