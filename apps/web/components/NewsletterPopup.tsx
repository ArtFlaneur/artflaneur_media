import React, { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'af_newsletter_popup_v1';

type PopupState = {
  dismissedAt: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_COOLDOWN_DAYS = 180;

const readPopupState = (): PopupState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PopupState>;
    if (typeof parsed.dismissedAt !== 'number') return null;
    return { dismissedAt: parsed.dismissedAt };
  } catch {
    return null;
  }
};

const writePopupState = (state: PopupState) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
};

const getMailchimpActionUrl = () => {
  const trimmed = import.meta.env.VITE_MAILCHIMP_ACTION_URL?.trim();
  if (!trimmed) return null;

  // Mailchimp embed codes HTML-escape query separators as "&amp;".
  // Allow pasting the embed URL directly into env without manual decoding.
  return trimmed.replaceAll('&amp;', '&');
};

const getMailchimpHoneypotName = () => {
  return import.meta.env.VITE_MAILCHIMP_HONEYPOT_NAME?.trim() || null;
};

const getMailchimpActionUrlRaw = () => {
  return import.meta.env.VITE_MAILCHIMP_ACTION_URL ?? null;
};

const NewsletterPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actionUrl = useMemo(() => getMailchimpActionUrl(), []);
  const honeypotName = useMemo(() => getMailchimpHoneypotName(), []);
  const devDiagnostics = useMemo(() => {
    const isDev = Boolean(import.meta.env.DEV);
    const debugParamEnabled = (() => {
      try {
        return new URLSearchParams(window.location.search).has('debugNewsletter');
      } catch {
        return false;
      }
    })();

    if (!isDev && !debugParamEnabled) return null;

    const raw = getMailchimpActionUrlRaw();
    const cleaned = raw ? raw.trim().replaceAll('&amp;', '&') : null;

    return {
      mode: String(import.meta.env.MODE ?? ''),
      raw,
      cleaned,
      isDev,
    };
  }, []);

  useEffect(() => {
    const state = readPopupState();
    const now = Date.now();

    if (state && now - state.dismissedAt < DEFAULT_COOLDOWN_DAYS * DAY_MS) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsOpen(true);
    }, 2500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        writePopupState({ dismissedAt: Date.now() });
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }

    return undefined;
  }, [isOpen]);

  const dismiss = () => {
    setIsOpen(false);
    writePopupState({ dismissedAt: Date.now() });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close newsletter popup"
        onClick={dismiss}
      />

      <div className="absolute left-1/2 top-1/2 w-[min(92vw,820px)] -translate-x-1/2 -translate-y-1/2">
        <div className="border-2 border-black bg-white">
          <div className="flex items-start justify-between gap-6 border-b-2 border-black p-4 md:p-5">
            <div className="flex items-center gap-3">
              <img src="/Logo.png" alt="Art Flaneur" className="h-9 w-auto" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500">Newsletter</p>
                <p className="font-black uppercase tracking-wide">Art Flaneur</p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 inline-flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-black hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-b-2 border-black md:border-b-0 md:border-r-2 bg-art-yellow p-5 md:p-7">
              <h2 className="text-3xl md:text-4xl font-black uppercase leading-[0.95]">
                Get the best art updates.
              </h2>

              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-gray-700">
                No spam. Unsubscribe anytime.
              </p>
            </div>

            <div className="p-5 md:p-7">
              {!actionUrl ? (
                <div className="space-y-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-art-red">Mailchimp not configured</p>
                  <p className="text-sm text-gray-700">
                    Set <span className="font-mono">VITE_MAILCHIMP_ACTION_URL</span> to enable subscriptions.
                  </p>

                  {devDiagnostics ? (
                    <div className="border-2 border-black bg-art-paper p-4">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-600">Debug (dev only)</p>
                      <div className="mt-2 space-y-2 text-xs text-gray-800">
                        <p>
                          <span className="font-mono">MODE</span>: <span className="font-mono">{devDiagnostics.mode || 'unknown'}</span>
                        </p>
                        <p>
                          <span className="font-mono">DEV</span>: <span className="font-mono">{String(devDiagnostics.isDev)}</span>
                        </p>
                        <p className="break-words">
                          <span className="font-mono">VITE_MAILCHIMP_ACTION_URL</span> (raw):{' '}
                          <span className="font-mono">{devDiagnostics.raw ?? '(missing)'}</span>
                        </p>
                        <p className="break-words">
                          <span className="font-mono">parsed</span>:{' '}
                          <span className="font-mono">{devDiagnostics.cleaned ?? '(empty)'}</span>
                        </p>
                        <p className="text-gray-700">
                          If this shows <span className="font-mono">(missing)</span>, restart the dev server after editing{' '}
                          <span className="font-mono">apps/web/.env.local</span>. For production/preview builds, env vars must be
                          provided at build time in your hosting provider and you need a rebuild/redeploy.
                        </p>
                        <p className="text-gray-700">
                          Tip: add <span className="font-mono">?debugNewsletter=1</span> to the URL to show this block.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={dismiss}
                    className="w-full px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  action={actionUrl}
                  method="post"
                  target="_blank"
                  rel="noreferrer"
                  noValidate
                  onSubmit={() => {
                    // We can't read Mailchimp's response due to cross-origin.
                    // Mark as dismissed so we don't nag after submit.
                    writePopupState({ dismissedAt: Date.now() });
                    // Don't unmount the form synchronously, or the browser may cancel submission
                    // with: "Form submission canceled because the form is not connected".
                    window.setTimeout(() => setIsOpen(false), 150);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      className="block font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500"
                      htmlFor="mce-EMAIL"
                    >
                      Email
                    </label>
                    <input
                      id="mce-EMAIL"
                      name="EMAIL"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="mt-2 w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:border-art-red transition-colors"
                    />
                  </div>

                  {honeypotName ? (
                    <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                      <input type="text" tabIndex={-1} name={honeypotName} defaultValue="" />
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 bg-black text-white border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-art-blue transition-colors"
                    >
                      Subscribe
                    </button>
                    <button
                      type="button"
                      onClick={dismiss}
                      className="inline-flex items-center justify-center px-6 py-3 border-2 border-black font-mono text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    >
                      Not now
                    </button>
                  </div>

                  <p className="text-xs text-gray-600">
                    By subscribing you agree to receive email updates from Art Flaneur.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
