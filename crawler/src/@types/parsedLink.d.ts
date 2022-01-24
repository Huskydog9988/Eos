export interface parsedLink {
    name: string;
    data: {
        url: string;
    };
    opts?: {
        jobId?: string;
    };
}
