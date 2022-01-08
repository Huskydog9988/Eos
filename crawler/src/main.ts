import cluster from 'cluster';
import { cpus } from 'os';
import process from 'process';
import bullmaster from 'bull-master';
import * as Sentry from '@sentry/node';
import helmet from 'helmet';

import { app, crawlEvents, crawlQueue, logger } from './utils';

const numCPUs = cpus().length;
const port = process.env.PORT || 8080;

/**
 * Code to run on main process
 */
export default () => {
    logger.debug(`Primary ${process.pid} is running`);

    // init bull master
    const bullMasterApp = bullmaster({
        queues: [crawlQueue],
    });
    bullMasterApp.getQueues();

    cluster.on('exit', (worker, code, signal) => {
        logger.warn(`Worker ${worker.process.pid} died with code ${code}`);
    });

    // on completed
    crawlEvents.on('completed', ({ jobId }) => {
        logger.info(`Done crawling ${jobId}`);
    });

    // on failed
    crawlEvents.on('failed', ({ jobId, failedReason }) => {
        logger.warning(`Error crawling ${jobId} because ${failedReason}`);
        Sentry.addBreadcrumb({
            category: 'crawl',
            message: '',
            level: Sentry.Severity.Warning,
            data: {
                jobId,
                failedReason,
            },
        });
    });

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // RequestHandler creates a separate execution context using domains, so that every
    // transaction/span/breadcrumb is attached to its own Hub instance
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());

    // use helmet
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    );

    // launch bull master
    app.use('/admin/queues', bullMasterApp);

    // The error handler must be before any other error middleware and after all controllers
    app.use(Sentry.Handlers.errorHandler());

    // have server run on port
    app.listen(port, () => {
        logger.info(`Started webserver on http://localhost:${port}/`);
    });

    // if init adding of urls is not disabled
    if (!process.env.NOADD) {
        // add starting urls

        (async function () {
            crawlQueue.addBulk([
                {
                    name: 'onionlinks',
                    data: {
                        url: 'http://s4k4ceiapwwgcm3mkb6e4diqecpo7kvdnfr5gg7sph7jjppqkvwwqtyd.onion/',
                    },
                },
            ]);
        })();
    }
};
