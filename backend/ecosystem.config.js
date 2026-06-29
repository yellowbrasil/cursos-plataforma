module.exports = {
  apps: [
    {
      name: 'cursos-backend',
      script: './server.js',
      cwd: '/home/cursos-plataforma/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      }
    }
  ]
};
