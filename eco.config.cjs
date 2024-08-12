module.exports = {
    apps: [
      {
        name: 'reporters-app',
        script: '/root/etvb_wrap_app/node_modules/.bin/serve',
        args: '-s /root/etvb_wrap_app/build -l 5173',
        cwd: './',
        env: {
          PORT: 5173, // The port on which the app will be served
        },
        instances: 1,
        exec_mode: 'cluster', // Run in cluster mode for better performance
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };