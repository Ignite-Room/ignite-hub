import { useEffect } from 'react';

const SITE_URL = 'https://www.igniteroom.in';
const DEFAULT_TITLE = 'Ignite Room';

interface SEOOptions {
    /** Rendered as "{title} | Ignite Room" unless it already contains "Ignite Room". */
    title: string;
    description: string;
    /** Path only, e.g. "/ambassador". Defaults to the current path. */
    path?: string;
    /** Keep this page out of search results (referral links, personalized views, etc). */
    noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
    let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string) {
    document.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/**
 * Sets per-route document title, meta description, canonical URL, and OG/Twitter
 * tags. This is a plain SPA (no SSR/prerendering), so social-media crawlers that
 * don't execute JS only ever see the index.html defaults — this mainly helps
 * Googlebot (which does render JS) and gives in-app navigation correct tab titles.
 */
export function useSEO({ title, description, path, noindex }: SEOOptions) {
    useEffect(() => {
        const fullTitle = title.includes('Ignite Room') ? title : `${title} | ${DEFAULT_TITLE}`;
        document.title = fullTitle;

        upsertMeta('name', 'description', description);
        upsertMeta('property', 'og:title', fullTitle);
        upsertMeta('property', 'og:description', description);
        upsertMeta('name', 'twitter:title', fullTitle);
        upsertMeta('name', 'twitter:description', description);

        const url = `${SITE_URL}${path ?? window.location.pathname}`;
        upsertMeta('property', 'og:url', url);

        let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = url;

        if (noindex) {
            upsertMeta('name', 'robots', 'noindex, nofollow');
        } else {
            removeMeta('name', 'robots');
        }
    }, [title, description, path, noindex]);
}

const STRUCTURED_DATA_ID = 'structured-data';

/**
 * Injects a single JSON-LD <script> tag for the current page (e.g. schema.org
 * Event or JobPosting), replacing whatever was there before. Pass `null` to
 * remove it (e.g. while the underlying data is still loading). Only one
 * structured-data block is supported per page — same pattern as useSEO's
 * single canonical link, since this SPA has no server-side composition to
 * merge multiple sources.
 */
export function useStructuredData(schema: Record<string, unknown> | null) {
    useEffect(() => {
        const existing = document.getElementById(STRUCTURED_DATA_ID);
        existing?.remove();

        if (!schema) return;

        const script = document.createElement('script');
        script.id = STRUCTURED_DATA_ID;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            document.getElementById(STRUCTURED_DATA_ID)?.remove();
        };
    }, [schema]);
}
