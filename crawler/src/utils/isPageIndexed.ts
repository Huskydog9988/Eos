import * as Sentry from '@sentry/node';

import { logger } from '.';
import { Page } from '../config';

/**
 * Checks if a page has been indexed
 * @param url
 * @returns
 */
export const isPageIndexed = async (uri: string) => {
    const transaction = Sentry.startTransaction({
        op: 'indexed',
        name: 'Checking if url is indexed',
        data: {
            uri,
        },
    });

    let result = false;

    try {
        result = await Page.exists({ url: uri });
    } catch (error) {
        logger.error('Error checking if uri is in db');
        Sentry.captureException(error);
    } finally {
        transaction.finish();
    }

    return result;
};
