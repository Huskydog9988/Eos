import * as Sentry from '@sentry/node';
import { hashURI, logger } from '.';

import { parsedLink } from '../@types/parsedLink';
import { Page } from '../config';

/**
 * Used to create a 'placeholder' document for a link going to be indexed
 * @description Create placeholder so when checking if already in queue we know if the link is going to be crawled
 * @param parsedLink
 */
export const saveInital = async (parsedLink: parsedLink) => {
    // create new document
    const doc = new Page({
        url: parsedLink.data.url,
        hash: parsedLink.opts?.jobId || hashURI(parsedLink.data.url),
        title: '',
        description: '',
        keywords: '',
    });

    try {
        // save document
        await doc.save();

        logger.debug(`Saved url ${parsedLink.data.url}`);
    } catch (error) {
        console.error(error);
        Sentry.captureException(error);
    }

    // // save page to mongo
    // Page.create(page)
    //     .catch((error) => {
    //         console.error(error);
    //         Sentry.captureException(error);
    //     })
    //     .then(() => {
    //         logger.debug(`Saved url ${parsedLink.data.url}`);
    //     });
};
