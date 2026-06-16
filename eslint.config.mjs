import nextConfig from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  {
    ignores: ['dist/**', '.vinext/**', '.wrangler/**'],
  },
  ...nextConfig,
];

export default eslintConfig;
