import { createHash } from 'crypto';

/**
 * Creates a hash of a URI
 * @description Hased used as unique id for url that can be easily searched
 * @param uri uri to be hashed
 * @returns hashed uri
 */
export const hashURI = (uri: string) => {
    return createHash('sha1').update(uri).digest('base64');
};
