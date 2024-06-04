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
 * In particular, it automatically accepts the RTI Connext license, which would block forever otherwise.
 * Skipping the license agreement page requires RTI_NC_LICENSE_ACCEPTED to be set to "yes".
 * This package would normally be installed automatically by rosdep, but
 * there is no way to pass RTI_NC_LICENSE_ACCEPTED through rosdep.
 *
 * @param   packages        list of Debian pacakges to be installed
 * @returns Promise<number> exit code
 */
export async function runAptGetInstall(packages: string[]): Promise<number> {
  return utils.exec("sudo", aptCommandLine.concat(packages));
}