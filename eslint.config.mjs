import js from '@eslint/js';
import tseslint from 'typescript-eslint';


export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // rules: {
        //     // Здесь вы можете переопределять или добавлять свои правила
        //     '@typescript-eslint/no-explicit-any': 'warn',
        // },
    }
);
