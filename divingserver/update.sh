#!/bin/sh
sudo stop diveserver
sudo -u littledev.nl git pull
sudo -u littledev.nl tsc
sudo start diveserver
