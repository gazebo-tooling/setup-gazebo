import * as core from "@actions/core";
import * as linux from "./setup-gazebo-linux";
import * as macOs from "./setup-gazebo-macos";

async function run() {
	try {
		const platform = process.platform;
		if (platform === "darwin") {
			macOs.runMacOs();
		} else if (platform === "linux") {
			linux.runLinux();
		} else {
			throw new Error(`Unsupported platform ${platform}`);
		}
	} catch (error) {
		let errorMessage = "Unknown error";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		core.setFailed(errorMessage);
	}
}

run();
