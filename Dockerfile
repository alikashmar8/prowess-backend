FROM node:16.13.0 AS builder
RUN npm i -g @nestjs/cli

WORKDIR /backend
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm install
COPY ./ ./
