import js from '@eslint/js';
import tseslint from 'typescript-eslint';


export default tseslint.config(
    {
        ignores: [
            "node_modules/**",
            "dashboard_frontend/dist/**",
            ".venv/**"
        ]
    },

    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // files: [
        //     "dashboard_frontend/**/*.{ts,tsx,js,jsx}"
        // ],
        // rules: {
        //     '@typescript-eslint/no-explicit-any': 'warn',
        // },
    }
);
