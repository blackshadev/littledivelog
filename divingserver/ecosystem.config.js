module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'divingserver',
      script    : 'build/app.js',
      env: {
        CONFIG: "~/config.json"
      }
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
      'post-deploy' : 'cd divingserver && npm install && ./node_modules/.bin/tsc && pm2 reload ecosystem.config.js'
    }
  }
};
