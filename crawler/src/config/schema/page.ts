import mongoose, { Schema } from 'mongoose';

export const pageSchema = new Schema({
    // url for page
    url: { type: String, index: true, unique: true },
    // url hash
    hash: { type: String, index: true, unique: true },
    // page title
    title: String,
    // page description
    description: String,
    // page keywords
    keywords: [String],
    // number of times page has been scraped
    scans: { type: Number, default: 1 },
    // date of first scan
    created: { type: Date, default: Date.now },
    // date if last scan
    updated: { type: Date, default: Date.now },
});

export const Page = mongoose.model('Page', pageSchema);
