import { AxiosResponse } from 'axios';
import * as Sentry from '@sentry/node';

import { axiosClient, logger } from '.';

/**
 * Fetches a specifed URI
 * @param url the uri
 * @returns the reponse from axios
 */
export async function getURI(uri: string): Promise<AxiosResponse<any, any>> {
    const transaction = Sentry.startTransaction({
        op: 'crawl',
        name: 'Fetching page to be processed',
        data: {
            uri,
        },
    });

    logger.debug(`Getting url ${uri}`);

    const response = await axiosClient.get(uri).catch((error) => {
        if (error.response && error.response.status == 404) return;

        logger.error('Error with axios fetching page', error);
        Sentry.captureException(error);
    });

    if (!response) {
        logger.warn(`Failed to fetch site ${uri}`);

        transaction.finish();

        return Promise.reject(new Error('Failed to fetch site'));
        // return;
    }

    if (response.status !== 200) {
        logger.error(`Got a status of ${response.status} while fetching site ${uri}`);

        // use job.discard() to tell bull to not try job again

        transaction.finish();

        return Promise.reject(new Error(`Got a status of ${response.status} while fetching site`));
        // return;
    }

    transaction.finish();

    return response;
}
