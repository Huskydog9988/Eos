import isURL from 'validator/lib/isURL';
import { parsedLink } from '../@types/parsedLink';

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

        // if not an onion domain, skip it
        if (domain !== 'onion') return;

        return {
            name: url.hostname,
            data: {
                url: link,
            },
            opts: {
                jobId: link,
            },
        };
    } else {
        return;
    }
};
