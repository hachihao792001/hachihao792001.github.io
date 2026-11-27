@echo off
title hachihao792001.github.io server
cd /d "%~dp0"
python -m http.server %*
if errorlevel 1 pause
