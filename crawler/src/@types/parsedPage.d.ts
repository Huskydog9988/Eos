import { parsedLink } from './parsedLink';

export interface ParsedPage {
    url: string;
    title: string;
    description: string;
    keywords: string[];
    links: parsedLink[];
}
