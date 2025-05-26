// Flat Config 기반 ESLint 설정 파일 (ESM 문법 사용)
import eslintPluginImport from 'eslint-plugin-import' // import 정렬, 중복 검사 등
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y' // 접근성 검사 (alt 속성, aria 등)
import eslintPluginReact from 'eslint-plugin-react' // React 문법 검사
import eslintPluginReactHooks from 'eslint-plugin-react-hooks' // useEffect/useCallback 규칙
import tseslint from 'typescript-eslint' // TypeScript 코드 분석기
import prettier from 'eslint-config-prettier' // Prettier와 충돌나는 ESLint 규칙 끄기

/** @type {import("eslint").Linter.FlatConfig} */
export default [
    {
        ignores: ['node_modules', '.next', 'dist', 'build'], // 검사에서 제외할 디렉토리
    },
    ...tseslint.config({
        files: ['**/*.ts', '**/*.tsx'],
        // project: true, // tsconfig.json 기반 타입 검사
    }),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], // 이 규칙은 모든 JS/TS 파일에 적용
        languageOptions: {
            parser: tseslint.parser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
                project: './tsconfig.json', // optional: 타입 정보를 쓰는 경우
            }
        },
        plugins: {
            import: eslintPluginImport,
            'jsx-a11y': eslintPluginJsxA11y,
            react: eslintPluginReact,
            'react-hooks': eslintPluginReactHooks,
        },
        rules: {
            'react/react-in-jsx-scope': 'off', // Next.js는 React import가 자동이라 필요 없음
            'react/prop-types': 'off', // TypeScript를 사용하므로 PropTypes 생략
            'react/jsx-uses-react': 'off',
            'react/jsx-uses-vars': 'error', // 사용되지 않는 JSX 변수 경고
            'import/order': [
                'warn',
                {
                    groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            '@typescript-eslint/no-redeclare': 'off',
        },
        settings: {
            react: { version: 'detect' },
        },
    },
    prettier,
]
