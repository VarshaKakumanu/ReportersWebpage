pipeline {
    agent any
    tools {
        jdk 'jdk17'
        nodejs 'nodejs'
    }
    environment {
        SUDO_PASS = credentials('sudo_password_id') // Ensure you have stored the password securely in Jenkins credentials
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from Git') {
            steps {
                git branch: 'development', url: 'git@gitlab.com:wordpress4583004/etvb_wrap_app.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh "npm install"
                sh "npm install --save-dev vite @vitejs/plugin-react"
            }
        }
        stage('Build React Application') {
            steps {
                sh "npm run build"
            }
        }
        stage('Deploy to Server') {
            steps {
                script {
                    def remoteDir = '/var/www/reporters-app'
                    
                    // Check if dist directory exists and run the build process if necessary
                    sh '''
                        echo "Listing current directory contents:"
                        ls -l
                        
                        if [ -d "dist" ]; then
                            echo "Dist directory exists."
                            ls -l dist
                        else
                            echo "Dist directory does not exist. Running build..."
                            npm run build
                            echo "Listing dist directory after build command:"
                            ls -l dist
                        fi
                    '''
                    
                    // Create remote directory if it doesn't exist, using sudo to handle permissions
                    sh "echo ${SUDO_PASS} | sudo -S mkdir -p ${remoteDir}"
                    
                    // Copy build files to the directory, using sudo to handle permissions
                    sh "echo ${SUDO_PASS} | sudo -S cp -r dist/* ${remoteDir}/"
                    
                    // Create the _redirects file for SPA routing
                    sh "echo '/* /index.html 200' | sudo tee ${remoteDir}/_redirects"
                    
                    // Install serve and start the server on port 5173, using sudo to handle permissions
                    sh """
                        echo ${SUDO_PASS} | sudo -S sh -c '
                        cd ${remoteDir} &&
                        npm install -g serve &&
                        pkill serve || true &&
                        nohup serve -s ${remoteDir} -l 5173 > /dev/null 2>&1 &
                        '
                    """
                    
                    // Add logging to check for the serve process
                    sh "ps aux | grep serve"
                }
            }
        }
    }
}



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

