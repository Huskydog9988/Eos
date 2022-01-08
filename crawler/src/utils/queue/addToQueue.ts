import { crawlQueue } from '.';
import { hashURI, logger, pageIndexed } from '..';
import { parsedLink } from '../../@types/parsedLink';

/**
 * Adds item to crawler queue
 * @param name name of job, ie hostname
 * @param url full uri to a page to be crawled
 * @returns boolean
 */
export const addToCrawlQueue = async (name: string, url: string) => {
    const indexed = await pageIndexed(url);

    // if page not indexed, add to queue
    if (!indexed) {
        // logger.debug(`Job ${name} not in db`)

        crawlQueue.add(
            name,
            { url },
            {
                jobId: hashURI(url),
            },
        );
        return true;
    } else {
        return false;
    }
};

/**
 * Adds links in bulk to crawl queue
 * @param parsedLinks
 */
export const bulkAddToCrawlQueue = async (parsedLinks: parsedLink[]) => {
    const newLinks: parsedLink[] = [];

    // logger.debug('Parsed links', parsedLinks);

    for (let i = 0; i < parsedLinks.length; i++) {
        const parsedLink = parsedLinks[i];
        const indexed = await pageIndexed(parsedLink.data.url);

        // if page not indexed, add to queue
        if (!indexed) {
            // logger.debug(`Job ${parsedLink.data.url} not in db`);

            // set job id
            parsedLink.opts.jobId = hashURI(parsedLink.data.url);

            // add to array to be added to queue
            newLinks.push(parsedLink);
        }
    }

    // logger.debug('new links', newLinks);

    // add items to queue
    await crawlQueue.addBulk(newLinks);

    logger.debug(`Added ${newLinks.length} links to the queue`);
};
