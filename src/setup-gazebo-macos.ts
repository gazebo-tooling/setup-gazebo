import * as utils from "./utils";
import * as brew from "./package_manager/brew";

async function configureBrew() {
	await utils.exec("/bin/bash", [
		"-c",
		"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)",
	]);
}

async function addBrewRepo() {
	await utils.exec("brew", ["tap", "osrf/simulation"]);
}

export async function runMacOs() {
	configureBrew();

	addBrewRepo();

	for (const gazeboDistro of utils.getRequiredGazeboDistributions()) {
		await brew.runBrew([`gz-${gazeboDistro}`]);
	}
}
