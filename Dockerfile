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

# Install nodemon globally
RUN npm install -g nodemon

# Expose the port the app runs on
EXPOSE 8080

# Run the app with nodemon when the container launches
# CMD ["npm", "run", "start:dev"]