import React, { useState } from 'react';
import { useI18n } from '../../i18n/context';
import { inquiriesApi } from '../../api/inquiriesApi';
import { Button } from '../storefront/Button';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';

export const NewsletterSection: React.FC = () => {
  const { locale, t } = useI18n();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage(t('newsletter.emailRequired'));
      return;
    }

    if (!validateEmail(trimmed)) {
      setErrorMessage(t('newsletter.emailInvalid'));
      return;
    }

    setIsSubmitting(true);
    try {
      await inquiriesApi.subscribeNewsletter(trimmed, locale);
      setIsSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error('Error submitting newsletter subscription to Firestore:', err);
      setErrorMessage(t('newsletter.subscribeError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="homepage-newsletter-section"
      aria-label={t('newsletter.sectionAria')}
      className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20"
    >
      <div className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-8 sm:p-14 lg:p-20 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860] mb-3 block">
          {t('newsletter.eyebrow')}
        </span>

        {/* Heading */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1A17] font-normal leading-tight max-w-2xl mb-4">
          {t('newsletter.headline')}
        </h2>

        {/* Editorial Subtitle */}
        <p className="text-[14px] sm:text-[16px] text-[#7A736A] font-body font-light max-w-xl leading-relaxed mb-8">
          {t('newsletter.subtitle')}
        </p>

        {/* Form Container / Inline State */}
        {!isSuccess ? (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex flex-col items-center gap-3"
            noValidate
          >
            {/* Single-field input row on desktop/tablet, stacked full-width on mobile */}
            <div className="w-full flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  id="newsletter-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isSubmitting}
                  placeholder={t('newsletter.placeholder')}
                  className={`w-full h-12 px-4 bg-[#FFFFFF] border rounded-[2px] text-[14px] font-body text-[#1C1A17] placeholder:text-[#7A736A]/60 focus:outline-none transition-colors ${
                    errorMessage
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-[#E4DED3] focus:border-[#A98860]'
                  }`}
                  aria-label={t('common.email')}
                  required
                />
              </div>

              <Button
                id="newsletter-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting}
                rightIcon={
                  isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <DirectionalArrowRight className="w-4 h-4" />
                  )
                }
                className="h-12 px-6 whitespace-nowrap min-w-[140px] shadow-none font-mono text-[12px] uppercase tracking-wider"
              >
                {isSubmitting ? t('newsletter.subscribing') : t('newsletter.subscribe')}
              </Button>
            </div>

            {/* Inline Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 text-xs font-mono text-red-600 text-start self-start pt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Privacy Note */}
            <span className="text-[11px] font-mono text-[#7A736A]/80 pt-2 block">
              {t('newsletter.privacyNote')}
            </span>
          </form>
        ) : (
          /* Minimal Inline Success State */
          <div
            id="newsletter-success-feedback"
            className="w-full max-w-md p-6 bg-[#FFFFFF] border border-[#A98860]/40 rounded-[2px] flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#A98860] flex items-center justify-center text-[#A98860]">
              <Check className="w-4 h-4" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-lg text-[#1C1A17]">
                {t('newsletter.successTitle')}
              </h3>
              <p className="text-[13px] text-[#7A736A] font-body">
                {t('newsletter.successSubtitle')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setEmail('');
              }}
              className="text-[11px] font-mono text-[#A98860] hover:text-[#1C1A17] underline transition-colors pt-1 cursor-pointer"
            >
              {t('newsletter.enrollAnother')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
