import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const dailyRotateFile = new DailyRotateFile({
    filename: './logs/%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '5d',
});

const dailyRotatErrorFile = new DailyRotateFile({
    filename: './logs/%DATE%-Error.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'warn',
});

const dailyRotatExceptionFile = new DailyRotateFile({
    filename: './logs/%DATE%-Error.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'warn',
});

const dailyRotatRejectionsFile = new DailyRotateFile({
    filename: './logs/%DATE%-Error.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'warn',
});

/**
 * Logger
 */
export const logger = winston.createLogger({
    exitOnError: false,
    transports: [dailyRotateFile, dailyRotatErrorFile],
    exceptionHandlers: [dailyRotatExceptionFile],
    rejectionHandlers: [dailyRotatRejectionsFile],
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.json(),
    ),

    // format: winston.format.combine(
    //   winston.format.colorize(),
    //   winston.format.timestamp(),
    //   winston.format.align(),
    //   winston.format.printf(
    //     (log) =>
    //       `[${log.level.toUpperCase()}] - ${log.message}`,
    //   ),
    // ),
    // format: winston.format.combine(
    //   winston.format.timestamp(),
    //   winston.format.prettyPrint(),
    // ),
});

// if not prod
if (process.env.NODE_ENV !== 'production') {
    // add debug messages, and print all to console
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            level: 'debug',
        }),
    );
}
