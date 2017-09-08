module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'divingapp',
      script    : 'serve',
      env       : {
        "PM2_SERVE_PATH": 'divingapp/build/',
        "PM2_SERVE_PORT": 8080
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'dive.littledev.nl',
      host : 'mira.littledev.nl',
      ref  : 'origin/master',
      repo : 'git@git.littledev.nl:blackshade/divecomputer.git',
      path : '/home/dive.littledev.nl/',
      'post-deploy' : 'cd divingserver && npm install && ./node_modules/.bin/ng build --aot --prod && pm2 reload ecosystem.config.js --env production'
    }
  }
};
