import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Agentflow',
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
            'start/native-plugins',
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
            'recipes/production-incident',
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
