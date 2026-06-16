import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const FILES = ["dashboard_frontend/**/*.{ts,tsx,js,jsx}"];


export default tseslint.config(
    {
        // NOTE: FILES passed to recommended configs does not currently
        // prevent eslint from walking over all project dirs,
        // so large ones are explicitly excluded
        ignores: [
            "node_modules/**",
            ".venv/**",
            "dashboard_frontend/dist/**",
        ]
    },

    {
        ...js.configs.recommended,
        files: FILES,
    },
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: FILES,
    })),

    // // Custom rules can be added here
    // {
    //     files: FILES,
    //     rules: {
    //         '@typescript-eslint/no-explicit-any': 'warn',
    //     },
    // }
);
