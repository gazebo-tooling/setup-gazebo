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
		jest.spyOn(utils, "checkForROSGz").mockReturnValue([]);
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
		jest.spyOn(utils, "checkForROSGz").mockReturnValue([]);
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
		await expect(utils.validateDistro(["fortress"])).resolves.not.toThrow();
		await expect(utils.validateDistro(["harmonic"])).resolves.not.toThrow();
		await expect(utils.validateDistro(["ionic"])).resolves.not.toThrow();
		await expect(utils.validateDistro(["jetty"])).resolves.not.toThrow();
		await expect(
			utils.validateDistro(["fortress", "harmonic"]),
		).resolves.not.toThrow();
		await expect(
			utils.validateDistro(["ionic", "jetty"]),
		).resolves.not.toThrow();
	});
	it("test invalid distro", async () => {
		await expect(utils.validateDistro(["acropolis"])).rejects.toThrow();
		await expect(utils.validateDistro(["blueprint"])).rejects.toThrow();
		await expect(utils.validateDistro(["dome"])).rejects.toThrow();
		await expect(utils.validateDistro(["edifice"])).rejects.toThrow();
		await expect(utils.validateDistro(["garden"])).rejects.toThrow();
		await expect(utils.validateDistro(["doesNotExist"])).rejects.toThrow();
		await expect(utils.validateDistro(["dome", "fortress"])).rejects.toThrow();
		await expect(
			utils.validateDistro(["citadel", "edifice", "harmonic"]),
		).rejects.toThrow();
	});
});

describe("validate ROS 2 distribution test", () => {
	it("test valid distro", async () => {
		await expect(utils.validateROSDistro(["humble"])).toBe(true);
		await expect(utils.validateROSDistro(["jazzy"])).toBe(true);
		await expect(utils.validateROSDistro(["kilted"])).toBe(true);
		await expect(utils.validateROSDistro(["rolling"])).toBe(true);
		await expect(utils.validateROSDistro(["humble", "jazzy"])).toBe(true);
		await expect(utils.validateROSDistro(["kilted", "rolling"])).toBe(true);
	});
	it("test invalid distro", async () => {
		await expect(utils.validateROSDistro(["noetic"])).toBe(false);
		await expect(utils.validateROSDistro(["foxy"])).toBe(false);
		await expect(utils.validateROSDistro(["galactic"])).toBe(false);
		await expect(utils.validateROSDistro(["iron"])).toBe(false);
		await expect(utils.validateROSDistro(["doesNotExist"])).toBe(false);
		await expect(utils.validateROSDistro(["noetic", "humble"])).toBe(false);
		await expect(utils.validateROSDistro(["foxy", "galactic", "jazzy"])).toBe(
			false,
		);
	});
});

describe("workflow test with incompatible Ubuntu combination", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("harmonic");
		jest.spyOn(utils, "checkForROSGz").mockReturnValue([]);
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
		jest.spyOn(utils, "checkForROSGz").mockReturnValue([]);
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
	it("test ros_gz output package names list", async () => {
		await expect(
			utils.generateROSGzAptPackageNames(["humble", "jazzy"], ["harmonic"]),
		).toEqual(["gz-harmonic", "ros-humble-ros-gzharmonic", "ros-jazzy-ros-gz"]);
		await expect(
			utils.generateROSGzAptPackageNames(["humble"], ["fortress"]),
		).toEqual(["gz-fortress", "ros-humble-ros-gz"]);
		await expect(
			utils.generateROSGzAptPackageNames(["jazzy"], ["harmonic"]),
		).toEqual(["ros-jazzy-ros-gz"]);
		await expect(
			utils.generateROSGzAptPackageNames(["kilted"], ["ionic"]),
		).toEqual(["ros-kilted-ros-gz"]);
		await expect(
			utils.generateROSGzAptPackageNames(["rolling"], ["jetty"]),
		).toEqual(["ros-rolling-ros-gz"]);
	});
});
