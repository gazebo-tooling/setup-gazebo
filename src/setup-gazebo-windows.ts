import * as utils from "./utils";
import * as conda from "./package_manager/conda";

// List of mapped Gazebo distro to gz-sim versions
const validLibVersions: { distro: string; libVersion: number }[] = [
	{
		distro: "garden",
		libVersion: 7,
	},
	{
		distro: "harmonic",
		libVersion: 8,
	},
];

/**
 * Get gz-sim library version corresponding to a gz-$collection
 * since conda does not currently support the gz-$collection metapackages.
 * See https://github.com/conda-forge/gz-sim-feedstock/issues/61
 *
 * @param gazeboDistro name of Gazebo distribution
 * @returns gz-sim version
 */
async function getLibVersion(gazeboDistro: string): Promise<number> {
	let version: number | undefined;
	validLibVersions.forEach((obj) => {
		if (obj.distro == gazeboDistro) {
			version = obj.libVersion;
		}
	});
	if (version === undefined) {
		throw new Error(`No conda packages available for gz-${gazeboDistro}`);
	}
	return version;
}

/**
 * Install Gazebo on a Windows worker
 */
export async function runWindows(): Promise<void> {
	const gazeboDistros = await utils.getRequiredGazeboDistributions();

	for (const gazeboDistro of gazeboDistros) {
		const version = await getLibVersion(gazeboDistro);
		await conda.runConda([`gz-sim${version}`]);
	}
}
