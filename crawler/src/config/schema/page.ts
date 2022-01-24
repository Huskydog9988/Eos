import mongoose, { Schema } from 'mongoose';
import { PageScheme } from '../../@types/Page';

export const pageSchema = new Schema<PageScheme>({
    // url for page
    url: { type: String, index: true, unique: true, required: true },
    // url hash
    hash: { type: String, index: true, unique: true, required: true },
    // page title
    title: { type: String, required: true },
    // page description
    description: { type: String, required: true },
    // page keywords
    keywords: { type: [String], required: true },
    // number of times page has been scraped
    scans: { type: Number, default: 0, required: true },
    // date of first scan
    created: { type: Number, default: Date.now },
    // date if last scan
    updated: { type: Number, default: Date.now },
});

export const Page = mongoose.model<PageScheme>('Page', pageSchema);
