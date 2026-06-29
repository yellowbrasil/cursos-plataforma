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
        JWT_SECRET: 'd000feaae2dd08990c73a549b1b7ae1a25936bfea6509fd51d0abf6a3028e6ee',
        DB_USER: 'cursos',
        DB_HOST: '69.62.93.231',
        DB_NAME: 'cursos_academy',
        DB_PASSWORD: 'L0k@l_C3Ql7d@P@ssW0rd2024_SECURE!',
        DB_PORT: 5432,
      }
    }
  ]
};
