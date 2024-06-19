import * as utils from "../utils";

/**
 * Run brew install on a list of specified packages.
 *
 * @param   packages list of Homebrew packages to be installed
 * @returns Promise<number> exit code
 */
export async function runBrew(packages: string[]): Promise<number> {
	return utils.exec("brew", ["install"].concat(packages));
}
