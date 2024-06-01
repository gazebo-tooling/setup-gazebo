import * as actions_exec from "@actions/exec";
import * as core from "@actions/core";
import * as im from "@actions/exec/lib/interfaces";

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

// List of valid Gazebo distributions
const validDistro: string[] = ["citadel", "fortress", "garden", "humble"];

//.
/**
 * Validate all Gazebo input distribution names
 *
 * @param requiredGazeboDistributionsList
 * @returns boolean
 */
export function validateDistro(
	requiredGazeboDistributionsList: string[],
): boolean {
	for (const gazeboDistro of requiredGazeboDistributionsList) {
		if (validDistro.indexOf(gazeboDistro) <= -1) {
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
	const requiredGazeboDistributions = core.getInput("required-gazebo-distributions");
	if (requiredGazeboDistributions) {
		requiredGazeboDistributionsList = requiredGazeboDistributions.split(
			RegExp("\\s"),
		);
	}

	if (!validateDistro(requiredGazeboDistributionsList)) {
		throw new Error("Input has invalid distribution names.");
	}

	return requiredGazeboDistributionsList;
}