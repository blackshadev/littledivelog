#!/bin/sh
sudo stop diveserver
sudo -u littledev git pull
sudo -u littledev tsc
sudo start diveserver
