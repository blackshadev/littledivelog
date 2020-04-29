#!/bin/bash

find divingapp/dist -type f -exec curl --ftp-create-dirs -T {} -u $FTP_USER:$FTP_PASS ftp://littledev.nl/{} \\;"
