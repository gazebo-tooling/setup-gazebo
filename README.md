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
        1. [Iterating on all Gazebo and Ubuntu combinations](#Iterating-on-all-gazebo-ubuntu-combinations)
        1. [Using pre-release and/or nightly Gazebo binaries](#Using-pre-release-and/or-nightly-Gazebo-binaries)
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
> The available GitHub-hosted runners can be found [here](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners/about-github-hosted-runners#standard-github-hosted-runners-for-public-repositories). It should be noted that the `ubuntu-24.04` runner image is a beta release. An alternative approach is using a docker container as shown in the following sections.


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
          uses: gazebo-tooling/setup-gazebo@v0.1.0
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
          uses: gazebo-tooling/setup-gazebo@v0.1.0
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
            - citadel
            - fortress
            - garden
            - harmonic
          include:
            # Gazebo Citadel (Dec 2019 - Dec 2024)
            - ubuntu_distribution: ubuntu-20.04
              gazebo_distribution: citadel

            # Gazebo Fortress (Sep 2021 - Sep 2026)
            - ubuntu_distribution: ubuntu-20.04
              gazebo_distribution: fortress

            # Gazebo Garden (Sep 2022 - Nov 2024)
            - ubuntu_distribution: ubuntu-20.04
              gazebo_distribution: garden

            # Gazebo Harmonic (Sep 2023 - Sep 2028)
            - ubuntu_distribution: ubuntu-22.04
              gazebo_distribution: harmonic
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4.0.2
          with:
            node-version: '20.x'
        - name: 'Check Gazebo installation on Ubuntu runner'
          uses: gazebo-tooling/setup-gazebo@v0.1.0
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
      - uses: actions/setup-node@v4.0.3
        with:
          node-version: '20.x'
      - name: 'Check Gazebo installation on Ubuntu runner'
        uses: gazebo-tooling/setup-gazebo@v0.1.0
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
            uses: gazebo-tooling/setup-gazebo@v0.1.0
            with:
              required-gazebo-distributions: 'harmonic'
              use-gazebo-prerelease: 'true'
              use-gazebo-nightly: 'true'
          - name: 'Test Gazebo installation'
            run: 'gz sim --versions'
```

### macOS

#### Setting up worker to install Gazebo on macOS

This workflow shows how to install Gazebo on a macOS worker. The action needs an input for `required-gazebo-distributions` parameter.

```yaml
  test_gazebo:
    runs-on: macos-13
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4.0.2
        with:
          node-version: '20.x'
      - name: 'Check Gazebo installation on MacOS runner'
        uses: gazebo-tooling/setup-gazebo@v0.1.0
        with:
          required-gazebo-distributions: 'harmonic'
      - name: 'Test Gazebo installation'
        run: 'gz sim --versions'
```

### Windows

This workflow shows how to install Gazebo on a Windows worker. The action requires a Conda package management system such as miniconda as all Gazebo packages are available on conda-forge. The action is run by specifying the distribution of choice in `required-gazebo-distributions` field.

#### Setting up worker to install Gazebo on Windows

```yaml
  test_gazebo:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4.0.2
        with:
          node-version: '20.x'
      - uses: conda-incubator/setup-miniconda@v3
      - name: 'Check Gazebo installation on Windows runner'
        uses: gazebo-tooling/setup-gazebo@v0.1.0
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
