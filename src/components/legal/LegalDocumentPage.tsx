import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { DirectionalArrowLeft, DirectionalArrowRight } from '../ui/DirectionalIcon';
import { Button } from '../storefront/Button';
import { RouteId } from '../../types';
import { LEGAL_DOCUMENTS, LegalDocument } from '../../data/legalContent';

export interface LegalDocumentPageProps {
  documentKey: 'privacy' | 'terms' | 'shipping-returns';
  onRouteChange: (route: RouteId) => void;
}

export const LegalDocumentPage: React.FC<LegalDocumentPageProps> = ({
  documentKey,
  onRouteChange,
}) => {
  const { locale } = useI18n();
  const document: LegalDocument = LEGAL_DOCUMENTS[documentKey] || LEGAL_DOCUMENTS.privacy;

  const category = locale === 'ar' ? document.category.ar : document.category.en;
  const title = locale === 'ar' ? document.title.ar : document.title.en;
  const excerpt = locale === 'ar' ? document.excerpt.ar : document.excerpt.en;
  const disclaimer = locale === 'ar' ? document.disclaimer.ar : document.disclaimer.en;

  return (
    <div
      id={`legal-page-${documentKey}`}
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-10 sm:gap-14 pb-24 text-start animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB                                                         */}
      {/* ========================================================================= */}
      <nav aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'} className="pt-2">
        <button
          type="button"
          onClick={() => {
            onRouteChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#7A736A] hover:text-[#A98860] transition-colors cursor-pointer group"
        >
          <DirectionalArrowLeft className="w-4 h-4 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{locale === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 2. DOCUMENT HEADER                                                        */}
      {/* ========================================================================= */}
      <header className="flex flex-col gap-5 max-w-4xl mx-auto w-full text-start">
        {/* Metadata tag */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A98860]">
          <span className="uppercase tracking-[0.2em] font-medium">{category}</span>
          <span>•</span>
          <span>
            {locale === 'ar' ? `محدث: ${document.lastUpdated}` : `Updated: ${document.lastUpdated}`}
          </span>
          <span>•</span>
          <span>
            {locale === 'ar' ? 'أرشيف موثق' : 'Official Archive'}
          </span>
        </div>

        {/* Main H1 Title */}
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1A17] font-normal leading-[1.15] tracking-tight">
          {title}
        </h1>

        {/* Lead Excerpt */}
        <p className="text-base sm:text-lg text-[#554F47] font-body font-light leading-relaxed border-s-2 border-[#A98860] ps-4 py-1">
          {excerpt}
        </p>

        {/* Prominent Legal Review Disclaimer Banner */}
        <div
          id="legal-template-disclaimer"
          role="note"
          aria-label={locale === 'ar' ? 'إخلاء المسؤولية القانونية' : 'Legal Review Disclaimer'}
          className="p-4 sm:p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex items-start gap-3.5 mt-2 shadow-2xs"
        >
          <ShieldCheck className="w-5 h-5 text-[#A98860] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-widest font-semibold text-[#1C1A17]">
              {locale === 'ar' ? 'إشعار توثيقي — مسودة مراجعة قانونية' : 'DOCUMENT NOTICE — LEGAL REVIEW TEMPLATE'}
            </span>
            <p className="text-xs sm:text-[13px] text-[#7A736A] font-body leading-relaxed">
              {disclaimer}
            </p>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. LONG-FORM BODY (MAX 65-75ch MEASURE FOR OPTIMAL READABILITY)           */}
      {/* ========================================================================= */}
      <main className="w-full max-w-3xl mx-auto flex flex-col gap-10 text-start">
        {document.sections.map((section, idx) => {
          const sHeading = locale === 'ar' ? section.heading.ar : section.heading.en;

          return (
            <section
              key={section.id}
              id={section.id}
              className="flex flex-col gap-4 border-b border-[#E4DED3]/60 pb-8 last:border-b-0"
            >
              <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A17] font-medium leading-snug">
                {sHeading}
              </h2>

              <div className="flex flex-col gap-4">
                {section.paragraphs.map((p, pIdx) => {
                  const pText = locale === 'ar' ? p.ar : p.en;
                  return (
                    <p
                      key={pIdx}
                      className="text-[15px] sm:text-[16px] text-[#2D2A26] leading-[1.85] font-body font-light"
                    >
                      {pText}
                    </p>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* Official Atelier Contact Note */}
        <div className="p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2.5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#A98860]">
            {locale === 'ar' ? 'الاستفسارات القانونية والتنظيمية' : 'REGULATORY & LEGAL INQUIRIES'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7A736A] font-body leading-relaxed">
            {locale === 'ar'
              ? 'لأي استفسارات تتعلق بهذه السياسات أو ممارسة حقوقكم النظامية، يمكنكم التواصل مع أمانة الشؤون التنظيمية عبر legal@dahr.luxury أو مراسلة الكونسيرج العام.'
              : 'For inquiries regarding our compliance protocols or to exercise statutory rights, please contact our Regulatory Office at legal@dahr.luxury or engage the general concierge.'}
          </p>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. BOTTOM NAVIGATION TIER                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-3xl mx-auto pt-8 border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Quick links to alternate legal pages */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#7A736A] flex-wrap">
          {documentKey !== 'privacy' && (
            <button
              type="button"
              onClick={() => {
                onRouteChange('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </button>
          )}
          {documentKey !== 'terms' && (
            <button
              type="button"
              onClick={() => {
                onRouteChange('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}
            </button>
          )}
          {documentKey !== 'shipping-returns' && (
            <button
              type="button"
              onClick={() => {
                onRouteChange('shipping-returns');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#1C1A17] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'الشحن والاسترجاع' : 'Shipping & Returns'}
            </button>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            onRouteChange('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
        >
          {locale === 'ar' ? 'استكشاف التشكيلة العطرية' : 'Explore Fragrances'}
        </Button>
      </footer>
    </div>
  );
};
