# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/reportersapp

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Clean npm cache and install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build

# Add _redirects file for SPA routing
RUN echo '/* /index.html 200' > dist/_redirects

# Install serve globally
RUN npm install -g serve

# Expose the port where the app will run
EXPOSE 3000

# Command to serve the application
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]
