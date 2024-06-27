import * as utils from "./utils";
import * as conda from "./package_manager/conda";

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

export async function runWindows(): Promise<void> {
	await conda.createCondaEnv();

	for (const gazeboDistro of utils.getRequiredGazeboDistributions()) {
		const version = await getLibVersion(gazeboDistro);
		await conda.runConda([`gz-sim${version}`]);
	}
}
