# Use an official Node.js runtime as a parent image
FROM node:20.14.0-alpine

# Set the working directory inside the container
WORKDIR /usr/src/reportersapp

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build \
    && echo '/* /index.html 200' > dist/_redirects \
    && npm install -g serve

# Add a non-root user for security
RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser
USER appuser

# Expose the port where the application will run
EXPOSE 3000

# Command to serve the application
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]
