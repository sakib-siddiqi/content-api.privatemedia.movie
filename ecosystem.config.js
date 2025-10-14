module.exports = {
  apps: [
    {
      name: 'movie-content-server',
      script: './dist/main.js',
      
      // Instance settings - CHANGED
      instances: 4,  // Or 'max' to use all CPU cores
      exec_mode: 'cluster',  // CHANGED from 'fork' to 'cluster'
      
      // Auto-restart settings
      watch: false,
      max_memory_restart: '500M',
      
      // Environment variables
      env: {
        NODE_ENV: 'production',
        PORT: 9010,
      },
      env_production: {
        NODE_ENV: 'production',  // Fixed: was 'development'
        PORT: 9010,
      },
      
      // Logging
      error_file: './logs/movie-content-server-err.log',
      out_file: './logs/movie-content-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced options
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
      
      // Post-deployment
      post_update: ['npm install', 'echo Deployment finished'],
    },
  ],
};