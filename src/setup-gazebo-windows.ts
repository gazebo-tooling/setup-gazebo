import * as conda from "./package_manager/conda";

export async function runWindows(): Promise<void> {
	await conda.runConda(["gz-sim8"]);
}
