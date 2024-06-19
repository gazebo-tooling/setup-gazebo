import * as utils from "../utils";

const aptCommandLine: string[] = [
	"DEBIAN_FRONTEND=noninteractive",
	"apt-get",
	"install",
	"--no-install-recommends",
	"--quiet",
	"--yes",
];

/**
 * Run apt-get install on list of specified packages.
 *
 * This invokation guarantees that APT install will be non-blocking.
 *
 * @param   packages list of Debian pacakges to be installed
 * @returns Promise<number> exit code
 */
export async function runAptGetInstall(packages: string[]): Promise<number> {
	return utils.exec("sudo", aptCommandLine.concat(packages));
}
