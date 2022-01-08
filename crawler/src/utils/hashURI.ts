import { createHash } from 'crypto';

/**
 * Used to hash a uri
 * @param uri uri to hash
 * @returns hashed uri
 */
export const hashURI = (uri: string) => {
    return createHash('sha1').update(uri).digest('base64');
};
