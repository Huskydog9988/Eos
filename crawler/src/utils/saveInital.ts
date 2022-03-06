import * as Sentry from '@sentry/node';
import { logger, prisma } from '.';

/**
 * Used to create a 'placeholder' document for a link going to be indexed
 * @description Create placeholder so when checking if already in queue we know if the link is going to be crawled
 * @param url
 */
export const saveInital = async (url: string) => {
    logger.debug(`Inital save of ${url}`);

    try {
        // save to queue db
        await prisma.queue.create({ data: { url } });

        logger.debug(`Added page to queue db ${url}`);
    } catch (error) {
        Sentry.captureException(error);
        logger.error(`Failed to add url to queue db`, error, { url });
    }
};
