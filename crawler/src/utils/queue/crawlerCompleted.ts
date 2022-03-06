import { Page } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { Job } from 'bullmq';

import { bulkAddToCrawlQueue, logger } from '..';
import { ParsedPage } from '../../@types/parsedPage';
import { prisma } from '../prismaClient';

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

    // // delete page in queue db
    // prisma.queue
    //     .delete({ where: { url: parsedPage.url } })
    //     .then((queueItem) => {
    //         logger.debug(`Deleted page in queue db`, { url: queueItem.url });
    //     })
    //     .catch((error) => {
    //         const message = `Couldn't find page ${parsedPage.url} in queue`;
    //         logger.error(message, error);
    //         Sentry.captureMessage(message);
    //         Sentry.captureException(error);
    //     });

    // need to ignore the fact that pageData is missing items as prisma will add them for us
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const pageData: Page = { url: parsedPage.url, network: 0 };

    if (parsedPage.title) pageData.title = parsedPage.title;
    if (parsedPage.description) pageData.description = parsedPage.description;
    if (parsedPage.keywords) pageData.keywords = parsedPage.keywords;
    if (parsedPage.description) pageData.description = parsedPage.description;

    // prisma.hostName.upsert({
    //     where: {
    //         hostname: job.name,
    //     },
    //     create: {
    //         hostname: job.name,
    //     },
    //     update: (ahh) => {
    //         return { hostname: job.name };
    //     },
    // });

    prisma.page
        .upsert({
            create: pageData,
            update: {
                ...pageData,
                // some way to increment num of scans here?
            },
            where: {
                url: parsedPage.url,
            },
        })
        .catch((error) => {
            const message = `Failed to create page for ${parsedPage.url}`;
            logger.error(message, error);
            Sentry.captureMessage(message);
            Sentry.captureException(error);
        });
};
