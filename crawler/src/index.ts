import cluster from 'cluster';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import os from 'os';

import main from './main';
import { app, logger, prisma } from './utils';
import worker from './worker';
import { EnableClustering } from './config';

// used for debugging
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: `dark-search-crawler@${process.env.npm_package_version}`,
    environment: process.env.NODE_ENV || 'dev',
    maxBreadcrumbs: 75,
    serverName: process.env.serverName || 'dev',

    beforeSend(event) {
        // if user
        if (event.user) {
            // scrub any possible sensitive data

            // don't send email address
            delete event.user.email;
            // don't send username
            delete event.user.username;
            // don't send ip address
            delete event.user.ip_address;
        }
        return event;
    },

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.5,

    integrations: [
        // enable postgres tracing
        new Tracing.Integrations.Postgres(),
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],
});

// set sentry tags
Sentry.setTag('platform', os.platform());
Sentry.setTag('os.name', os.version());
Sentry.setTag('os', os.version() + ' ' + os.release());
Sentry.setTag('node', process.version);

// give time for sentry to connect
setTimeout(async () => {
    if (EnableClustering) {
        // if main worker
        if (cluster.isPrimary) {
            logger.debug('Starting Dark Search Crawler');

            // run code for main thread
            main();
        } else {
            // run code for worker thread
            worker();
        }
    } else {
        // clustering disabled, run everything
        main();
        worker();
    }
}, 99);

/**
 * Handles exit signal events
 * @param signal
 */
async function handleSignal(signal: NodeJS.Signals) {
    logger.info(`Process ${process.pid} received ${signal}, shutting down...`);
    // flush logs after log
    // logger.end();

    await Sentry.close(2000);

    // clean exit
    process.exit(0);
}

process.on('SIGINT', handleSignal);
process.on('SIGTERM', handleSignal);

process.on('beforeExit', async (code) => {
    logger.info(`Process ${process.pid} beforeExit event with code ${code}`);
    logger.end();

    await prisma.$disconnect();

    await Sentry.close(2000);
});

process.on('exit', async (code) => {
    logger.info(`Process ${process.pid} exit event with code ${code}`);
    logger.end();

    await prisma.$disconnect();

    await Sentry.close(2000);
});

// The process will still crash even with this listener
process.on('uncaughtExceptionMonitor', (error, origin) => {
    // logger.error('Caught an uncaught exception', { error, origin });
    Sentry.captureException({ error, origin });
});

// process.on('multipleResolves', async (type, promise, reason) => {
//     logger.error('Multiple resolves', { type, promise, reason });

//     Sentry.captureMessage('Multiple resolves');
//     Sentry.captureException({ type, promise, reason });

//     await Sentry.close(2000);

//     // Uncaught Fatal Exception
//     process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//     logger.error('Unhandled rejection', { promise, reason });
// });

process.on('warning', (warning) => {
    logger.warn(warning);
});
