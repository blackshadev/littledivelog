#!/bin/bash

rsync -Pav -r ./divingapp/dist/ 'ftp@dive.littledev.nl'@littledev.nl:.
pushd ./divingserver
docker push $DOCKER_USERNAME/$DOCKER_REPO
popd
ssh 'dive.littledev.nl'@mira.littledev.nl << EOF
docker-compose pull
docker-compose up --force-recreate -d
docker image prune -f
EOF