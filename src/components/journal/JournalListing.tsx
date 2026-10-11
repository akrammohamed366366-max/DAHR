import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { journalApi } from '../../api/journalApi';
import { JournalArticle } from '../../types/backend';
import { resolveArticleImage, formatPublishDate, calculateReadingTime } from './journalUtils';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { Button } from '../storefront/Button';
import { RouteId } from '../../types';

export interface JournalListingProps {
  onSelectArticle: (articleId: string) => void;
  onRouteChange: (route: RouteId) => void;
}

export const JournalListing: React.FC<JournalListingProps> = ({
  onSelectArticle,
  onRouteChange,
}) => {
  const { locale } = useI18n();
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchPublishedArticles() {
      try {
        setIsLoading(true);
        setError(null);
        const docs = await journalApi.getPublishedArticles();
        if (isMounted) {
          setArticles(docs);
        }
      } catch (err: any) {
        console.error('Error fetching published journal articles:', err);
        if (isMounted) {
          setError(
            locale === 'ar'
              ? 'تعذر استرجاع مقالات المجلة حالياً. يرجى إعادة المحاولة لاحقاً.'
              : 'Unable to retrieve journal essays at this time. Please try again shortly.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchPublishedArticles();

    return () => {
      isMounted = false;
    };
  }, [locale]);

  return (
    <div
      id="journal-listing-page"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 sm:gap-16 pb-20 text-start animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER SECTION                                               */}
      {/* ========================================================================= */}
      <header className="flex flex-col gap-4 border-b border-[#E4DED3] pb-8 pt-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860] font-medium">
            {locale === 'ar' ? 'المجلة الشمية • تحقيقات ودراسات' : 'THE OLFACTIVE JOURNAL • ESSAYS & DISPATCHES'}
          </span>
          <span className="w-8 h-px bg-[#A98860]/40" />
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1A17] font-normal tracking-tight max-w-3xl leading-[1.18]">
          {locale === 'ar'
            ? 'توثيق مواسم الحصاد وكيمياء الصبر في صناعة العطور النادرة'
            : 'Chronicles of Highland Harvests, Aged Resins, and Slow Maceration'}
        </h1>

        <p className="text-sm sm:text-base font-body text-[#7A736A] max-w-2xl leading-relaxed">
          {locale === 'ar'
            ? 'دراسات وتأملات دورية يصدرها محترف دار DAHR، تغوص في أسرار تقطير خلاصات الزهور البرية، علوم تعتيق خشب العود في براميل الأرز، وفلسفة صياغة العطور المعمارية.'
            : 'Periodic essays and field dispatches from the DAHR formulation laboratory, detailing the chemistry of wild botanicals, mountain rose extractions, and the architecture of enduring sillage.'}
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT: LOADING / ERROR / EDITORIAL GRID                         */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="min-h-[380px] flex flex-col items-center justify-center gap-4 text-[#7A736A] font-mono text-xs border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#A98860]" />
          <span>{locale === 'ar' ? 'جاري استرجاع مقالات المجلة من السجل...' : 'Retrieving journal essays from archive...'}</span>
        </div>
      ) : error ? (
        <div className="p-8 sm:p-12 text-center border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px] flex flex-col items-center gap-4">
          <p className="text-sm text-[#7A736A] font-body max-w-md">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      ) : articles.length > 0 ? (
        <div className="flex flex-col gap-12 sm:gap-16">
          {/* Featured Lead Article (Top Row) */}
          {articles[0] && (
            <article
              id={`featured-journal-article-${articles[0].id}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-[#FAF7F2] border border-[#E4DED3] hover:border-[#A98860] transition-all duration-300 rounded-[2px] p-6 sm:p-8 lg:p-10 cursor-pointer shadow-xs"
              onClick={() => onSelectArticle(articles[0].id)}
            >
              {/* Lead Image (7 Cols on Desktop) */}
              <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] overflow-hidden rounded-[2px] bg-[#1C1A17] relative">
                <img
                  src={resolveArticleImage(articles[0], 0)}
                  alt={locale === 'ar' ? articles[0].title.ar : articles[0].title.en}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 start-3">
                  <span className="px-2.5 py-1 bg-[#141311]/85 text-[#D4C3A3] text-[9px] sm:text-[10px] font-mono uppercase tracking-widest rounded-[2px] backdrop-blur-xs">
                    {locale === 'ar' ? 'المقال الافتتاحي' : 'FEATURED ESSAY'}
                  </span>
                </div>
              </div>

              {/* Lead Text (5 Cols on Desktop) */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-6 text-start">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs font-mono text-[#A98860]">
                    <span>{formatPublishDate(articles[0].publishedAt, locale)}</span>
                    <span>•</span>
                    <span>{calculateReadingTime(locale === 'ar' ? articles[0].body.ar : articles[0].body.en, locale)}</span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1C1A17] font-normal leading-tight group-hover:text-[#A98860] transition-colors">
                    {locale === 'ar' ? articles[0].title.ar : articles[0].title.en}
                  </h2>

                  <p className="text-sm sm:text-base text-[#554F47] font-body leading-relaxed line-clamp-4">
                    {locale === 'ar' ? articles[0].excerpt.ar : articles[0].excerpt.en}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E4DED3] flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1C1A17] group-hover:text-[#A98860] transition-colors">
                    <span>{locale === 'ar' ? 'قراءة المقال الكامل' : 'Read Full Essay'}</span>
                    <DirectionalArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[11px] font-mono text-[#7A736A]">
                    {locale === 'ar' ? 'محترف الرياض' : 'Riyadh Atelier'}
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* Subsequent Articles Grid: Desktop 3-col, Tablet 2-col, Mobile 1-col */}
          {articles.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {articles.slice(1).map((article, idx) => {
                const title = locale === 'ar' ? article.title.ar : article.title.en;
                const excerpt = locale === 'ar' ? article.excerpt.ar : article.excerpt.en;
                const bodyText = locale === 'ar' ? article.body.ar : article.body.en;
                const imageSrc = resolveArticleImage(article, idx + 1);

                return (
                  <article
                    key={article.id}
                    id={`journal-grid-card-${article.id}`}
                    className="group flex flex-col justify-between bg-[#FAF7F2] border border-[#E4DED3] hover:border-[#A98860] transition-all duration-300 rounded-[2px] overflow-hidden text-start cursor-pointer shadow-2xs"
                    onClick={() => onSelectArticle(article.id)}
                  >
                    <div>
                      {/* Thumbnail Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-[#1C1A17]">
                        <img
                          src={imageSrc}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/40 to-transparent pointer-events-none" />
                      </div>

                      {/* Card Content */}
                      <div className="p-6 sm:p-7 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#A98860]">
                          <span>{formatPublishDate(article.publishedAt, locale)}</span>
                          <span>{calculateReadingTime(bodyText, locale)}</span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl text-[#1C1A17] font-normal leading-snug group-hover:text-[#A98860] transition-colors">
                          {title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#7A736A] font-body leading-relaxed line-clamp-3">
                          {excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row */}
                    <div className="p-6 sm:p-7 pt-0 border-t border-[#E4DED3]/60 mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#1C1A17] group-hover:text-[#A98860] transition-colors">
                        <span>{locale === 'ar' ? 'متابعة القراءة' : 'Read Article'}</span>
                        <DirectionalArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-[#7A736A] font-mono text-xs border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
          {locale === 'ar' ? 'لا توجد مقالات منشورة حالياً في السجل.' : 'No published articles found in the archive.'}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FOOTER CTA TO EXPLORE SHOP                                             */}
      {/* ========================================================================= */}
      <section className="p-8 sm:p-12 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-start">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
            {locale === 'ar' ? 'خلاصات عطرية نقية' : 'PURE EXTRAITS'}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl text-[#1C1A17]">
            {locale === 'ar' ? 'اختبر الخلاصات الموثقة في المقالات' : 'Experience the Olfactive Compositions'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7A736A] font-body">
            {locale === 'ar'
              ? 'تذوق أندر مستخلصات العود المعتق وورد الطائف عبر تشكيلة عطور DAHR.'
              : 'Explore the perfumes formulated from the wild botanicals and resins featured in our journal.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            onRouteChange('shop');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          {locale === 'ar' ? 'استكشاف المتجر' : 'Explore Fragrances'}
        </Button>
      </section>
    </div>
  );
};
