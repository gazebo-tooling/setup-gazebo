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
>
> `setup-gazebo` is under active development. This action is currently being tested, and has not been released to GitHub Marketplace yet.
>
> This action can be used with `gazebo-tooling/setup-gazebo@main`. But it needs to be used with caution!
>
> Instead, it is advisable to use a full commit hash in your workflows - `gazebo-tooling/setup-gazebo@<full_commit_hash>`.

### Setting up worker and installing a compatible Gazebo and Ubuntu combination

This workflow shows how to spawn a job to install Gazebo using the action. The action needs an input in the `required-gazebo-distributions` field and requires a Docker configuration to run seamlessly.

The following code snippet shows the installation of Gazebo Garden on Ubuntu Focal.

```yaml
  jobs:
    build_docker:
      runs-on: ubuntu-latest
      container:
        image: ubuntu:focal
      steps:
        - name: 'Setup Gazebo'
          uses: gazebo-tooling/setup-gazebo@<full_commit_hash>
          with:
            required-gazebo-distributions: garden
        -run: 'gz sim --versions'
```

### Iterating on all Gazebo and Ubuntu combinations

This workflow shows how to spawn one job per Gazebo release. It iterates over all specified Gazebo and Ubuntu combinations using Docker. For example, Gazebo Garden requires Ubuntu Focal while Gazebo Harmonic requires Ubuntu Jammy.

```yaml
  test_gazebo:
    runs-on: ubuntu-latest
    container:
      image: ${{ matrix.docker_image }}
    strategy:
      fail-fast: false
      matrix:
        gazebo_distribution:
          - citadel
          - fortress
          - garden
          - harmonic
        include:
          # Gazebo Citadel (Dec 2019 - Dec 2024)
          - docker_image: ubuntu:focal
            gazebo_distribution: citadel

          # Gazebo Fortress (Sep 2021 - Sep 2026)
          - docker_image: ubuntu:focal
            gazebo_distribution: fortress

          # Gazebo Garden (Sep 2022 - Nov 2024)
          - docker_image: ubuntu:focal
            gazebo_distribution: garden

          # Gazebo Harmonic (Sep 2023 - Sep 2028)
          - docker_image: ubuntu:jammy
            gazebo_distribution: harmonic
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4.0.2
        with:
          node-version: '20.x'
      - name: 'Check Gazebo installation on Ubuntu runner'
        uses: gazebo-tooling/setup-gazebo@<full_commit_hash>
        with:
          required-gazebo-distributions: ${{ matrix.gazebo_distribution }}
      - name: 'Test Gazebo installation'
        run: |
          if command -v ign > /dev/null; then
            ign gazebo --versions
          elif command -v gz > /dev/null; then
            gz sim --versions
          else
            echo "Neither ign nor gz command found"
            exit 1
          fi
```

## License

The scripts and documentation in this project are released under the [Apache 2](LICENSE) license.

[releases]: https://gazebosim.org/docs/all/releases