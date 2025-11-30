# `setup-gazebo`

[![GitHub Action Status](https://github.com/gazebo-tooling/setup-gazebo/actions/workflows/test.yml/badge.svg)](https://github.com/gazebo-tooling/setup-gazebo)
[![License](https://img.shields.io/github/license/gazebo-tooling/setup-gazebo)](https://github.com/gazebo-tooling/setup-gazebo/blob/main/LICENSE)

This action sets up a Gazebo environment.

1. [Overview](#Overview)
1. [Supported platforms](#Supported-platforms)
1. [Tasks performed by the action](#Tasks-performed-by-the-action)
1. [Usage](#Usage)
    1. [Ubuntu](#Ubuntu)
        1. [Setting up worker and installing a compatible Gazebo and Ubuntu combination](#Setting-up-worker-and-installing-a-compatible-Gazebo-and-Ubuntu-combination)
        1. [Iterating on all Gazebo and Ubuntu combinations](#Iterating-on-all-Gazebo-and-Ubuntu-combinations)
        1. [Using prerelease and/or nightly Gazebo binaries](#Using-pre-release-andor-nightly-Gazebo-binaries)
        1. [Installing ROS 2 and Gazebo side-by-side along with `ros_gz`](#Installing-ROS-2-and-Gazebo-side-by-side-along-with-ros_gz)
    2. [macOS](#macOS)
        1. [Setting up worker to install Gazebo on macOS](#Setting-up-worker-to-install-Gazebo-on-macOS)
    3. [Windows](#Windows)
        1. [Setting up worker to install Gazebo on Windows](#Setting-up-worker-to-install-Gazebo-on-Windows)
1. [License](#License)

## Overview

The `setup-gazebo` GitHub Action sets up an environment to install a Gazebo release in the platform of choice. The action takes in the following parameters as input:
- `required-gazebo-distributions`: A **required** parameter that specifies the Gazebo distribution to be installed.
- `use-gazebo-prerelease`: An **optional** parameter to install pre-release binaries from OSRF repository.
- `use-gazebo-nightly`: An **optional** parameter to install nightly binaries from OSRF repository.
- `install-ros-gz`: An **optional** parameter to install the ROS 2 Gazebo bridge (`ros_gz`). This will require a previous ROS installation which can be done using the [`setup-ros`](https://github.com/ros-tooling/setup-ros) GitHub action. Installation of the `ros_gz` bridge supports the ROS official and ROS non-official (from packages.osrfoundation.org) variants following the [Installing Gazebo with ROS](https://gazebosim.org/docs/ionic/ros_installation/#summary-of-compatible-ros-and-gazebo-combinations) documentation.

## Supported platforms

`setup-gazebo` action works for all non-EOL Gazebo [releases] on the following platforms:
  - Ubuntu
  - macOS
  - Windows

## Tasks performed by the action

The `setup-gazebo` action performs the following tasks:
- On Ubuntu:
  - Installs `sudo` in case it is missing
  - Sets the locale to `en_US.UTF-8` and timezone to `UTC`
  - Install necessary APT packages
  - Registers the Open Robotics APT repository
- On macOS:
  - Tapping into the [osrf/homebrew-simulation](https://github.com/osrf/homebrew-simulation) using Homebrew
- On Windows:
  - Installing Gazebo using Conda from conda-forge

## Usage

See [action.yml](action.yml)

### Ubuntu

The `setup-gazebo` GitHub action can be run using GitHub-hosted Ubuntu runners or inside Ubuntu docker containers.

> [!NOTE]
>
> The available GitHub-hosted runners can be found [here](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories). An alternative approach is using a docker container as shown in the following sections.


#### Setting up worker and installing a compatible Gazebo and Ubuntu combination

This workflow shows how to spawn a job to install Gazebo on an Ubuntu distribution. The action needs an input in the `required-gazebo-distributions` field.

- *Default: Using GitHub-hosted runners systems*

  The following code snippet shows the installation of Gazebo Harmonic on Ubuntu Noble.

```yaml
  jobs:
    test_gazebo:
      runs-on: ubuntu-24.04
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Setup Gazebo'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: harmonic
        - name: 'Test Gazebo installation'
          run: 'gz sim --versions'
```

- *Using Ubuntu docker containers*

  The following code snippet shows the installation of Gazebo Harmonic on Ubuntu Noble.

```yaml
  jobs:
    test_gazebo:
      runs-on: ubuntu-latest
      container:
        image: ubuntu:noble
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Setup Gazebo'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: harmonic
        - name: 'Test Gazebo installation'
          run: 'gz sim --versions'
```

#### Iterating on all Gazebo and Ubuntu combinations

This workflow shows how to spawn one job per Gazebo release and iterates over all specified Gazebo and Ubuntu combinations. It is done by defining a `matrix` to iterate over jobs.

- *Default: Using GitHub-hosted runners systems*

```yaml
  jobs:
    test_gazebo:
      runs-on: ${{ matrix.ubuntu_distribution }}
      strategy:
        fail-fast: false
        matrix:
          gazebo_distribution:
            - fortress
            - harmonic
            - ionic
          include:
            # Gazebo Fortress (Sep 2021 - Sep 2026)
            - ubuntu_distribution: ubuntu-20.04
              gazebo_distribution: fortress

            # Gazebo Harmonic (Sep 2023 - Sep 2028)
            - ubuntu_distribution: ubuntu-22.04
              gazebo_distribution: harmonic

            # Gazebo Ionic (Sep 2024 - Sep 2026)
            - ubuntu_distribution: ubuntu-24.04
              gazebo_distribution: ionic
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Check Gazebo installation on Ubuntu runner'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
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

- *Using Ubuntu docker containers*

```yaml
  jobs:
    test_gazebo:
      runs-on: ubuntu-latest
      container:
        image: ${{ matrix.docker_image }}
      strategy:
        fail-fast: false
        matrix:
          gazebo_distribution:
            - fortress
            - harmonic
            - ionic
          include:
            # Gazebo Fortress (Sep 2021 - Sep 2026)
            - docker_image: ubuntu:focal
              gazebo_distribution: fortress

            # Gazebo Harmonic (Sep 2023 - Sep 2028)
            - docker_image: ubuntu:jammy
              gazebo_distribution: harmonic

            # Gazebo Ionic (Sep 2024 - Sep 2026)
            - docker_image: ubuntu:noble
              gazebo_distribution: ionic
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.3
          with:
            node-version: '20.x'
        - name: 'Check Gazebo installation on Ubuntu runner'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
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

#### Using pre-release and/or nightly Gazebo binaries

This workflow shows how to use binaries from [pre-release] or [nightly] Gazebo repositories instead of the stable repository by setting the `use-gazebo-prerelease` or `use-gazebo-nightly` to `true`.

```yaml
  jobs:
    test_gazebo:
      runs-on: ubuntu-latest
      container:
        image: ubuntu:noble
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Check Gazebo installation on Ubuntu runner'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'ionic'
            use-gazebo-prerelease: 'true'
            use-gazebo-nightly: 'true'
        - name: 'Test Gazebo installation'
          run: 'gz sim --versions'
```

#### Installing ROS 2 and Gazebo side-by-side along with `ros_gz`

This workflow shows how to install ROS 2 using the GitHub action `ros-tooling/setup-ros` along with Gazebo installed using `setup-gazebo`. The `ros-gz` package can be installed by setting the input parameter `install-ros-gz` to the required ROS 2 distributions.

Starting with ROS 2 Jazzy, Gazebo is also available to be installed from ROS packages via [vendor packages]. When using `install-ros-gz` this action will check for availability of these Gazebo vendor packages and install them if available for the specified ROS 2 distribution. Only the default (recommended) Gazebo release is currently available for the ROS 2 releases using the vendor packages (i.e if ROS 2 Jazzy is used, only Gazebo Harmonic is the valid option). More information on vendor packages can be found in the [official documentation].

- *Installing a ROS-Gazebo combination*

This example shows the installation of ROS 2 Humble and Gazebo Fortress which is a supported ROS-Gazebo combination.

```yaml
  jobs:
    test_gazebo:
      env:
        ROS_DISTROS: 'humble'
      runs-on: ubuntu-latest
      container:
        image: ubuntu:jammy
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.3
          with:
            node-version: '20.x'
        - name: 'Install ROS 2 Humble'
          uses: ros-tooling/setup-ros@v0.7
          with:
            required-ros-distributions: ${{ env.ROS_DISTROS }}
        - name: 'Install Gazebo Fortress with ros_gz'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'fortress'
            install-ros-gz: ${{ env.ROS_DISTROS }}
        - name: Test Humble ros_gz installation
          run: |
            source /opt/ros/humble/setup.bash
            ros2 pkg list | grep ros_gz
            ign gazebo --version | grep 'version 6.*'
```

- *Installing Gazebo through vendor packages*

This example shows the installation of ROS 2 Jazzy and Gazebo Harmonic which is a recommended ROS-Gazebo combination. In this case, Gazebo libraries are will be installed as ROS packages.

```yaml
  jobs:
    test_gazebo:
      env:
        ROS_DISTROS: 'jazzy'
      runs-on: ubuntu-latest
      container:
        image: ubuntu:noble
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.3
          with:
            node-version: '20.x'
        - name: 'Install ROS 2 Jazzy'
          uses: ros-tooling/setup-ros@v0.7
          with:
            required-ros-distributions: ${{ env.ROS_DISTROS }}
        - name: 'Install Gazebo with ros_gz'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'harmonic'
            install-ros-gz: ${{ env.ROS_DISTROS }}
        - name: Test Jazzy ros_gz installation
          run: |
            source /opt/ros/jazzy/setup.bash
            ! [ $(apt list --installed gz-harmonic) ]
            ros2 pkg list | grep ros_gz
            gz sim --version | grep -E 'version 8\.[0-9]+\.[0-9]+'
```

- *Installing ROS 2 Kilted with Gazebo Ionic*

This example shows the installation of ROS 2 Kilted and Gazebo Ionic. Kilted uses vendor packages like Jazzy, so Gazebo libraries will be installed as ROS packages.

```yaml
  jobs:
    test_gazebo:
      env:
        ROS_DISTROS: 'kilted'
      runs-on: ubuntu-latest
      container:
        image: ubuntu:noble
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.3
          with:
            node-version: '20.x'
        - name: 'Install ROS 2 Kilted'
          uses: ros-tooling/setup-ros@v0.7
          with:
            required-ros-distributions: ${{ env.ROS_DISTROS }}
        - name: 'Install Gazebo with ros_gz'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'ionic'
            install-ros-gz: ${{ env.ROS_DISTROS }}
        - name: Test Kilted ros_gz installation
          run: |
            source /opt/ros/kilted/setup.bash
            ! [ $(apt list --installed gz-ionic) ]
            ros2 pkg list | grep ros_gz
            gz sim --version | grep -E 'version 9\.[0-9]+\.[0-9]+'
```

- *Installing ROS 2 Rolling with Gazebo Jetty*

This example shows the installation of ROS 2 Rolling and Gazebo Jetty. Rolling uses vendor packages like Jazzy and Kilted, so Gazebo libraries will be installed as ROS packages.

```yaml
  jobs:
    test_gazebo:
      env:
        ROS_DISTROS: 'rolling'
      runs-on: ubuntu-latest
      container:
        image: ubuntu:noble
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.3
          with:
            node-version: '20.x'
        - name: 'Install ROS 2 Rolling'
          uses: ros-tooling/setup-ros@v0.7
          with:
            required-ros-distributions: ${{ env.ROS_DISTROS }}
        - name: 'Install Gazebo with ros_gz'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'jetty'
            install-ros-gz: ${{ env.ROS_DISTROS }}
        - name: Test Rolling ros_gz installation
          run: |
            source /opt/ros/rolling/setup.bash
            ! [ $(apt list --installed gz-jetty) ]
            ros2 pkg list | grep ros_gz
            gz sim --version | grep 'version 10.[0-9*].[0-9*]'
```

### macOS

#### Setting up worker to install Gazebo on macOS

This workflow shows how to install Gazebo on a macOS worker using the Homebrew package manager which is installed by the action. To run, this action needs an input for `required-gazebo-distributions` parameter.

```yaml
  jobs:
    test_gazebo:
      runs-on: macos-15
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Check Gazebo installation on MacOS runner'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'harmonic'
        - name: 'Test Gazebo installation'
          run: 'gz sim --versions'
```

### Windows

This workflow shows how to install Gazebo on a Windows worker. The action requires a Conda package management system such as miniconda as all Gazebo packages are available on conda-forge. The action is run by specifying the distribution of choice in `required-gazebo-distributions` field.

#### Setting up worker to install Gazebo on Windows

```yaml
  jobs:
    test_gazebo:
      runs-on: windows-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - uses: conda-incubator/setup-miniconda@v3
        - name: 'Check Gazebo installation on Windows runner'
          uses: gazebo-tooling/setup-gazebo@v0.3.0
          with:
            required-gazebo-distributions: 'harmonic'
        - name: 'Test Gazebo installation'
          shell: pwsh
          run: |
            conda activate
            gz sim --versions
```

## License

The scripts and documentation in this project are released under the [Apache 2](LICENSE) license.

[releases]: https://gazebosim.org/docs/all/releases
[officially]: https://gazebosim.org/docs/harmonic/releases#supported-platforms
[best-effort]: https://gazebosim.org/docs/harmonic/releases#supported-platforms
[pre-release]: https://packages.osrfoundation.org/gazebo/ubuntu-prerelease/
[nightly]: https://packages.osrfoundation.org/gazebo/ubuntu-nightly/
[vendor packages]: https://gazebosim.org/docs/ionic/ros_installation/#ros-2-gazebo-vendor-packages
[official documentation]: https://gazebosim.org/docs/ionic/ros2_gz_vendor_pkgs/
