#!/bin/bash

yarn && yarn build
cd gem && ./bin/setup && bundle exec rake
