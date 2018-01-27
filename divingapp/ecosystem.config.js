module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        // First application
        {
            name: 'divingapp',
            script: 'app-server/build/app.js',
            env: {
                PORT: 8080,
            },
        },
    ],

    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy: {
        prod: {
            key: '~/.ssh/dive_app_key',
            user: 'dive.littledev.nl',
            host: 'mira.littledev.nl',
            ref: 'origin/master',
            repo: 'git@git.littledev.nl:blackshade/divecomputer.git',
            path: '/home/dive.littledev.nl/',
            'post-deploy':
                'cd divingapp && yarn && ./node_modules/bootstrap/package.json && ./node_modules/.bin/ng build --aot --prod && cd app-server && yarn && ./node_modules/.bin/tsc && cd .. && pm2 reload ecosystem.config.js',
        },
    },
};
