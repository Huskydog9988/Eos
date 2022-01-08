import { Job } from 'bullmq';
import * as Sentry from '@sentry/node';

import { ParsedPage } from '../../@types/parsedPage';
import { logger, parsePage } from '..';

/**
 *  Actual worker that processes items in crawl queue
 * @param job
 * @returns void or parsedPage
 */
export const crawlerWorkerUtil = async (job: Job) => {
    // start transaction
    const transaction = Sentry.startTransaction({
        op: 'crawl',
        name: 'Crawling',
        data: {
            jobId: job.id,
            url: job.data.url,
        },
    });

    logger.debug(`Crawling ${job.name}`);

    let result: void | ParsedPage;

    try {
        result = await parsePage(job);
    } catch (error) {
        logger.error('Error crawling', error);
        Sentry.captureException(error);
    } finally {
        transaction.finish();
        return result;
    }
};
