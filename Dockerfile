# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/reportersapp

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install the dependencies
RUN npm install \

    && npm install --save-dev vite @vitejs/plugin-react

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build

# Create the _redirects file for SPA routing
RUN echo '/* /index.html 200' > dist/_redirects

# Install serve globally
RUN npm install -g serve

# Expose the port where the application will run
EXPOSE 9010

# Command to serve the application
CMD ["serve", "-s", "dist", "-l", "9010"]