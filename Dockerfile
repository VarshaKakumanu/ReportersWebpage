# Use a stable Node.js image with Slim variant for a smaller footprint
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/reportersapp

# Upgrade npm to the specified stable version
RUN npm install -g npm@10.8.2

# Set the npm registry to a mirror to avoid any issues with npm's default registry
RUN npm config set registry https://registry.npmmirror.com

# Clean up any existing npm cache, and install dependencies without cache
COPY package*.json ./
RUN rm -rf /root/.npm \
    && npm cache clean --force \
    && npm install --legacy-peer-deps --no-cache \
    && npm install --save-dev vite@4.5.0 @vitejs/plugin-react@4.1.0

# Copy the rest of the application files to the container
COPY . .

# Build the React application
RUN npm run build

# Add _redirects file for SPA routing (useful for static site hosting)
RUN echo '/* /index.html 200' > dist/_redirects

# Install serve globally to serve the build
RUN npm install -g serve

# Expose port 3000, where the app will be served
EXPOSE 3000

# Command to run the application using the serve command with SPA routing
CMD ["serve", "-s", "dist", "-l", "3000", "--single"]

