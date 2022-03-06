import { Job, Worker } from 'bullmq';
import * as Sentry from '@sentry/node';

import { ParsedPage } from './@types/parsedPage';
import { redisConnectionConfig } from './config';
import { logger, crawlerWorkerUtil, crawlerCompleted } from './utils';

/**
 * Code to run on worker process
 */
export default async () => {
    logger.debug(`Worker ${process.pid} started`);

    // make crawler worker
    const crawlerWorker = new Worker('Crawl', async (job) => await crawlerWorkerUtil(job), {
        connection: redisConnectionConfig,
        concurrency: 50,
        // limiter: {
        //     max: 10,
        //     duration: 1000,
        // },
    });

    // listen for job completion
    crawlerWorker.on('completed', async (job: Job, parsedPage: ParsedPage) => await crawlerCompleted(job, parsedPage));

    crawlerWorker.on('error', (err) => {
        // log the error
        logger.error('Crawler Worker Error:', err);
        Sentry.captureException(err);
    });

    process.on('exit', async (code) => {
        await crawlerWorker.close(true);
    });
};
