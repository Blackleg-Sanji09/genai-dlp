export {};

declare global {
    interface Window {
        dlp: {
            openPlatform: (platform: string) => void;
        };
    }
}
