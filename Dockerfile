# Step 1: Build the React app with Vite
FROM node:20 as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Step 2: Serve the React app on port 5173 using Vite
EXPOSE 5173

# Start the Vite server in preview mode to serve the app
CMD ["npm", "run", "preview"]
