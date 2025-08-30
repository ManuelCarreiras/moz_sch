#! /bin/bash

# $1 - container name
container_name=${1:-api} # default container name

docker exec -it $container_name doppler run --command 'python -m pytest . --full-trace -vv --cov-config=.coveragerc --cov-report term-missing  --cov=.'