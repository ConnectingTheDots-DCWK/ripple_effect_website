import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { docsVersionsLoader } from 'starlight-versions/loader';

/**
 * All three collections are declared from the first commit even though two of
 * them are empty, because both are cheap now and awkward later.
 *
 * `i18n` holds Starlight's own UI strings — "On this page", "Previous" — per
 * language, in `src/content/i18n/<lang>.json`. `versions` is where
 * `starlight-versions` keeps its archived copies. Neither has anything in it
 * yet; declaring them means adding a language or cutting a version is content,
 * not configuration.
 */
export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
	versions: defineCollection({ loader: docsVersionsLoader() }),
};
