import { Queue, QueueEvents, QueueScheduler } from 'bullmq';

import { redisConnectionConfig } from '../../config';

/**
 * crawler queues
 */
export const crawlQueue = new Queue('Crawl', {
    connection: redisConnectionConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});

/**
 * crawler queue events
 */
export const crawlEvents = new QueueEvents('Crawl', {
    connection: redisConnectionConfig,
});

/**
 * Reschedules jobs
 */
export const crawlScheduler = new QueueScheduler('Crawl', {
    connection: redisConnectionConfig,
});
