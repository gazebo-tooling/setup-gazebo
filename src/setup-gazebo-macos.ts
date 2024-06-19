import * as utils from "./utils";
import * as brew from "./package_manager/brew";

/**
 * Tap into OSRF repository
 */
async function addBrewRepo() {
	await utils.exec("brew", ["tap", "osrf/simulation"]);
}

/**
 * Install Gazebo on MacOS worker
 */
export async function runMacOs() {
	await addBrewRepo();

	for (const gazeboDistro of utils.getRequiredGazeboDistributions()) {
		await brew.runBrew([`gz-${gazeboDistro}`]);
	}
}
