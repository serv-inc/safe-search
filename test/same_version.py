#! /usr/bin/env python3
"""compares versions of
- package.json,
- package lock file,
- addon manifest"""

import json


def _from_changelog():
    for line in open("README.org"):
        if line.startswith("** "):
            break
    return line[3:].replace("\n", "").split(":")[0]


def _compare(firstname, first, secondname, second):
    """compare two entries"""
    assert first == second, "{} version ({}) and {} version ({}) differ".format(
        firstname, first, secondname, second
    )


def validate():
    """versions need to be the same"""
    changelog_version = _from_changelog()
    manifest_version = json.load(open("addon/manifest.json"))["version"]
    package_version = json.load(open("package.json"))["version"]

    _compare("changelog", changelog_version, "manifest", manifest_version)
    _compare("changelog", changelog_version, "package", package_version)


if __name__ == "__main__":
    validate()
