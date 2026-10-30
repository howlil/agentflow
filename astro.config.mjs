import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

const siteUrl = process.env.PUBLIC_SITE_URL?.trim();
const socialUrl = siteUrl ? new URL('/og.png', siteUrl).toString() : null;

export default defineConfig({
  integrations: [
    starlight({
      title: 'Agentflow',
      logo: {
        src: './src/assets/brand-mark.svg',
      },
      head: [
        { tag: 'meta', attrs: { name: 'theme-color', content: '#0C0D10' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        ...(socialUrl ? [
          { tag: 'meta', attrs: { property: 'og:image', content: socialUrl } },
          { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
          { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
          { tag: 'meta', attrs: { name: 'twitter:image', content: socialUrl } },
        ] : []),
      ],
      description: 'Better judgment for AI agents. Portable engineering skills selected by the decision at hand.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/howlil/agentflow',
        },
      ],
      customCss: ['./src/styles/global.css'],
      components: {
        Header: './src/components/starlight/Header.astro',
        Hero: './src/components/starlight/Hero.astro',
      },
      sidebar: [
        { label: 'Overview', link: '/' },
        {
          label: 'Start',
          items: [
            'start/distribution',
            'start/quickstart',
            'start/install',
            'start/upgrade-and-migration',
            'start/native-plugins',
            'start/chatgpt-web',
            'start/cross-agent-compatibility',
            'start/release-and-rollback',
            'start/choose-a-skill',
            'start/deploy-cloudflare',
          ],
        },
        {
          label: 'Skills',
          items: [{ autogenerate: { directory: 'skills' } }],
        },
        {
          label: 'Runtime Reference',
          items: [{ autogenerate: { directory: 'reference' } }],
        },
        {
          label: 'Recipes',
          items: [
            'recipes/build-a-feature',
            'recipes/redesign-a-ui-flow',
            'recipes/safe-release',
            'recipes/run-code-from-chatgpt',
          ],
        },
        {
          label: 'System',
          items: ['concepts/skill-system'],
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
