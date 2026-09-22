import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Agentflow',
      description: 'A practical guide to choosing and composing reusable software-engineering agent skills.',
      social: {
        github: 'https://github.com/howlil/agentflow',
      },
      customCss: ['./src/styles/global.css'],
      sidebar: [
        { label: 'Overview', link: '/' },
        {
          label: 'Start',
          items: [
            'start/quickstart',
            'start/choose-a-skill',
            'start/deploy-cloudflare',
          ],
        },
        {
          label: 'Skills',
          items: [
            'skills/product-design',
            'skills/engineering-design',
            'skills/design-graph',
            'skills/design-thinking',
            'skills/test-engineering',
            'skills/production-ops',
            'skills/code-review',
            'skills/security-review',
            'skills/graph-protocol',
            'skills/call-graph-output',
          ],
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
