#!/bin/bash

rsync -Pav -r ./divingapp/dist/ 'ftp@dive.littledev.nl'@littledev.nl:.
pushd ./divingserver
docker push $DOCKER_USERNAME/$DOCKER_REPO
popd