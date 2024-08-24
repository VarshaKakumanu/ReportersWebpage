# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite application
RUN npm run build

# Install a lightweight web server to serve the built files
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 5173

# Command to serve the built files
CMD ["serve", "-s", "dist", "-l", "5173"]
