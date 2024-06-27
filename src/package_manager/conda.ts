import * as utils from "../utils";

/**
 * Create a conda environment
 *
 * @param envName
 * @returns Promise<number> exit code
 */
export async function createCondaEnv(envName: string): Promise<number> {
	return utils.exec("conda", ["create", "-n"].concat([envName]));
}

/**
 * Activate a conda environment
 *
 * @param envName
 * @returns Promise<number> exit code
 */
export async function activateCondaEnv(envName: string): Promise<number> {
	return utils.exec("conda", ["activate"].concat([envName]));
}

/**
 * Run conda install on a list of specified packages.
 *
 * @param   packages list of conda-forge packages to be installed
 * @returns Promise<number> exit code
 */
export async function runConda(packages: string[]): Promise<number> {
	return utils.exec(
		"conda",
		["install", "--channel", "conda-forge"].concat(packages),
	);
}
