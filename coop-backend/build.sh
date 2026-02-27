#!/bin/bash
# Uses Aliyun mirror (see .mvn/settings.xml) when Maven Central is unreachable
exec mvn -s .mvn/settings.xml "$@"
