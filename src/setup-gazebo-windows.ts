import * as utils from "./utils";

export async function runWindows(): Promise<void> {
	// await conda.runConda(["gz-sim8"]);
	await utils.exec("conda", [
		"search",
		"libgz-sim*",
		"--channel",
		"conda-forge",
	]);
	await utils.exec("conda", ["install", "gz-sim8", "--channel", "conda-forge"]);
}
