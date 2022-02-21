import * as Sentry from '@sentry/node';
import { Job } from 'bullmq';

import { bulkAddToCrawlerQueue, hashURI, logger } from '..';
import { Page } from '../../config';
import { ParsedPage } from '../../@types/parsedPage';

/**
 * Saves the processed page to the db and adds links to the queue
 * @param job
 * @param parsedPage
 * @returns
 */
export const crawlerCompleted = (job: Job, parsedPage: ParsedPage) => {
    // check if job failed to return proper data
    if (!parsedPage || parsedPage === undefined) {
        logger.warn(`Job ${job.id || job.name} failed to return proper data`);

        return;
    }

    logger.debug(`Parsed page ${parsedPage.url}`);

    // add all links to the queue if not disabled
    if (!process.env.NONEWJOBS) bulkAddToCrawlerQueue(parsedPage.links);

    const page = {
        url: parsedPage.url,
        hash: job.id || hashURI(parsedPage.url),
        title: parsedPage.title,
        description: parsedPage.description,
        keywords: parsedPage.keywords,
    };

    // save page to mongo
    Page.create(page)
        .catch((error) => {
            console.error(error);
            Sentry.captureException(error);
        })
        .then(() => {
            logger.debug(`Saved url ${parsedPage.url}`);
        });
};
