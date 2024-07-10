#!/bin/sh -l

Xvfb :1 -ac -noreset -core -screen 0 1280x1024x24 > /dev/null 2>&1 & disown
export DISPLAY=:1.0
export MESA_GL_VERSION_OVERRIDE=3.3

echo "$!"
