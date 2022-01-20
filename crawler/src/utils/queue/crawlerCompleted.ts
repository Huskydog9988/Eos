import * as Sentry from '@sentry/node';
import { Job } from 'bullmq';

import { bulkAddToCrawlQueue, logger } from '..';
import { Page } from '../../config';
import { ParsedPage } from '../../@types/parsedPage';

/**
 * Saves the processed page to the db and added links found to the queue
 * @param job
 * @param parsedPage
 * @returns
 */
export const crawlerCompleted = async (job: Job, parsedPage: ParsedPage) => {
    // check if job failed to return proper data
    if (!parsedPage || parsedPage === undefined) {
        logger.warn(`Job ${job.id || job.name} failed to return proper data`);

        return;
    }

    logger.debug(`Parsed page ${parsedPage.url}`);

    // add all links found to the queue if not disabled
    if (!process.env.NONEWJOBS) bulkAddToCrawlQueue(parsedPage.links);

    // const page = {
    //     url: parsedPage.url,
    //     hash: job.id || hashURI(parsedPage.url),
    //     title: parsedPage.title,
    //     description: parsedPage.description,
    //     keywords: parsedPage.keywords,
    // };

    // find document created when first added to the queue
    const doc = await Page.findOne({ url: parsedPage.url });

    // check if it was found
    if (doc === null || !(doc instanceof Page)) {
        const message = `Couldn't find page ${parsedPage.url} in mongo to update`;
        logger.error(message);
        Sentry.captureMessage(message);

        return;
    }

    // update page with info from latest crawl
    doc.url = parsedPage.url;
    doc.title = parsedPage.title;
    doc.description = parsedPage.description;
    doc.keywords = parsedPage.keywords;
    doc.updated = Date.now();

    // save
    await doc.save();

    // // save page to mongo
    // Page.create(page)
    //     .catch((error) => {
    //         console.error(error);
    //         Sentry.captureException(error);
    //     })
    //     .then(() => {
    //         logger.debug(`Saved url ${parsedPage.url}`);
    //     });
};
