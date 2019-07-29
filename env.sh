#!/bin/bash
echo PARENT=${PARENT} > .env
echo CHILD=${CHILD} > .env
yarn install
yarn run dev
