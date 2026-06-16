/** Configuration loaded from environment and stored on the global document.app. */
export interface AppConfig {
    /** Base URL of the dashboard backend API. */
    backendUrl: string;
}

interface DocumentApp {
    config: AppConfig;
}

declare global {
    interface Document {
        app: DocumentApp;
    }
}

if (!document.app) {
    document.app = {} as DocumentApp;
}

/** Return the full document.app object. */
export function getDocumentApp(): DocumentApp {
    return document.app;
}

/**
 * Shallow-merge partial updates into document.app.
 *
 * Existing top-level keys not present in `partial` are preserved.
 */
export function updateDocumentApp(partial: Partial<DocumentApp>): void {
    Object.assign(document.app, partial);
}
