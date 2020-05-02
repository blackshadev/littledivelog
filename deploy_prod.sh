#!/bin/bash

rsync -Pav -r ./divingapp/dist 'ftp@dive.littledev.nl'@littledev.nl:.
