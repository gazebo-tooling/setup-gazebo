import * as core from "@actions/core";
import * as linux from "./setup-gazebo-linux";

async function run() {
	try {
		linux.runLinux();
	} catch (error) {
		let errorMessage = "Unknown error";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		core.setFailed(errorMessage);
	}
}

run();
