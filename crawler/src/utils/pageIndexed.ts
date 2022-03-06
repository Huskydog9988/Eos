import * as Sentry from '@sentry/node';

import { logger, prisma } from '.';

/**
 * Checks if a page has been indexed
 * @param url
 * @returns
 */
export const pageIndexed = async (uri: string) => {
    const transaction = Sentry.startTransaction({
        op: 'indexed',
        name: 'Checking if url is indexed',
        data: {
            uri,
        },
    });

    let result = true;

    logger.debug(`Checking if uri (${uri} exists)`);

    try {
        // const [inQueue, indexed] = await Promise.resolve([
        //     prisma.queue.findUnique({ where: { url: uri } }),
        //     prisma.page.findUnique({ where: { url: uri } }),
        // ]);
        const indexed = await prisma.queue.findUnique({ where: { url: uri } });

        // if not in either
        // if (inQueue !== null && indexed !== null) {
        // logger.debug(`Indexed result for ${uri}`, { indexed });
        if (indexed === null) {
            result = false;
        }
    } catch (error) {
        logger.error('Error checking if uri is in db', error);
        Sentry.captureException(error);
    } finally {
        transaction.finish();
    }

    return result;
};
