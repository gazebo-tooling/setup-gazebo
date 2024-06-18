import * as core from "@actions/core";
import * as exec from "@actions/exec";

import * as linux from "../src/setup-gazebo-linux";
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
});

describe("workflow test with a invalid distro input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("dome");
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with invalid distro input", async () => {
		await expect(linux.runLinux()).rejects.toThrow();
	});
});

describe("workflow test with a valid distro input", () => {
	beforeAll(() => {
		jest.spyOn(exec, "exec").mockImplementation(jest.fn());
		jest.spyOn(core, "getInput").mockReturnValue("harmonic");
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	it("run Linux workflow with valid distro input", async () => {
		await expect(linux.runLinux()).resolves.not.toThrow();
	});
});

describe("validate distribution test", () => {
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
