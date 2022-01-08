import { Job, Worker } from 'bullmq';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';

import { ParsedPage } from './@types/parsedPage';
import { mongodbURL, redisConnectionConfig } from './config';
import { logger, crawlerWorkerUtil, crawlerCompleted } from './utils';
// import { Page } from './config';

/**
 * Code to run on worker process
 */
export default () => {
    logger.debug(`Worker ${process.pid} started`);

    // connect to mongodb
    mongoose.connect(mongodbURL, { autoIndex: true }).catch((error) => {
        logger.error(error);
        Sentry.captureException(error);
    });

    // monitor for errors
    const db = mongoose.connection;
    db.on('error', (...args) => {
        logger.error('MongoDB connection error', args);
    });

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
    crawlerWorker.on('completed', async (job: Job, parsedPage: ParsedPage) => crawlerCompleted(job, parsedPage));

    crawlerWorker.on('error', (err) => {
        // log the error
        logger.error('Crawler Worker Error:', err);
        Sentry.captureException(err);
    });

    process.on('exit', async (code) => {
        await crawlerWorker.close(true);
    });
};
