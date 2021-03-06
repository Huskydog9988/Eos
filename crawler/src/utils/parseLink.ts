import isURL from 'validator/lib/isURL';
import { parsedLink } from '../@types/parsedLink';

/**
 * Parses link into an object bullmq can understand
 * @param link link to be crawled
 * @returns new job object for bullmq
 */
export const parseLink = (link: string): parsedLink | void => {
    // check if valid url
    const isValid = isURL(link, {
        protocols: ['http', 'https'],
    });

    if (isValid) {
        // make link a url object
        const url = new URL(link);

        // split hostname by '.'
        const hostnameParts = url.hostname.split('.');
        // get the domain
        const domain = hostnameParts[hostnameParts.length - 1];

        // if not an onion domain, skip its
        if (domain !== 'onion') return;

        return {
            name: url.hostname,
            data: {
                url: link,
            },
            opts: {
                jobId: '',
            },
        };
    } else {
        return;
    }
};
