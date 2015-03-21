#!/bin/bash
forever stop app.js
git pull
forever -o debug.log start app.js