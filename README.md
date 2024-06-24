# `setup-gazebo`

This action sets up a Gazebo release inside a Linux environment.

1. [Overview](#Overview)
1. [Supported platforms](#Supported-platforms)
1. [Tasks performed by the action](#Tasks-performed-by-the-action)
1. [Usage](#Usage)
    1. [Ubuntu](#Ubuntu)
        1. [Setting up worker and installing a compatible Gazebo and Ubuntu combination](#Setting-up-worker-and-installing-a-compatible-Gazebo-and-Ubuntu-combination)
        1. [Iterating on all Gazebo and Ubuntu combinations](#Iterating-on-all-gazebo-ubuntu-combinations)
        1. [Using pre-release and/or nightly Gazebo binaries](#Using-pre-release-and/or-nightly-Gazebo-binaries)
    2. [MacOS](#MacOS)
        1. [Setting up worker to install Gazebo on macOS](#Setting-up-worker-to-install-Gazebo-on-macOS)
1. [License](#License)

## Overview

The `setup-gazebo` GitHub Action sets up an environment to install a Gazebo release in a compatible Ubuntu distribution. The action requires a Gazebo release name as an input for the `required-gazebo-distributions` field.

It is recommended to use the `setup-gazebo` action inside a Docker container due to the flaky nature of GitHub actions Linux workers.

## Supported platforms

`setup-gazebo` action works for all non-EOL Gazebo [releases] on the following platforms:
  - Ubuntu
  - macOS

## Tasks performed by the action

The `setup-gazebo` action performs the following tasks:
- On Ubuntu:
  - Installs `sudo` in case it is missing
  - Sets the locale to `en_US.UTF-8` and timezone to `UTC`
  - Install necessary APT packages
  - Registers the Open Robotics APT repository
- On macOS:
  - Tapping into the [osrf/homebrew-simulation](https://github.com/osrf/homebrew-simulation) using Homebrew
## Usage

See [action.yml](action.yml)

> [!WARNING]
>
> `setup-gazebo` is under active development. This action is currently being tested, and has not been released to GitHub Marketplace yet.
>
> When using this action in your workflows, it is advisable to use a full commit hash as a suffix - `gazebo-tooling/setup-gazebo@<full_commit_hash>`.
>
> This action can also be used with the `main` branch - `gazebo-tooling/setup-gazebo@main`. Use with caution as compatibility is not guaranteed!

### Ubuntu

#### Setting up worker and installing a compatible Gazebo and Ubuntu combination

This workflow shows how to spawn a job to install Gazebo using the action. The action needs an input in the `required-gazebo-distributions` field and requires a Docker configuration to run seamlessly.

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
          uses: gazebo-tooling/setup-gazebo@<full_commit_hash>
          with:
            required-gazebo-distributions: harmonic
        - name: 'Test Gazebo installation'
          run: 'gz sim --versions'
```

#### Iterating on all Gazebo and Ubuntu combinations

This workflow shows how to spawn one job per Gazebo release. It iterates over all specified Gazebo and Ubuntu combinations using Docker. For example, Gazebo Garden is paired with Ubuntu Focal while Gazebo Harmonic is paired with Ubuntu Jammy.

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
            uses: gazebo-tooling/setup-gazebo@<full_commit_hash>
            with:
              required-gazebo-distributions: 'harmonic'
              use-gazebo-prerelease: 'true'
              use-gazebo-nightly: 'true'
          - name: 'Test Gazebo installation'
            run: 'gz sim --versions'
```

### MacOS

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
        uses: gazebo-tooling/setup-gazebo@<full_commit_hash>
        with:
          required-gazebo-distributions: 'harmonic'
      - name: 'Test Gazebo installation'
        run: 'gz sim --versions'
```

## License

The scripts and documentation in this project are released under the [Apache 2](LICENSE) license.

[releases]: https://gazebosim.org/docs/all/releases
[officially]: https://gazebosim.org/docs/harmonic/releases#supported-platforms
[best-effort]: https://gazebosim.org/docs/harmonic/releases#supported-platforms
[pre-release]: https://packages.osrfoundation.org/gazebo/ubuntu-prerelease/
[nightly]: https://packages.osrfoundation.org/gazebo/ubuntu-nightly/