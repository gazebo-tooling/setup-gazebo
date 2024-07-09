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

/**
 * Run brew unlink on a specified package
 *
 * @param packageName name of the package to be unlinked
 * @returns Promise<number> exit code
 */
export async function unlinkPackage(packageName: string): Promise<number> {
	return utils.exec("brew", ["unlink", `${packageName}`]);
}

/**
 * Run brew link on a specified package
 *
 * @param packageName name of the package to be linked
 * @returns Promise<number> exit code
 */
export async function linkPackage(packageName: string): Promise<number> {
	return utils.exec("brew", ["link", `${packageName}`]);
}
