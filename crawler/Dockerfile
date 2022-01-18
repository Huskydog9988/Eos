FROM node:16

WORKDIR /usr/src/dark-search

# copy over yarn config
COPY .yarnrc.yml ./
COPY .yarn .yarn

# copy over package files
COPY package.json ./
COPY yarn.lock ./

COPY crawler/package.json ./crawler/package.json

# install deps
RUN yarn workspaces focus crawler

# copy rest of files
COPY . .

# build
RUN yarn crawler build

# clean cache
RUN yarn cache clean --all

CMD ["yarn", "crawler", "start"]