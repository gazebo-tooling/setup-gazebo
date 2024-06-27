import * as utils from "../utils";

export async function createCondaEnv(): Promise<number> {
	return utils.exec("conda", ["create", "-n", "gz-env"]);
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
