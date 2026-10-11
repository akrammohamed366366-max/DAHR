import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useI18n } from '../../i18n/context';
import { journalApi } from '../../api/journalApi';
import { JournalArticle } from '../../types/backend';
import { Button } from '../storefront/Button';
import { Loader2 } from 'lucide-react';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { editorialRevealVariants } from '../../utils/motion';

import defaultTaifImg from '../../assets/images/journal_taif_harvest_1788119728547.jpg';
import defaultOudImg from '../../assets/images/journal_oud_aging_1788119740344.jpg';
import defaultAmberImg from '../../assets/images/journal_amber_frankincense_1788119758960.jpg';

interface JournalPreviewSectionProps {
  onNavigateToJournal: (articleId?: string) => void;
}

const DEFAULT_ARTICLE_IMAGES: Record<string, string> = {
  'article-taif-dawn-harvest': defaultTaifImg,
  'article-cambodian-oud-aging': defaultOudImg,
  'article-green-hojari-frankincense': defaultAmberImg,
  'article-architecture-of-sillage': defaultOudImg,
};

export const JournalPreviewSection: React.FC<JournalPreviewSectionProps> = ({
  onNavigateToJournal,
}) => {
  const { locale, t } = useI18n();
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchJournalArticles() {
      try {
        setIsLoading(true);
        setError(null);
        const docs = await journalApi.getPublishedArticles();
        if (isMounted) {
          // Take the 3 most recent published articles
          setArticles(docs.slice(0, 3));
        }
      } catch (err: any) {
        console.error('Error fetching journal articles from Firestore:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load journal articles');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchJournalArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveArticleImage = (article: JournalArticle, index: number) => {
    if (DEFAULT_ARTICLE_IMAGES[article.id]) {
      return DEFAULT_ARTICLE_IMAGES[article.id];
    }
    if (article.heroImage && (article.heroImage.startsWith('http') || article.heroImage.startsWith('data:') || article.heroImage.startsWith('/src/'))) {
      return article.heroImage;
    }
    const fallbackList = [defaultTaifImg, defaultOudImg, defaultAmberImg];
    return fallbackList[index % fallbackList.length];
  };

  const formatPublishDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section
      id="homepage-journal-preview"
      aria-label={t('journalPreview.sectionAria')}
      className="w-full max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col gap-10 sm:gap-12"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4DED3] pb-6">
        <div className="flex flex-col gap-2 text-start">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
            {t('journalPreview.eyebrow')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A17]">
            {t('journalPreview.headline')}
          </h2>
          <p className="text-[14px] text-[#7A736A] max-w-xl font-body">
            {t('journalPreview.subtitle')}
          </p>
        </div>

        <Button
          id="journal-view-all-btn"
          variant="text"
          size="sm"
          rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
          onClick={() => onNavigateToJournal()}
        >
          {t('journalPreview.readAll')}
        </Button>
      </div>

      {/* Content Area: Loading / Error / 3-Up Grid */}
      {isLoading ? (
        <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 text-[#7A736A] font-mono text-[13px] border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
          <Loader2 className="w-6 h-6 animate-spin text-[#A98860]" />
          <span>{t('journalPreview.loading')}</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px] flex flex-col items-center gap-3">
          <p className="text-[#7A736A] font-body text-sm">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            {t('journalPreview.retry')}
          </Button>
        </div>
      ) : articles.length > 0 ? (
        /* Desktop: 3-up, Tablet: 2-up, Mobile: 1-up */
        <motion.div
          variants={editorialRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {articles.map((article, idx) => {
            const title = locale === 'ar' ? article.title.ar : article.title.en;
            const excerpt = locale === 'ar' ? article.excerpt.ar : article.excerpt.en;
            const imageSrc = resolveArticleImage(article, idx);

            return (
              <article
                key={article.id}
                id={`journal-preview-card-${article.id}`}
                className="group flex flex-col justify-between bg-[#FAF7F2] border border-[#E4DED3] hover:border-[#A98860] transition-all duration-300 rounded-[2px] overflow-hidden text-start"
              >
                <div>
                  {/* Aspect Ratio Editorial Image */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden bg-[#1C1A17] cursor-pointer"
                    onClick={() => onNavigateToJournal(article.id)}
                  >
                    <img
                      src={imageSrc}
                      alt={title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141311]/40 to-transparent pointer-events-none" />
                  </div>

                  {/* Article Text Content */}
                  <div className="p-6 sm:p-7 flex flex-col gap-3">
                    {/* Timestamp & Category */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#A98860]">
                      <span>{formatPublishDate(article.publishedAt)}</span>
                      <span className="uppercase tracking-wider">
                        {t('journalPreview.essayTag')}
                      </span>
                    </div>

                    {/* Article Title */}
                    <h3
                      className="font-serif text-xl sm:text-2xl text-[#1C1A17] font-normal leading-snug group-hover:text-[#A98860] transition-colors cursor-pointer"
                      onClick={() => onNavigateToJournal(article.id)}
                    >
                      {title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[13px] sm:text-[14px] text-[#7A736A] font-body font-light leading-relaxed line-clamp-3">
                      {excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-6 sm:p-7 pt-0 border-t border-[#E4DED3]/60 mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigateToJournal(article.id)}
                    className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#1C1A17] group-hover:text-[#A98860] transition-colors cursor-pointer"
                  >
                    <span>{t('journalPreview.readArticle')}</span>
                    <DirectionalArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[11px] font-mono text-[#7A736A]">
                    {t('journalPreview.readTime')}
                  </span>
                </div>
              </article>
            );
          })}
        </motion.div>
      ) : (
        <div className="py-12 text-center text-[#7A736A] font-mono text-[13px] border border-[#E4DED3] bg-[#FAF7F2] rounded-[2px]">
          {t('journalPreview.noArticles')}
        </div>
      )}
    </section>
  );
};
