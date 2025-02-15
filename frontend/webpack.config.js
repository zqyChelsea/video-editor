const path = require('path');

module.exports = {
  devServer: {
    allowedHosts: ['localhost', '.localhost'],
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}; 