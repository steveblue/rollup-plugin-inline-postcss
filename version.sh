#!/bin/sh

json-bump package.json --$SEMVER --spaces=2
json-bump src/package.json --$SEMVER --spaces=2
