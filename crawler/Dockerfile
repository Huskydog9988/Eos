FROM node:16

WORKDIR /usr/src/dark-search

# copy over yarn config
COPY .yarnrc.yml ./
COPY .yarn .yarn

# copy over package files
COPY package.json ./
COPY yarn.lock ./

# install deps
RUN yarn install --frozen-lockfile

# copy rest of files
COPY . .

# build
RUN yarn build

# clean cache
RUN yarn cache clean --all

CMD ["yarn", "start"]

# docker build -t dark-search_indexer-test .