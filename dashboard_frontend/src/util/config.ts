import { updateDocumentApp } from "./document-app";
import type { AppConfig } from "./document-app";

const envMappings: Array<[string, keyof AppConfig]> = [
    ["VITE_BACKEND_URL", "backendUrl"],
    ["VITE_AIRFLOW_URL", "airflowUrl"],
];

const config: Record<string, string> = {};
for (const [envName, configKey] of envMappings) {
    const value = import.meta.env[envName];
    if (value === undefined) {
        throw new Error(`${envName} is not set.`);
    }
    config[configKey] = value;
}
updateDocumentApp({ config: config as unknown as AppConfig });
