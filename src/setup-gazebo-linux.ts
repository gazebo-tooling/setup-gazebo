import * as core from "@actions/core";
import * as io from "@actions/io";

import * as apt from "./package_manager/apt";
import * as utils from "./utils";

/**
 * Configure basic OS stuff.
 */
async function configOs(): Promise<void> {
	// When this action runs in a Docker image, sudo may be missing.
	// This installs sudo to avoid having to handle both cases (action runs as
	// root, action does not run as root) everywhere in the action.
	try {
		await io.which("sudo", true);
	} catch (err) {
		await utils.exec("apt-get", ["update"]);
		await utils.exec("apt-get", [
			"install",
			"--no-install-recommends",
			"--quiet",
			"--yes",
			"sudo",
		]);
	}

	await utils.exec("sudo", ["bash", "-c", "echo 'Etc/UTC' > /etc/timezone"]);
	await utils.exec("sudo", ["apt-get", "update"]);

	// Install tools required to configure the worker system.
	await apt.runAptGetInstall([
		"wget",
		"curl",
		"gnupg2",
		"locales",
		"lsb-release",
		"ca-certificates",
		"xvfb",
	]);

	// Select a locale supporting Unicode.
	await utils.exec("sudo", ["locale-gen", "en_US", "en_US.UTF-8"]);
	core.exportVariable("LANG", "en_US.UTF-8");

	// Enforce UTC time for consistency.
	await utils.exec("sudo", ["bash", "-c", "echo 'Etc/UTC' > /etc/timezone"]);
	await utils.exec("sudo", [
		"ln",
		"-sf",
		"/usr/share/zoneinfo/Etc/UTC",
		"/etc/localtime",
	]);
	await apt.runAptGetInstall(["tzdata"]);
}

/**
 * Add OSRF APT repository key.
 *
 * This is necessary even when building from source to install colcon, vcs, etc.
 */
async function addAptRepoKey(): Promise<void> {
	await utils.exec("sudo", [
		"bash",
		"-c",
		`wget https://packages.osrfoundation.org/gazebo.gpg -O \
    /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg`,
	]);
}

/**
 * Add OSRF APT repository.
 *
 * @param ubuntuCodename the Ubuntu version codename
 */
async function addAptRepo(ubuntuCodename: string): Promise<void> {
	await utils.exec("sudo", [
		"bash",
		"-c",
		`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] \
    http://packages.osrfoundation.org/gazebo/ubuntu-stable ${ubuntuCodename} main" | \
    sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null`,
	]);
	const unstableRepos = utils.checkForUnstableAptRepos();
	for (const unstableRepo of unstableRepos) {
		await utils.exec("sudo", [
			"bash",
			"-c",
			`echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] \
      http://packages.osrfoundation.org/gazebo/ubuntu-${unstableRepo} ${ubuntuCodename} main" | \
      sudo tee /etc/apt/sources.list.d/gazebo-${unstableRepo}.list > /dev/null`,
		]);
	}
	await utils.exec("sudo", ["apt-get", "update"]);
}

async function launchVirtualDisplay(): Promise<void> {
	if (!utils.checkLaunchVirtualDisplay()) {
		return;
	}
	await utils.exec("Xvfb", [
		":1",
		"-ac",
		"-noreset",
		"-core",
		"-screen",
		"0",
		"1280x1024x24",
		"&",
		"",
	]);
	await utils.exportVariables(["DISPLAY=:1.0", "MESA_GL_VERSION_OVERRIDE=3.3"]);
}

/**
 * Install Gazebo on a Linux worker.
 */
export async function runLinux(): Promise<void> {
	await configOs();
	await addAptRepoKey();

	// Add repo according to Ubuntu version
	const ubuntuCodename = await utils.determineDistribCodename();
	await addAptRepo(ubuntuCodename);

	for (const gazeboDistro of utils.getRequiredGazeboDistributions()) {
		await apt.runAptGetInstall([`gz-${gazeboDistro}`]);
	}

	await launchVirtualDisplay();
}
