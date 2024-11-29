# Step 1: Use Node.js to build the application
FROM node:18 as builder
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the source code and build the app
COPY . .
RUN npm run build

# Step 2: Use Nginx to serve the built files
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Expose port 80 for serving
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
