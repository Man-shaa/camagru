# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install any needed packages
RUN npm install

# Copy the src directory contents into the container at /app
COPY src/ ./src

# Expose the port the app runs on
EXPOSE 8080