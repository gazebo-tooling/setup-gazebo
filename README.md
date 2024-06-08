# `setup-gazebo`

This action sets up a Gazebo release inside a Linux environment.

1. [Overview](#Overview)
1. [Supported Gazebo releases](#Supported-Gazebo-releases)
1. [Tasks performed by the action](#Tasks-performed-by-the-action)
1. [Usage](#Usage)
    1. [Setting up worker and installing a compatible Gazebo and Ubuntu combination](#Setting-up-worker-and-installing-a-compatible-Gazebo-and-Ubuntu-combination)
    1. [Iterating on all Gazebo and Ubuntu combinations](#Iterating-on-all-gazebo-ubuntu-combinations)
1. [License](#License)

## Overview

The `setup-gazebo` GitHub Action sets up an environment to install a Gazebo release in a compatible Ubuntu distribution. The action requires a Gazebo release name as an input for the `required-gazebo-distributions` field.

It is recommended to use the `setup-gazebo` action inside a Docker container.

## Supported Gazebo releases

This action currently supports the installation of four Gazebo [releases]. The following table lists the release name, EOL date and the supported operating system.

| Release Name | EOL Date | Supported OS |
| ------------ | -------- | ------------ |
| Harmonic     | Sep 2028 | Ubuntu Jammy |
| Garden       | Nov 2024 | Ubuntu Focal |
| Fortress     | Sep 2026 | Ubuntu Focal |
| Citadel      | Dec 2024 | Ubuntu Focal |

## Tasks performed by the action

The `setup-gazebo` action performs the following tasks on an Ubuntu system:
- Installs `sudo` in case it is missing
- Sets the locale to `en_US.UTF-8` and timezone to `UTC`
- Install necessary APT packages
- Registers the Open Robotics APT repository

## Usage

See [action.yml](action.yml)

> [!WARNING]
> `setup-gazebo` is under active development. This action is currently being tested, and not been released to GitHub Marketplace yet.
Use `gazebo-tooling/setup-gazebo@main` with caution!
Instead, it is advisable to use a full commit hash in your workflows -  `gazebo-tooling/setup-gazebo@<full_commit_hash>`

### Setting up worker and installing a compatible Gazebo and Ubuntu combination

### Iterating on all Gazebo and Ubuntu combinations

## License

The scripts and documentation in this project are released under the [Apache 2](LICENSE) license.

[releases]: https://gazebosim.org/docs/all/releases