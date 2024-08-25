import * as core from "@actions/core";
import * as exec from "@actions/exec";

import * as linux from "../src/setup-gazebo-linux";
import * as macOs from "../src/setup-gazebo-macos";
import * as windows from "../src/setup-gazebo-windows";
import * as utils from "../src/utils";

describe("workflow test without input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow without input", async () => {
		await expect(linux.runLinux()).rejects.toThrow();
	});

	it("run macOS workflow without input", async () => {
		await expect(macOs.runMacOs()).rejects.toThrow();
	});

	it("run Windows workflow without input", async () => {
		await expect(windows.runWindows()).rejects.toThrow();
	});
});

describe("workflow test with a invalid distro input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("dome");
		jest.spyOn(utils, "checkForRosGz").mockReturnValue([]);
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with invalid distro input", async () => {
		await expect(linux.runLinux()).rejects.toThrow();
	});

	it("run macOS workflow with invalid distro input", async () => {
		await expect(macOs.runMacOs()).rejects.toThrow();
	});

	it("run Windows workflow with invalid distro input", async () => {
		await expect(windows.runWindows()).rejects.toThrow();
	});
});

describe("workflow test with a valid distro input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("harmonic");
		jest.spyOn(utils, "checkForRosGz").mockReturnValue([]);
		jest
			.spyOn(utils, "determineDistribCodename")
			.mockReturnValue(Promise.resolve("jammy"));
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with valid distro input", async () => {
		await expect(linux.runLinux()).resolves.not.toThrow();
	});

	it("run macOS workflow with valid distro input", async () => {
		await expect(macOs.runMacOs()).resolves.not.toThrow();
	});

	it("run Windows workflow with valid distro input", async () => {
		await expect(windows.runWindows()).resolves.not.toThrow();
	});
});

describe("validate Gazebo distribution test", () => {
	it("test valid distro", async () => {
		await expect(utils.validateDistro(["citadel"])).toBe(true);
		await expect(utils.validateDistro(["fortress"])).toBe(true);
		await expect(utils.validateDistro(["garden"])).toBe(true);
		await expect(utils.validateDistro(["harmonic"])).toBe(true);
		await expect(utils.validateDistro(["fortress", "garden"])).toBe(true);
	});
	it("test invalid distro", async () => {
		await expect(utils.validateDistro(["acropolis"])).toBe(false);
		await expect(utils.validateDistro(["blueprint"])).toBe(false);
		await expect(utils.validateDistro(["dome"])).toBe(false);
		await expect(utils.validateDistro(["edifice"])).toBe(false);
		await expect(utils.validateDistro(["doesNotExist"])).toBe(false);
		await expect(utils.validateDistro(["dome", "fortress"])).toBe(false);
		await expect(utils.validateDistro(["citadel", "edifice", "harmonic"])).toBe(
			false,
		);
	});
});

describe("validate ROS 2 distribution test", () => {
	it("test valid distro", async () => {
		await expect(utils.validateRosDistro(["humble"])).toBe(true);
		await expect(utils.validateRosDistro(["iron"])).toBe(true);
		await expect(utils.validateRosDistro(["jazzy"])).toBe(true);
		await expect(utils.validateRosDistro(["rolling"])).toBe(true);
		await expect(utils.validateRosDistro(["humble", "jazzy"])).toBe(true);
	});
	it("test invalid distro", async () => {
		await expect(utils.validateRosDistro(["noetic"])).toBe(false);
		await expect(utils.validateRosDistro(["foxy"])).toBe(false);
		await expect(utils.validateRosDistro(["galactic"])).toBe(false);
		await expect(utils.validateRosDistro(["doesNotExist"])).toBe(false);
		await expect(utils.validateRosDistro(["noetic", "humble"])).toBe(false);
		await expect(utils.validateRosDistro(["foxy", "galactic", "jazzy"])).toBe(
			false,
		);
	});
});

describe("workflow test with incompatible Ubuntu combination", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("harmonic");
		jest.spyOn(utils, "checkForRosGz").mockReturnValue([]);
		jest
			.spyOn(utils, "determineDistribCodename")
			.mockReturnValue(Promise.resolve("focal"));
	});
	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with incompatible Ubuntu combination", async () => {
		await expect(linux.runLinux()).rejects.toThrow();
	});
});

describe("check for unstable repositories input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest
			.spyOn(utils, "checkForUnstableAptRepos")
			.mockReturnValueOnce(["prerelease"]);
		jest
			.spyOn(utils, "checkForUnstableAptRepos")
			.mockReturnValueOnce(["nightly"]);
		jest
			.spyOn(utils, "checkForUnstableAptRepos")
			.mockReturnValueOnce(["prerelease", "nightly"]);
		jest.spyOn(core, "getInput").mockReturnValue("harmonic");
		jest.spyOn(utils, "checkForRosGz").mockReturnValue([]);
		jest
			.spyOn(utils, "determineDistribCodename")
			.mockReturnValue(Promise.resolve("jammy"));
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with unstable repo prerelease", async () => {
		await expect(linux.runLinux()).resolves.not.toThrow();
	});

	it("run Linux workflow with unstable repo nightly", async () => {
		await expect(linux.runLinux()).resolves.not.toThrow();
	});

	it("run Linux workflow with both unstable repos", async () => {
		await expect(linux.runLinux()).resolves.not.toThrow();
	});
});

describe("generate APT package names for ros_gz", () => {
	it("test ROS 2 and gazebo combination", async () => {
		await expect(
			utils.generateRosAptPackageNames(["rolling", "iron"], ["harmonic"]),
		).toEqual(["ros-rolling-ros-gz", "ros-iron-ros-gzharmonic"]);
	});
});
