module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'divingapp',
      script    : './node_modules/.bin/ng serve -prod --port 8080 --host 0.0.0.0'
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    prod : {
      key: "~/.ssh/dive_app_key",
      user : 'dive.littledev.nl',
      host : 'mira.littledev.nl',
      ref  : 'origin/master',
      repo : 'git@git.littledev.nl:blackshade/divecomputer.git',
      path : '/home/dive.littledev.nl/',
      'post-deploy' : 'cd divingapp && npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
