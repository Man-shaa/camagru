FROM node:18

WORKDIR /usr/src/app

VOLUME /usr/src

# Copy package files first to leverage Docker cache
COPY config/package.json config/package-lock.json ./

# Install dependencies
RUN npm install

COPY . .
