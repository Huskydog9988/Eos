import { Job } from 'bullmq';
import cheerio from 'cheerio';
import * as Sentry from '@sentry/node';

import { getURI, logger, parseLink } from '.';
import { parsedLink } from '../@types/parsedLink';
import { ParsedPage } from '../@types/parsedPage';

// regex to get base url
const urlRegex = new RegExp('^.+?[^/:](?=[?/]|$)');

/**
 * Parses page
 * @param job
 * @returns
 */
export async function parsePage(job: Job): Promise<void | ParsedPage> {
    const uri = job.data.url;

    // get URI
    const response = await getURI(uri);
    await job.updateProgress(20);

    // check if void
    if (!response) return;

    logger.debug(`Got a response from ${uri}`);

    const transaction = Sentry.startTransaction({
        op: 'crawl',
        name: 'Processing fetched page',
        data: {
            uri,
        },
    });

    // load page
    const html = response.data;
    const $ = cheerio.load(html);
    await job.updateProgress(40);

    // extract specified meta tag
    const getMetatag = (name: string) =>
        $(`meta[name=${name}]`).attr('content') ||
        $(`meta[name="og:${name}"]`).attr('content') ||
        $(`meta[property="og:${name}"]`).attr('content') ||
        $(`meta[name="twitter:${name}"]`).attr('content') ||
        '';

    // get all link elements
    const linksRaw = $('a');
    // array for proper links
    const links: parsedLink[] = [];
    // get base url
    const baseURL = urlRegex.exec(uri);

    // whether to do realative link normalization
    let doRealative = true;
    if (!baseURL || baseURL === null) doRealative = false;

    await job.updateProgress(60);

    logger.debug(`Starting to sort links for ${uri}`);

    linksRaw.map((index, element) => {
        // get link from tag
        const link = $(element).attr('href');
        // if link doesn't exist
        if (!link) return;

        if (doRealative && link.startsWith('//')) {
            // http link that doesn't start with protocal

            // make new link
            const parsedLink = parseLink('http:' + link);

            // push link job object
            if (parsedLink) links.push(parsedLink);
        } else if (doRealative && link.startsWith('/')) {
            // if a realative link

            // make new link
            const parsedLink = parseLink(baseURL + link);

            // push link job object
            if (parsedLink) links.push(parsedLink);
        } else if (link.startsWith('#')) {
            // if link to bookmark
            return;
        } else {
            // if normal link

            const parsedLink = parseLink(link);

            // push link job object
            if (parsedLink) links.push(parsedLink);
        }
    });

    logger.debug(`Sorted and parsed ${links.length} links for ${uri}`);
    await job.updateProgress(80);

    // split keywords into an array of keywords
    const keywords = getMetatag('keywords').split(',');

    transaction.finish();

    return {
        url: uri,
        title: $('title').first().text(),
        description: getMetatag('description'),
        keywords,
        links,
    };
}
