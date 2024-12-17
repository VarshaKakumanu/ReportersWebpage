FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/reportersapp

# Upgrade npm to a stable version
RUN npm install -g npm@10.8.2

# Clean npm cache and install dependencies
COPY package*.json ./
RUN npm cache clean --force \
    && npm install --legacy-peer-deps \
    && npm install --save-dev vite @vitejs/plugin-react

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
