import defaultTaifImg from '../../assets/images/journal_taif_harvest_1788119728547.jpg';
import defaultOudImg from '../../assets/images/journal_oud_aging_1788119740344.jpg';
import defaultAmberImg from '../../assets/images/journal_amber_frankincense_1788119758960.jpg';
import brandStoryImg from '../../assets/images/brand_story_editorial_1788042561323.jpg';
import heroVisualPath from '../../assets/images/hero_editorial_visual_1788041813228.jpg';
import { JournalArticle } from '../../types/backend';

const DEFAULT_IMAGE_MAP: Record<string, string> = {
  'article-taif-dawn-harvest': defaultTaifImg,
  'article-cambodian-oud-aging': defaultOudImg,
  'article-green-hojari-frankincense': defaultAmberImg,
  'article-architecture-of-sillage': heroVisualPath,
};

const FALLBACK_IMAGES = [
  defaultTaifImg,
  defaultOudImg,
  defaultAmberImg,
  brandStoryImg,
  heroVisualPath,
];

export function resolveArticleImage(article: JournalArticle, index: number = 0): string {
  if (DEFAULT_IMAGE_MAP[article.id]) {
    return DEFAULT_IMAGE_MAP[article.id];
  }
  if (
    article.heroImage &&
    (article.heroImage.startsWith('http') ||
      article.heroImage.startsWith('data:') ||
      article.heroImage.startsWith('/src/'))
  ) {
    return article.heroImage;
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

export function formatPublishDate(dateStr: string, locale: 'en' | 'ar'): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function calculateReadingTime(text: string, locale: 'en' | 'ar'): string {
  if (!text) return locale === 'ar' ? '٤ دقائق قراءة' : '4 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(words / 180));
  if (locale === 'ar') {
    return `${minutes} دقائق قراءة`;
  }
  return `${minutes} min read`;
}
