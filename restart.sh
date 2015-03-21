#!/bin/bash
forever stop app.js && forever -o debug.log start app.js