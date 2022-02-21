import { Queue, QueueEvents, QueueScheduler } from 'bullmq';

import { redisConnectionConfig } from '../../config';

/**
 * crawler queues
 */
export const crawlerQueue = new Queue('Crawler', {
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
export const crawlerEvents = new QueueEvents('Crawler', {
    connection: redisConnectionConfig,
});

/**
 * Reschedules jobs
 */
export const crawlerScheduler = new QueueScheduler('Crawler', {
    connection: redisConnectionConfig,
});
