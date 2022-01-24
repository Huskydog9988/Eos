import { Schema } from 'mongoose';

export interface PageScheme {
    url: string;
    hash: string;
    title: string;
    description: string;
    keywords: string[];
    scans: number;
    created: number;
    updated: number;
}
