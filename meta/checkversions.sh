#! /bin/bash
# checks that versions in package.json and manifest.json match
[ $(jq '.version' package.json) == $(jq '.version' addon/manifest.json) ]

