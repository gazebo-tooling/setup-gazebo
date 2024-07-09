import * as utils from "./utils";
import * as brew from "./package_manager/brew";

/**
 * Tap into OSRF repository
 */
async function addBrewRepo(): Promise<void> {
	await utils.exec("brew", ["tap", "osrf/simulation"]);
}

/**
 * Overwrite existing python installation
 *
 * This is a precautionary step as the installation occasionally
 * fails due to a brew Python linking error
 * See https://github.com/Homebrew/homebrew-core/issues/165793#issuecomment-1991817938
 */
export async function overwritePythonInstall(): Promise<void> {
	await utils.exec("sudo", [
		"rm",
		"-rf",
		"/Library/Frameworks/Python.framework/",
	]);

	const packageName: string = "python3";
	await brew.runBrew(["--force", packageName]);
	await brew.unlinkPackage(packageName);
	await brew.linkPackage(packageName);
}

/**
 * Install Gazebo on MacOS worker
 */
export async function runMacOs(): Promise<void> {
	await addBrewRepo();

	await overwritePythonInstall();

	for (const gazeboDistro of utils.getRequiredGazeboDistributions()) {
		await brew.runBrew([`gz-${gazeboDistro}`]);
	}
}
