# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/reportersapp

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Clean npm cache and install dependencies
RUN npm cache clean --force \
    && npm install -g npm@latest \
    && npm install

# Copy the rest of the application files
COPY . .

# Build the React application
RUN npm run build \
    && echo '/* /index.html 200' > dist/_redirects \
    && npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]
