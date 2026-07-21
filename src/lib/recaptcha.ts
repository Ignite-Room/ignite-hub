// Shared reCAPTCHA v3 client helper — same pattern used in ReferralLanding.tsx,
// extracted so new forms (event registration) don't duplicate the script-loading logic.

type GrecaptchaWindow = Window & {
    grecaptcha?: { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> };
};

function loadRecaptcha(siteKey: string): Promise<void> {
    return new Promise((resolve) => {
        if ((window as GrecaptchaWindow).grecaptcha) return resolve();
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}

export async function getRecaptchaToken(siteKey: string, action = 'submit'): Promise<string | undefined> {
    try {
        await loadRecaptcha(siteKey);
        return await new Promise<string>((resolve, reject) => {
            const gr = (window as GrecaptchaWindow).grecaptcha;
            if (!gr) return reject(new Error('reCAPTCHA not available'));
            gr.ready(async () => {
                try {
                    const token = await gr.execute(siteKey, { action });
                    resolve(token);
                } catch (e) { reject(e); }
            });
        });
    } catch {
        return undefined; // non-blocking — backend will still validate
    }
}

export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
