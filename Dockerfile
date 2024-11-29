# Step 1: Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/reportersapp

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build

# Expose the port where the application will run
EXPOSE 3000

# Command to serve the application using `serve`
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
