import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { journalApi } from '../../api/journalApi';
import { JournalArticle } from '../../types/backend';
import { resolveArticleImage, formatPublishDate, calculateReadingTime } from './journalUtils';
import { DirectionalArrowLeft, DirectionalArrowRight } from '../ui/DirectionalIcon';
import { Button } from '../storefront/Button';
import { RouteId } from '../../types';

export interface ArticleDetailPageProps {
  articleId: string;
  onBackToJournal: () => void;
  onSelectArticle: (articleId: string) => void;
  onRouteChange: (route: RouteId) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  articleId,
  onBackToJournal,
  onSelectArticle,
  onRouteChange,
}) => {
  const { locale } = useI18n();
  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadArticleAndRelated() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch single article
        const currentDoc = await journalApi.getArticleById(articleId);
        if (!currentDoc) {
          if (isMounted) {
            setError(
              locale === 'ar'
                ? 'المقال المطلوب غير موجود أو تم نقله.'
                : 'The requested essay could not be found or has been moved.'
            );
            setIsLoading(false);
          }
          return;
        }

        // Fetch all published articles to extract 1-3 related ones
        const allPublished = await journalApi.getPublishedArticles();
        const related = allPublished.filter((a) => a.id !== articleId).slice(0, 3);

        if (isMounted) {
          setArticle(currentDoc);
          setRelatedArticles(related);
        }
      } catch (err: any) {
        console.error(`Error loading article ${articleId}:`, err);
        if (isMounted) {
          setError(
            locale === 'ar'
              ? 'حدث خطأ أثناء تحميل المقال. يرجى المحاولة مرة أخرى.'
              : 'An error occurred while loading this article. Please try again.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArticleAndRelated();

    return () => {
      isMounted = false;
    };
  }, [articleId, locale]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-20 min-h-[450px] flex flex-col items-center justify-center gap-4 text-[#7A736A] font-mono text-xs border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#A98860]" />
        <span>{locale === 'ar' ? 'جاري فتح مقال المجلة...' : 'Opening journal essay...'}</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-8 py-20 text-center flex flex-col items-center gap-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17]">
          {locale === 'ar' ? 'المقال غير متوفر' : 'Essay Unavailable'}
        </h2>
        <p className="text-sm text-[#7A736A] font-body max-w-md">
          {error || (locale === 'ar' ? 'لم يتم العثور على المقال.' : 'Article not found.')}
        </p>
        <Button variant="primary" size="md" onClick={onBackToJournal}>
          {locale === 'ar' ? 'العودة إلى فهرس المجلة' : 'Return to Journal Index'}
        </Button>
      </div>
    );
  }

  const title = locale === 'ar' ? article.title.ar : article.title.en;
  const excerpt = locale === 'ar' ? article.excerpt.ar : article.excerpt.en;
  const body = locale === 'ar' ? article.body.ar : article.body.en;
  const imageSrc = resolveArticleImage(article, 0);
  const readingTime = calculateReadingTime(body, locale);
  const publishDate = formatPublishDate(article.publishedAt, locale);

  // Split paragraphs for editorial rendering
  const paragraphs = body
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Derive an authentic pull quote if paragraphs exist
  const pullQuote =
    paragraphs.length > 1
      ? paragraphs[1]
      : excerpt;

  return (
    <div
      id="article-detail-page"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 sm:gap-16 pb-24 text-start animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION / BREADCRUMB                                            */}
      {/* ========================================================================= */}
      <nav aria-label={locale === 'ar' ? 'مسار التنقل' : 'Breadcrumb'} className="pt-2">
        <button
          type="button"
          onClick={onBackToJournal}
          className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-wider text-[#7A736A] hover:text-[#A98860] transition-colors cursor-pointer group"
        >
          <DirectionalArrowLeft className="w-4 h-4 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{locale === 'ar' ? 'العودة إلى فهرس المجلة' : 'Back to Journal Index'}</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 2. ARTICLE HEADER                                                         */}
      {/* ========================================================================= */}
      <header className="flex flex-col gap-6 max-w-4xl mx-auto w-full text-start">
        {/* Category & Date Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#A98860]">
          <span className="uppercase tracking-[0.2em] font-medium">
            {locale === 'ar' ? 'دراسة شمية متخصصة' : 'OLFACTIVE ESSAY'}
          </span>
          <span>•</span>
          <span>{publishDate}</span>
          <span>•</span>
          <span>{readingTime}</span>
        </div>

        {/* H1 Main Heading */}
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1A17] font-normal leading-[1.12] tracking-tight">
          {title}
        </h1>

        {/* Excerpt Lead */}
        <p className="text-lg sm:text-xl text-[#554F47] font-body font-light leading-relaxed border-s-2 border-[#A98860] ps-4 py-1">
          {excerpt}
        </p>

        {/* Author Byline */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E4DED3] text-xs font-mono text-[#7A736A]">
          <div className="flex items-center gap-2">
            <span className="text-[#1C1A17] font-medium">
              {locale === 'ar' ? 'محترف دار DAHR' : 'DAHR Formulation Atelier'}
            </span>
            <span>•</span>
            <span>{locale === 'ar' ? 'الرياض / الهدا' : 'Riyadh & Al Hada'}</span>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-[#A98860]">
            {locale === 'ar' ? 'طبعة موثقة' : 'Archival Dispatch'}
          </span>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO IMAGE                                                             */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto aspect-[21/10] sm:aspect-[16/8] lg:aspect-[21/9] overflow-hidden rounded-[2px] bg-[#1C1A17] border border-[#E4DED3] relative shadow-xs">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-3 end-3 px-2.5 py-1 bg-[#141311]/80 text-[#D4C3A3] text-[10px] font-mono tracking-widest uppercase rounded-[1px] backdrop-blur-xs">
          {locale === 'ar' ? 'أرشيف الاستخلاص الميداني' : 'Field Extraction Archive'}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. LONG-FORM ARTICLE BODY (MAX 65-75ch MEASURE FOR READING COMFORT)        */}
      {/* ========================================================================= */}
      <main className="w-full max-w-3xl mx-auto flex flex-col gap-8 text-start">
        {paragraphs.map((pText, pIdx) => {
          // If 2nd paragraph, render as lead narrative
          if (pIdx === 0) {
            return (
              <p
                key={pIdx}
                className="text-base sm:text-lg text-[#1C1A17] leading-[1.85] font-body font-normal"
              >
                {pText}
              </p>
            );
          }

          // Insert an artistic Pull-Quote after paragraph 1 if multiple paragraphs exist
          if (pIdx === 1 && paragraphs.length > 2) {
            return (
              <React.Fragment key={pIdx}>
                {/* Mid-article Pull-Quote */}
                <aside
                  aria-label={locale === 'ar' ? 'اقتباس تحريري' : 'Editorial Pull Quote'}
                  className="my-6 p-6 sm:p-8 bg-[#FAF7F2] border-y border-[#E4DED3] flex flex-col gap-3"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                    {locale === 'ar' ? 'فلسفة الصياغة' : 'CORE PRINCIPLE'}
                  </span>
                  <blockquote className="font-serif text-xl sm:text-2xl text-[#1C1A17] italic leading-relaxed">
                    “{pullQuote}”
                  </blockquote>
                </aside>

                <p className="text-base sm:text-lg text-[#2D2A26] leading-[1.85] font-body font-light">
                  {pText}
                </p>
              </React.Fragment>
            );
          }

          return (
            <p
              key={pIdx}
              className="text-base sm:text-lg text-[#2D2A26] leading-[1.85] font-body font-light"
            >
              {pText}
            </p>
          );
        })}

        {/* Botanical / Scientific Note Footnote */}
        <div className="mt-8 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#A98860]">
            {locale === 'ar' ? 'توثيق العينات والمواد الخام' : 'SPECIMEN & ORIGIN DOCUMENTATION'}
          </h3>
          <p className="text-xs sm:text-sm text-[#7A736A] font-body leading-relaxed">
            {locale === 'ar'
              ? 'تخضع كافة المواد النباتية والراتنجات الطبيعية المذكورة في هذا المقال لمعايير الحصاد الأخلاقي والتقطير البطيء دون استخدام أي مذيبات صناعية ضارة.'
              : 'All botanical extractions and resinous tears referenced in this chronicle adhere strictly to low-temperature hydrodistillation and ethical wildcrafting protocols.'}
          </p>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. 1–3 RELATED ARTICLES SECTION                                           */}
      {/* ========================================================================= */}
      {relatedArticles.length > 0 && (
        <section
          id="related-journal-articles"
          aria-label={locale === 'ar' ? 'مقالات ذات صلة' : 'Related Olfactive Essays'}
          className="w-full max-w-5xl mx-auto pt-12 border-t border-[#E4DED3] flex flex-col gap-8 text-start"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
                {locale === 'ar' ? 'دراسات إضافية' : 'FURTHER READING'}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17]">
                {locale === 'ar' ? 'مقالات وتحقيقات ذات صلة' : 'Related Chronicles'}
              </h2>
            </div>
            <Button
              variant="text"
              size="sm"
              onClick={onBackToJournal}
              rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
            >
              {locale === 'ar' ? 'فهرس المجلة' : 'View All'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedArticles.map((relArt, rIdx) => {
              const rTitle = locale === 'ar' ? relArt.title.ar : relArt.title.en;
              const rExcerpt = locale === 'ar' ? relArt.excerpt.ar : relArt.excerpt.en;
              const rImage = resolveArticleImage(relArt, rIdx + 1);

              return (
                <article
                  key={relArt.id}
                  id={`related-article-${relArt.id}`}
                  className="group flex flex-col justify-between bg-[#FAF7F2] border border-[#E4DED3] hover:border-[#A98860] transition-all duration-300 rounded-[2px] overflow-hidden cursor-pointer shadow-2xs"
                  onClick={() => {
                    onSelectArticle(relArt.id);
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                >
                  <div>
                    <div className="aspect-[16/10] overflow-hidden bg-[#1C1A17]">
                      <img
                        src={rImage}
                        alt={rTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      <span className="text-[10px] font-mono text-[#A98860]">
                        {formatPublishDate(relArt.publishedAt, locale)}
                      </span>
                      <h3 className="font-serif text-lg text-[#1C1A17] group-hover:text-[#A98860] transition-colors leading-snug">
                        {rTitle}
                      </h3>
                      <p className="text-xs text-[#7A736A] font-body line-clamp-2">
                        {rExcerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-[#E4DED3]/60 mt-2 flex items-center justify-between text-xs font-mono uppercase text-[#1C1A17] group-hover:text-[#A98860] transition-colors">
                    <span>{locale === 'ar' ? 'قراءة المقال' : 'Read Essay'}</span>
                    <DirectionalArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. BOTTOM ACTION BAR                                                      */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-3xl mx-auto pt-8 border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="secondary" size="md" onClick={onBackToJournal}>
          {locale === 'ar' ? 'العودة إلى فهرس المجلة' : 'Back to Journal Index'}
        </Button>
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
        >
          {locale === 'ar' ? 'استكشاف تشكيلة العطور' : 'Explore Fragrances'}
        </Button>
      </footer>
    </div>
  );
};
