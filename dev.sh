#!/bin/bash

trap killgroup SIGINT

killgroup(){
  echo killing...
  kill 0
}

pnpm dev:server &
pnpm dev:client &
wait

