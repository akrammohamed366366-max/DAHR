import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Clock,
  Link,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  Edit3,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  RefreshCw,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { JournalArticle, ArticleStatus } from '../../../types/backend';
import { FormFieldGroup } from '../FormFieldGroup';
import { MissingLanguageModal, MissingFieldItem, getLanguageFieldStatus } from '../MissingLanguageModal';
import { uploadJournalHeroImage } from '../../../utils/storageUpload';
import { useI18n } from '../../../i18n/context';
import { calculateReadingTime } from '../../journal/journalUtils';

export interface JournalEditorProps {
  isOpen: boolean;
  article: JournalArticle | null;
  onClose: () => void;
  onSave: (article: JournalArticle) => Promise<void>;
  id?: string;
}

const PRESET_JOURNAL_IMAGES = [
  {
    name: 'Taif Dawn Rose Harvest',
    nameAr: 'موسم قطاف ورد الطائف',
    url: '/assets/images/journal_taif_harvest_1788119728547.jpg',
  },
  {
    name: 'Cambodian Oud Wood Aging',
    nameAr: 'تعتيق أخشاب العود الكمبودي',
    url: '/assets/images/journal_oud_aging_1788119740344.jpg',
  },
  {
    name: 'Royal Green Hojari Frankincense',
    nameAr: 'اللبان الحوجري الملكي الأخضر',
    url: '/assets/images/journal_amber_frankincense_1788119758960.jpg',
  },
  {
    name: 'Atelier Botanical Laboratory',
    nameAr: 'مختبر الصياغة والتعتيق',
    url: '/assets/images/brand_story_editorial_1788042561323.jpg',
  },
  {
    name: 'Architecture of Sillage Flacon',
    nameAr: 'معمارية الفوحان والعبوة الفاخرة',
    url: '/assets/images/hero_editorial_visual_1788041813228.jpg',
  },
];

export const JournalEditor: React.FC<JournalEditorProps> = ({
  isOpen,
  article,
  onClose,
  onSave,
  id = 'journal-editor-modal',
}) => {
  const { locale, direction } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enBodyRef = useRef<HTMLTextAreaElement>(null);
  const arBodyRef = useRef<HTMLTextAreaElement>(null);

  // Form State
  const [formData, setFormData] = useState<JournalArticle>({
    id: '',
    title: { en: '', ar: '' },
    excerpt: { en: '', ar: '' },
    body: { en: '', ar: '' },
    heroImage: '',
    status: 'draft',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'preview'>('content');
  const [languageLayout, setLanguageLayout] = useState<'split' | 'en' | 'ar'>('split');
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [activeMissingFields, setActiveMissingFields] = useState<MissingFieldItem[]>([]);

  // Populate or reset form when article changes
  useEffect(() => {
    if (article) {
      setFormData({
        ...article,
        title: { en: article.title?.en || '', ar: article.title?.ar || '' },
        excerpt: { en: article.excerpt?.en || '', ar: article.excerpt?.ar || '' },
        body: { en: article.body?.en || '', ar: article.body?.ar || '' },
        heroImage: article.heroImage || '',
        status: article.status || 'draft',
        publishedAt: article.publishedAt || new Date().toISOString(),
      });
    } else {
      // Create new blank article
      const initialId = `article-${Date.now().toString(36)}`;
      setFormData({
        id: initialId,
        title: { en: '', ar: '' },
        excerpt: { en: '', ar: '' },
        body: { en: '', ar: '' },
        heroImage: PRESET_JOURNAL_IMAGES[0].url,
        status: 'draft',
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setErrors({});
    setCustomImageUrl('');
    setShowCustomUrlInput(false);
    setActiveTab('content');
  }, [article, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-generate ID slug from English title if new
  const handleTitleEnChange = (enTitle: string) => {
    setFormData((prev) => {
      const isNew = !article;
      let newId = prev.id;
      if (isNew && enTitle.trim()) {
        const slug = enTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 48);
        if (slug) {
          newId = `article-${slug}`;
        }
      }
      return {
        ...prev,
        id: newId,
        title: { ...prev.title, en: enTitle },
      };
    });
    if (errors['title.en']) {
      setErrors((prev) => ({ ...prev, 'title.en': '' }));
    }
  };

  // Field change helper
  const handleBilingualChange = (
    field: 'title' | 'excerpt' | 'body',
    lang: 'en' | 'ar',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));

    const errorKey = `${field}.${lang}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Text formatting toolbars for simple rich-text editing
  const insertFormatting = (
    lang: 'en' | 'ar',
    type: 'bold' | 'italic' | 'h2' | 'h3' | 'quote' | 'list' | 'divider'
  ) => {
    const textarea = lang === 'en' ? enBodyRef.current : arBodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.body[lang] || '';
    const selectedText = currentVal.substring(start, end);

    let insertion = '';
    switch (type) {
      case 'bold':
        insertion = `**${selectedText || (lang === 'ar' ? 'نص عريض' : 'bold text')}**`;
        break;
      case 'italic':
        insertion = `*${selectedText || (lang === 'ar' ? 'نص مائل' : 'italic text')}*`;
        break;
      case 'h2':
        insertion = `\n\n## ${selectedText || (lang === 'ar' ? 'عنوان رئيسي جديد' : 'Main Section Heading')}\n\n`;
        break;
      case 'h3':
        insertion = `\n\n### ${selectedText || (lang === 'ar' ? 'عنوان فرعي' : 'Sub-heading')}\n\n`;
        break;
      case 'quote':
        insertion = `\n\n> "${selectedText || (lang === 'ar' ? 'اقتباس فلسفي أو شهادة حصرية من صانع العطر...' : 'A core olfactive principle or perfumer quote...')}"\n\n`;
        break;
      case 'list':
        insertion = `\n- ${selectedText || (lang === 'ar' ? 'نقطة رئيسية' : 'Key botanical note')}\n- ${lang === 'ar' ? 'نقطة ثانية' : 'Second feature'}\n`;
        break;
      case 'divider':
        insertion = `\n\n---\n\n`;
        break;
    }

    const updatedText = currentVal.substring(0, start) + insertion + currentVal.substring(end);
    handleBilingualChange('body', lang, updatedText);

    // Restore focus
    setTimeout(() => {
      textarea.focus();
    }, 50);
  };

  // Hero image upload handler
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const articleId = formData.id.trim() || `article-${Date.now()}`;
      const downloadUrl = await uploadJournalHeroImage(articleId, file);
      setFormData((prev) => ({ ...prev, heroImage: downloadUrl }));
      if (errors.heroImage) {
        setErrors((prev) => ({ ...prev, heroImage: '' }));
      }
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        heroImage: err.message || (locale === 'ar' ? 'فشل رفع الصورة' : 'Image upload failed'),
      }));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Validate form
  const validateForm = (isPublishing: boolean): { isValid: boolean; newErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    // ID validation
    if (!formData.id.trim()) {
      newErrors.id = locale === 'ar' ? 'معرّف المقال مطلوب' : 'Article ID is required';
    } else if (!/^[a-z0-9-_]+$/i.test(formData.id.trim())) {
      newErrors.id =
        locale === 'ar'
          ? 'يجب أن يحتوي المعرّف على أحرف وأرقام وشرطات فقط'
          : 'ID must contain only alphanumeric characters, dashes, and underscores';
    }

    // Title validation
    if (!formData.title.en.trim()) {
      newErrors['title.en'] =
        locale === 'ar' ? 'العنوان بالإنجليزية مطلوب' : 'English Title is required';
    }
    if (!formData.title.ar.trim()) {
      newErrors['title.ar'] =
        locale === 'ar' ? 'العنوان بالعربية مطلوب' : 'Arabic Title is required';
    }

    // STRICT CONSTRAINT: "Do not publish an article missing either language's required fields."
    if (isPublishing) {
      if (!formData.excerpt.en.trim()) {
        newErrors['excerpt.en'] =
          locale === 'ar' ? 'المقدمة بالإنجليزية مطلوبة للنشر' : 'English Excerpt is required to publish';
      }
      if (!formData.excerpt.ar.trim()) {
        newErrors['excerpt.ar'] =
          locale === 'ar' ? 'المقدمة بالعربية مطلوبة للنشر' : 'Arabic Excerpt is required to publish';
      }
      if (!formData.body.en.trim()) {
        newErrors['body.en'] =
          locale === 'ar' ? 'محتوى المقال بالإنجليزية مطلوب للنشر' : 'English Article Body is required to publish';
      }
      if (!formData.body.ar.trim()) {
        newErrors['body.ar'] =
          locale === 'ar' ? 'محتوى المقال بالعربية مطلوب للنشر' : 'Arabic Article Body is required to publish';
      }
      if (!formData.heroImage.trim()) {
        newErrors.heroImage =
          locale === 'ar' ? 'صورة الغلاف مطلوبة لنشر المقال' : 'Hero Image is required to publish';
      }
      if (!formData.publishedAt) {
        newErrors.publishedAt =
          locale === 'ar' ? 'تاريخ النشر مطلوب' : 'Publication date is required';
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, newErrors };
  };

  // Identifies missing bilingual language fields and assesses their pending/required status
  const getMissingLanguageFields = (isPublishing: boolean): MissingFieldItem[] => {
    const missing: MissingFieldItem[] = [];

    // Title
    if (!formData.title.en.trim()) {
      missing.push({
        id: 'title-en',
        fieldLabel: locale === 'ar' ? 'عنوان المقال (الإنجليزية)' : 'Article Title (English)',
        language: 'en',
        tabId: 'content',
        tabLabel: locale === 'ar' ? '١. عنوان المقال' : '1. Article Title',
        status: formData.title.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.title.ar.trim()) {
      missing.push({
        id: 'title-ar',
        fieldLabel: locale === 'ar' ? 'عنوان المقال (العربية)' : 'Article Title (Arabic)',
        language: 'ar',
        tabId: 'content',
        tabLabel: locale === 'ar' ? '١. عنوان المقال' : '1. Article Title',
        status: formData.title.en.trim() ? 'pending' : 'required',
      });
    }

    // Excerpt: Required for publishing, or if one language is filled while the partner is empty
    const hasExcerptContent = !!(formData.excerpt.en.trim() || formData.excerpt.ar.trim());
    if (isPublishing || hasExcerptContent) {
      if (!formData.excerpt.en.trim()) {
        missing.push({
          id: 'excerpt-en',
          fieldLabel: locale === 'ar' ? 'مقدمة المقال (الإنجليزية)' : 'Article Excerpt (English)',
          language: 'en',
          tabId: 'content',
          tabLabel: locale === 'ar' ? '٢. المقدمة والملخص' : '2. Editorial Excerpt',
          status: formData.excerpt.ar.trim() ? 'pending' : 'required',
        });
      }
      if (!formData.excerpt.ar.trim()) {
        missing.push({
          id: 'excerpt-ar',
          fieldLabel: locale === 'ar' ? 'مقدمة المقال (العربية)' : 'Article Excerpt (Arabic)',
          language: 'ar',
          tabId: 'content',
          tabLabel: locale === 'ar' ? '٢. المقدمة والملخص' : '2. Editorial Excerpt',
          status: formData.excerpt.en.trim() ? 'pending' : 'required',
        });
      }
    }

    // Body: Required for publishing, or if one language is filled while the partner is empty
    const hasBodyContent = !!(formData.body.en.trim() || formData.body.ar.trim());
    if (isPublishing || hasBodyContent) {
      if (!formData.body.en.trim()) {
        missing.push({
          id: 'body-en',
          fieldLabel: locale === 'ar' ? 'متن المقال (الإنجليزية)' : 'Article Body (English)',
          language: 'en',
          tabId: 'content',
          tabLabel: locale === 'ar' ? '٣. المتن الكامل' : '3. Complete Body',
          status: formData.body.ar.trim() ? 'pending' : 'required',
        });
      }
      if (!formData.body.ar.trim()) {
        missing.push({
          id: 'body-ar',
          fieldLabel: locale === 'ar' ? 'متن المقال (العربية)' : 'Article Body (Arabic)',
          language: 'ar',
          tabId: 'content',
          tabLabel: locale === 'ar' ? '٣. المتن الكامل' : '3. Complete Body',
          status: formData.body.en.trim() ? 'pending' : 'required',
        });
      }
    }

    return missing;
  };

  const handleNavigateToMissingField = (item: MissingFieldItem) => {
    setMissingModalOpen(false);
    setActiveTab('content');
    // Switch to split view so the target language field is guaranteed visible on screen
    setLanguageLayout('split');
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isPublishing = formData.status === 'published';

    // If any language field is empty, trigger the modal confirmation highlighting specific missing fields
    const missingLanguageFields = getMissingLanguageFields(isPublishing);
    if (missingLanguageFields.length > 0) {
      setActiveMissingFields(missingLanguageFields);
      setMissingModalOpen(true);
      validateForm(isPublishing); // triggers inline field error styles
      return;
    }

    const { isValid, newErrors: validationErrors } = validateForm(isPublishing);

    if (!isValid) {
      // Auto-switch to split layout if hidden language has errors so the editor sees them
      const hasArErrors = !!(validationErrors['title.ar'] || validationErrors['excerpt.ar'] || validationErrors['body.ar']);
      const hasEnErrors = !!(validationErrors['title.en'] || validationErrors['excerpt.en'] || validationErrors['body.en']);
      if ((hasArErrors && languageLayout === 'en') || (hasEnErrors && languageLayout === 'ar')) {
        setLanguageLayout('split');
      }

      // Focus on content tab if errors are there
      if (
        validationErrors['title.en'] ||
        validationErrors['title.ar'] ||
        validationErrors['excerpt.en'] ||
        validationErrors['excerpt.ar'] ||
        validationErrors['body.en'] ||
        validationErrors['body.ar'] ||
        validationErrors.id
      ) {
        setActiveTab('content');
      } else if (validationErrors.heroImage) {
        setActiveTab('media');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const payload: JournalArticle = {
        ...formData,
        id: formData.id.trim(),
        title: {
          en: formData.title.en.trim(),
          ar: formData.title.ar.trim(),
        },
        excerpt: {
          en: formData.excerpt.en.trim(),
          ar: formData.excerpt.ar.trim(),
        },
        body: {
          en: formData.body.en.trim(),
          ar: formData.body.ar.trim(),
        },
        heroImage: formData.heroImage.trim() || PRESET_JOURNAL_IMAGES[0].url,
        status: formData.status,
        publishedAt: formData.publishedAt || now,
        updatedAt: now,
        createdAt: formData.createdAt || now,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || (locale === 'ar' ? 'فشل حفظ المقال' : 'Failed to save article'),
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeLocaleReadingTime = calculateReadingTime(
    locale === 'ar' ? formData.body.ar : formData.body.en,
    locale
  );

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-y-auto bg-[#1C1A17]/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl h-full sm:h-auto sm:max-h-[92vh] bg-[#FAF7F2] border border-[#E4DED3] sm:rounded-[2px] shadow-2xl flex flex-col overflow-hidden text-[#1C1A17]">
        {/* ========================================================================= */}
        {/* MODAL HEADER                                                              */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#E4DED3] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#F5F1EA] border border-[#E4DED3] flex items-center justify-center text-[#A98860]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
                  {locale === 'ar' ? 'محرر مقالات المجلة' : 'Journal Editorial Suite'}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] border ${
                    formData.status === 'published'
                      ? 'bg-[#4A6B53]/10 text-[#4A6B53] border-[#4A6B53]/30'
                      : 'bg-[#7A736A]/10 text-[#7A736A] border-[#7A736A]/30'
                  }`}
                >
                  {formData.status === 'published'
                    ? locale === 'ar'
                      ? 'منشور'
                      : 'PUBLISHED'
                    : locale === 'ar'
                    ? 'مسودة'
                    : 'DRAFT'}
                </span>

                {/* Bilingual Completeness Pill */}
                {(() => {
                  const enFilled = [formData.title.en, formData.excerpt.en, formData.body.en].filter((s) => s.trim().length > 0).length;
                  const arFilled = [formData.title.ar, formData.excerpt.ar, formData.body.ar].filter((s) => s.trim().length > 0).length;
                  const isFullyBilingual = enFilled === 3 && arFilled === 3;
                  return (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] border ${
                        isFullyBilingual
                          ? 'bg-[#4A6B53]/10 text-[#4A6B53] border-[#4A6B53]/30 font-medium'
                          : 'bg-[#A98860]/10 text-[#A98860] border-[#A98860]/30'
                      }`}
                      title={
                        locale === 'ar'
                          ? `حالة اللغتين: الإنجليزية (${enFilled}/3) | العربية (${arFilled}/3)`
                          : `Bilingual Completeness: EN (${enFilled}/3) | AR (${arFilled}/3)`
                      }
                    >
                      EN {enFilled}/3 • AR {arFilled}/3
                    </span>
                  );
                })()}
              </div>
              <h2 id={`${id}-title`} className="text-base sm:text-lg font-serif font-normal text-[#1C1A17] truncate max-w-md">
                {article
                  ? formData.title[locale] || formData.title.en || (locale === 'ar' ? 'تعديل المقال' : 'Edit Essay')
                  : locale === 'ar'
                  ? 'إنشاء دراسة أو مقال تحريري جديد'
                  : 'Compose New Olfactive Essay'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3]/40 rounded-[2px] transition-colors cursor-pointer"
              aria-label={locale === 'ar' ? 'إغلاق المحرر' : 'Close Editor'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-NAV TABS & BILINGUAL TOGGLES                                          */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#F5F1EA] border-b border-[#E4DED3] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
          {/* Main Stage Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-[#FAF7F2] text-[#1C1A17] shadow-xs border border-[#E4DED3] font-medium'
                  : 'text-[#7A736A] hover:text-[#1C1A17]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'المحتوى والنص' : 'Editorial Content'}</span>
              {(errors['title.en'] ||
                errors['title.ar'] ||
                errors['excerpt.en'] ||
                errors['excerpt.ar'] ||
                errors['body.en'] ||
                errors['body.ar'] ||
                errors.id) && <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-[#FAF7F2] text-[#1C1A17] shadow-xs border border-[#E4DED3] font-medium'
                  : 'text-[#7A736A] hover:text-[#1C1A17]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'صورة الغلاف' : 'Hero Visual'}</span>
              {formData.heroImage && <Check className="w-3 h-3 text-[#4A6B53]" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#FAF7F2] text-[#1C1A17] shadow-xs border border-[#E4DED3] font-medium'
                  : 'text-[#7A736A] hover:text-[#1C1A17]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'معاينة الواجهة' : 'Live Preview'}</span>
            </button>
          </div>

          {/* Bilingual View Selector (Only relevant in Content tab) */}
          {activeTab === 'content' && (
            <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E4DED3] p-0.5 rounded-[2px]">
              <button
                type="button"
                onClick={() => setLanguageLayout('split')}
                className={`px-2.5 py-1 text-[11px] rounded-[1px] transition-colors cursor-pointer ${
                  languageLayout === 'split'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
                title="View English & Arabic side by side"
              >
                {locale === 'ar' ? 'عرض مزدوج (EN + AR)' : 'Side-by-Side (Split)'}
              </button>
              <button
                type="button"
                onClick={() => setLanguageLayout('en')}
                className={`px-2 py-1 text-[11px] rounded-[1px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  languageLayout === 'en'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                <span>EN Only</span>
                {errors['title.en'] || errors['excerpt.en'] || errors['body.en'] ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />
                ) : formData.title.en && formData.excerpt.en && formData.body.en ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53]" />
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => setLanguageLayout('ar')}
                className={`px-2 py-1 text-[11px] rounded-[1px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  languageLayout === 'ar'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                <span>العربية فقط</span>
                {errors['title.ar'] || errors['excerpt.ar'] || errors['body.ar'] ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />
                ) : formData.title.ar && formData.excerpt.ar && formData.body.ar ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B53]" />
                ) : null}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MAIN FORM CONTAINER                                                       */}
        {/* ========================================================================= */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Notice if current layout hides errors in the other language */}
            {activeTab === 'content' && languageLayout === 'en' && (errors['title.ar'] || errors['excerpt.ar'] || errors['body.ar']) && (
              <div className="p-3 bg-[#A98860]/10 border border-[#A98860]/40 rounded-[2px] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#554F47]">
                  <AlertCircle className="w-4 h-4 text-[#A98860] shrink-0" />
                  <span>
                    {locale === 'ar'
                      ? 'تنبيه: توجد حقول عربية مطلوبة لم يتم ملؤها وهي مخفية حالياً في هذا العرض.'
                      : 'Notice: Arabic required fields are missing data and hidden in EN Only view.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLanguageLayout('split')}
                  className="px-2.5 py-1 bg-[#1C1A17] text-[#FAF7F2] text-[11px] font-mono rounded-[2px] shrink-0 hover:bg-[#2A2723] transition-colors cursor-pointer"
                >
                  {locale === 'ar' ? 'عرض الحقول العربية' : 'View Arabic Fields'}
                </button>
              </div>
            )}

            {activeTab === 'content' && languageLayout === 'ar' && (errors['title.en'] || errors['excerpt.en'] || errors['body.en']) && (
              <div className="p-3 bg-[#A98860]/10 border border-[#A98860]/40 rounded-[2px] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#554F47]">
                  <AlertCircle className="w-4 h-4 text-[#A98860] shrink-0" />
                  <span>
                    {locale === 'ar'
                      ? 'تنبيه: توجد حقول إنجليزية مطلوبة لم يتم ملؤها وهي مخفية حالياً في هذا العرض.'
                      : 'Notice: English required fields are missing data and hidden in Arabic Only view.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLanguageLayout('split')}
                  className="px-2.5 py-1 bg-[#1C1A17] text-[#FAF7F2] text-[11px] font-mono rounded-[2px] shrink-0 hover:bg-[#2A2723] transition-colors cursor-pointer"
                >
                  {locale === 'ar' ? 'عرض الحقول الإنجليزية' : 'View English Fields'}
                </button>
              </div>
            )}
            {/* Global Errors Banner */}
            {errors.submit && (
              <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#8C3B2E]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Publication Warning Banner if Missing Fields */}
            {formData.status === 'published' && Object.keys(errors).length > 0 && (
              <div className="p-3 bg-[#A98860]/10 border border-[#A98860]/40 rounded-[2px] flex items-start gap-2.5 text-xs text-[#554F47]">
                <AlertCircle className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
                <div className="space-y-1 font-body">
                  <p className="font-medium text-[#1C1A17]">
                    {locale === 'ar'
                      ? 'تنبيه النشر: يجب ملء جميع الحقول لكلا اللغتين (الإنجليزية والعربية) وصورة الغلاف قبل النشر.'
                      : 'Publishing Requirement: Full bilingual content (English & Arabic) and hero image must be provided before an article can be published.'}
                  </p>
                  <ul className="list-disc list-inside text-[11px] font-mono text-[#8C3B2E] space-y-0.5">
                    {Object.entries(errors)
                      .filter(([key]) => key !== 'submit')
                      .map(([key, msg]) => (
                        <li key={key}>{msg}</li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 1: EDITORIAL CONTENT                                             */}
            {/* ===================================================================== */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Meta Control Bar: ID, Status, Publish Date */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
                  {/* Article Slug / ID */}
                  <FormFieldGroup
                    label={locale === 'ar' ? 'معرّف المقال (ID Slug)' : 'Article ID Slug'}
                    htmlFor="article-id"
                    required
                    errorText={errors.id}
                    helperText={locale === 'ar' ? 'معرف فريد للرابط الدائم' : 'Unique URL slug identifier'}
                  >
                    <input
                      id="article-id"
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, id: e.target.value }))}
                      disabled={!!article}
                      placeholder="article-taif-dawn-harvest"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>

                  {/* Status Toggle */}
                  <FormFieldGroup
                    label={locale === 'ar' ? 'حالة النشر' : 'Publication Status'}
                    htmlFor="article-status"
                    required
                    helperText={
                      formData.status === 'published'
                        ? locale === 'ar'
                          ? 'يظهر المقال مباشرة في صفحة المجلة'
                          : 'Visible immediately on live storefront'
                        : locale === 'ar'
                        ? 'محفوظ كمسودة غير مرئية للزوار'
                        : 'Stored as internal editorial draft'
                    }
                  >
                    <div className="flex items-center gap-2 h-9">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: 'draft' }))}
                        className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-mono rounded-[2px] border transition-colors cursor-pointer ${
                          formData.status === 'draft'
                            ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17] font-medium'
                            : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17]'
                        }`}
                      >
                        <span>{locale === 'ar' ? 'مسودة' : 'Draft'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, status: 'published' }))}
                        className={`flex-1 h-full flex items-center justify-center gap-1.5 text-xs font-mono rounded-[2px] border transition-colors cursor-pointer ${
                          formData.status === 'published'
                            ? 'bg-[#4A6B53] text-[#FAF7F2] border-[#4A6B53] font-medium'
                            : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{locale === 'ar' ? 'منشور' : 'Published'}</span>
                      </button>
                    </div>
                  </FormFieldGroup>

                  {/* Publish Date */}
                  <FormFieldGroup
                    label={locale === 'ar' ? 'تاريخ النشر' : 'Publish Date'}
                    htmlFor="article-publish-date"
                    required
                    errorText={errors.publishedAt}
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        id="article-publish-date"
                        type="datetime-local"
                        value={
                          formData.publishedAt
                            ? new Date(formData.publishedAt).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) => {
                          const dateVal = e.target.value ? new Date(e.target.value).toISOString() : '';
                          setFormData((prev) => ({ ...prev, publishedAt: dateVal }));
                        }}
                        className="flex-1 h-9 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            publishedAt: new Date().toISOString(),
                          }))
                        }
                        className="h-9 px-2 bg-[#FAF7F2] border border-[#E4DED3] hover:bg-[#E4DED3] text-[10px] font-mono text-[#7A736A] hover:text-[#1C1A17] rounded-[2px] transition-colors cursor-pointer"
                        title={locale === 'ar' ? 'تعيين إلى الوقت الحالي' : 'Set to current time'}
                      >
                        {locale === 'ar' ? 'الآن' : 'Now'}
                      </button>
                    </div>
                  </FormFieldGroup>
                </div>

                {/* ================================================================= */}
                {/* 1. ARTICLE TITLE (BILINGUAL)                                      */}
                {/* ================================================================= */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A98860] font-medium">
                      {locale === 'ar' ? '١. عنوان المقال' : '1. Article Title'}
                    </span>
                    <span className="text-[11px] font-mono text-[#7A736A]">
                      {locale === 'ar' ? 'مطلوب بكلا اللغتين' : 'Required in EN & AR'}
                    </span>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      languageLayout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {(languageLayout === 'split' || languageLayout === 'en') && (
                      <FormFieldGroup
                        label="Title (English)"
                        htmlFor="title-en"
                        required
                        statusBadge={getLanguageFieldStatus(formData.title.en, formData.title.ar)}
                        errorText={errors['title.en']}
                      >
                        <div className="relative">
                          <input
                            id="title-en"
                            type="text"
                            dir="ltr"
                            value={formData.title.en}
                            onChange={(e) => handleTitleEnChange(e.target.value)}
                            placeholder="e.g. The Dawn Harvest of Taif: 30-Petal Roses in the Mist"
                            className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-sm font-serif text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                          />
                          <span className="absolute end-2 top-2.5 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                            EN
                          </span>
                        </div>
                      </FormFieldGroup>
                    )}

                    {(languageLayout === 'split' || languageLayout === 'ar') && (
                      <FormFieldGroup
                        label="العنوان (باللغة العربية)"
                        htmlFor="title-ar"
                        required
                        statusBadge={getLanguageFieldStatus(formData.title.ar, formData.title.en)}
                        errorText={errors['title.ar']}
                      >
                        <div className="relative">
                          <input
                            id="title-ar"
                            type="text"
                            dir="rtl"
                            value={formData.title.ar}
                            onChange={(e) => handleBilingualChange('title', 'ar', e.target.value)}
                            placeholder="مثال: قطاف الفجر في الطائف: أسرار الورد الثلاثيني بين ضباب الهدا"
                            className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-sm font-serif text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                          />
                          <span className="absolute start-2 top-2.5 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                            AR
                          </span>
                        </div>
                      </FormFieldGroup>
                    )}
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 2. ARTICLE EXCERPT / LEAD SUMMARY (BILINGUAL)                    */}
                {/* ================================================================= */}
                <div className="space-y-2 pt-2 border-t border-[#E4DED3]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A98860] font-medium">
                      {locale === 'ar' ? '٢. المقدمة والملخص التحريري' : '2. Editorial Excerpt / Lead'}
                    </span>
                    <span className="text-[11px] font-mono text-[#7A736A]">
                      {locale === 'ar' ? 'يظهر في بطاقات الفهرس واقتباس رأس المقال' : 'Displayed on cards and header quote'}
                    </span>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      languageLayout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {(languageLayout === 'split' || languageLayout === 'en') && (
                      <FormFieldGroup
                        label="Excerpt / Lead (English)"
                        htmlFor="excerpt-en"
                        required={formData.status === 'published'}
                        statusBadge={getLanguageFieldStatus(formData.excerpt.en, formData.excerpt.ar)}
                        errorText={errors['excerpt.en']}
                        helperText="A compelling 1-2 sentence introduction setting the stage."
                      >
                        <div className="relative">
                          <textarea
                            id="excerpt-en"
                            dir="ltr"
                            rows={3}
                            value={formData.excerpt.en}
                            onChange={(e) => handleBilingualChange('excerpt', 'en', e.target.value)}
                            placeholder="A pilgrimage to the Al Hada escarpment at 5:00 AM, where ancestral copper stills distill fleeting aromatic volatiles before the sun rises..."
                            className="w-full p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-body leading-relaxed text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                          />
                          <span className="absolute end-2 top-2 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                            EN
                          </span>
                        </div>
                      </FormFieldGroup>
                    )}

                    {(languageLayout === 'split' || languageLayout === 'ar') && (
                      <FormFieldGroup
                        label="المقدمة والملخص (باللغة العربية)"
                        htmlFor="excerpt-ar"
                        required={formData.status === 'published'}
                        statusBadge={getLanguageFieldStatus(formData.excerpt.ar, formData.excerpt.en)}
                        errorText={errors['excerpt.ar']}
                        helperText="جملتان تمهيديتان تشوق القارئ لموضوع البحث أو الرحلة العطرية."
                      >
                        <div className="relative">
                          <textarea
                            id="excerpt-ar"
                            dir="rtl"
                            rows={3}
                            value={formData.excerpt.ar}
                            onChange={(e) => handleBilingualChange('excerpt', 'ar', e.target.value)}
                            placeholder="رحلة إلى منحدرات الهدا الجبلية عند الخامسة فجراً، حيث تُقطف البتلات الندية وتقطر في قدور النحاس العتيقة..."
                            className="w-full p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-body leading-relaxed text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                          />
                          <span className="absolute start-2 top-2 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                            AR
                          </span>
                        </div>
                      </FormFieldGroup>
                    )}
                  </div>
                </div>

                {/* ================================================================= */}
                {/* 3. ARTICLE BODY & STRUCTURED TEXT EDITOR                          */}
                {/* ================================================================= */}
                <div className="space-y-3 pt-2 border-t border-[#E4DED3]">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#A98860] font-medium">
                        {locale === 'ar' ? '٣. المتن الكامل للمقال' : '3. Complete Article Body'}
                      </span>
                      <p className="text-[11px] text-[#7A736A] font-body mt-0.5">
                        {locale === 'ar'
                          ? 'افصل بين الفقرات بسطر فارغ لتنسيق النص وتوليد الاقتباس التحريري تلقائياً.'
                          : 'Separate paragraphs with blank lines. Markdown headers, quotes, and bullets supported.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-[#7A736A]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#A98860]" />
                        <span>{activeLocaleReadingTime}</span>
                      </span>
                    </div>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      languageLayout === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    }`}
                  >
                    {/* ENGLISH BODY */}
                    {(languageLayout === 'split' || languageLayout === 'en') && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="body-en"
                              className="text-xs font-medium text-[#1C1A17] font-mono flex items-center gap-1.5"
                            >
                              <span>Article Body (English)</span>
                              {formData.status === 'published' && (
                                <span className="text-[#8C3B2E] font-bold">*</span>
                              )}
                            </label>
                            {(() => {
                              const status = getLanguageFieldStatus(formData.body.en, formData.body.ar);
                              if (status === 'complete') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#4A6B53]/10 text-[#4A6B53] border border-[#4A6B53]/20 rounded-[2px]">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Complete</span>
                                  </span>
                                );
                              }
                              if (status === 'pending') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#D99B26]/10 text-[#A06C00] border border-[#D99B26]/30 rounded-[2px]">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>Pending Translation</span>
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#8C3B2E]/10 text-[#8C3B2E] border border-[#8C3B2E]/20 rounded-[2px]">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>Required</span>
                                </span>
                              );
                            })()}
                          </div>
                          <span className="text-[10px] font-mono text-[#7A736A]">
                            {formData.body.en.trim() ? formData.body.en.trim().split(/\s+/).length : 0}{' '}
                            words
                          </span>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex items-center flex-wrap gap-1 p-1 bg-[#F5F1EA] border border-[#E4DED3] rounded-t-[2px] text-xs">
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'bold')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Bold text"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'italic')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Italic text"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] h-4 bg-[#E4DED3] mx-1" />
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'h2')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Section Header (H2)"
                          >
                            <Heading2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'h3')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Sub Header (H3)"
                          >
                            <Heading3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'quote')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Editorial Quote"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('en', 'list')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="Bullet List"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          id="body-en"
                          ref={enBodyRef}
                          dir="ltr"
                          rows={12}
                          value={formData.body.en}
                          onChange={(e) => handleBilingualChange('body', 'en', e.target.value)}
                          placeholder="Write long-form editorial dispatch in English... Separate paragraphs with empty lines for optimal layout rhythm."
                          className={`w-full p-3.5 bg-[#FAF7F2] border border-t-0 border-[#E4DED3] rounded-b-[2px] text-xs font-body leading-[1.8] text-[#1C1A17] focus:outline-none focus:border-[#A98860] ${
                            errors['body.en'] ? 'border-[#8C3B2E]' : ''
                          }`}
                        />
                        {errors['body.en'] && (
                          <p className="text-[11px] font-mono text-[#8C3B2E]">{errors['body.en']}</p>
                        )}
                      </div>
                    )}

                    {/* ARABIC BODY */}
                    {(languageLayout === 'split' || languageLayout === 'ar') && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="body-ar"
                              className="text-xs font-medium text-[#1C1A17] font-mono flex items-center gap-1.5"
                            >
                              <span>متن المقال (باللغة العربية)</span>
                              {formData.status === 'published' && (
                                <span className="text-[#8C3B2E] font-bold">*</span>
                              )}
                            </label>
                            {(() => {
                              const status = getLanguageFieldStatus(formData.body.ar, formData.body.en);
                              if (status === 'complete') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#4A6B53]/10 text-[#4A6B53] border border-[#4A6B53]/20 rounded-[2px]">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>مكتمل</span>
                                  </span>
                                );
                              }
                              if (status === 'pending') {
                                return (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#D99B26]/10 text-[#A06C00] border border-[#D99B26]/30 rounded-[2px]">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>بانتظار الترجمة</span>
                                  </span>
                                );
                              }
                              return (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono bg-[#8C3B2E]/10 text-[#8C3B2E] border border-[#8C3B2E]/20 rounded-[2px]">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>مطلوب</span>
                                </span>
                              );
                            })()}
                          </div>
                          <span className="text-[10px] font-mono text-[#7A736A]">
                            {formData.body.ar.trim() ? formData.body.ar.trim().split(/\s+/).length : 0}{' '}
                            كلمة
                          </span>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="flex items-center flex-wrap gap-1 p-1 bg-[#F5F1EA] border border-[#E4DED3] rounded-t-[2px] text-xs">
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'bold')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="نص عريض"
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'italic')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="نص مائل"
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-[1px] h-4 bg-[#E4DED3] mx-1" />
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'h2')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="عنوان رئيسي (H2)"
                          >
                            <Heading2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'h3')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="عنوان فرعي (H3)"
                          >
                            <Heading3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'quote')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="اقتباس تحريري"
                          >
                            <Quote className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => insertFormatting('ar', 'list')}
                            className="p-1.5 hover:bg-[#FAF7F2] text-[#1C1A17] rounded-[2px] transition-colors"
                            title="قائمة نقطية"
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <textarea
                          id="body-ar"
                          ref={arBodyRef}
                          dir="rtl"
                          rows={12}
                          value={formData.body.ar}
                          onChange={(e) => handleBilingualChange('body', 'ar', e.target.value)}
                          placeholder="اكتب المقال والدراسة الشمية باللغة العربية... اترك سطراً فارغاً بين الفقرات للحفاظ على التنسيق التحريري الأنيق."
                          className={`w-full p-3.5 bg-[#FAF7F2] border border-t-0 border-[#E4DED3] rounded-b-[2px] text-xs font-body leading-[1.8] text-[#1C1A17] focus:outline-none focus:border-[#A98860] ${
                            errors['body.ar'] ? 'border-[#8C3B2E]' : ''
                          }`}
                        />
                        {errors['body.ar'] && (
                          <p className="text-[11px] font-mono text-[#8C3B2E]">{errors['body.ar']}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 2: HERO VISUAL MEDIA                                             */}
            {/* ===================================================================== */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-serif font-normal text-[#1C1A17]">
                    {locale === 'ar' ? 'صورة الغلاف التحريرية (Hero Visual)' : 'Article Hero Visual'}
                  </h3>
                  <p className="text-xs font-body text-[#7A736A] mt-1">
                    {locale === 'ar'
                      ? 'يتم حفظ ورفع الصور إلى مسار Firebase Storage الخاص بالمقالات: /journal/{id}/'
                      : 'Uploads are securely stored in Firebase Storage path: /journal/{id}/'}
                  </p>
                </div>

                {errors.heroImage && (
                  <p className="p-2.5 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] text-xs font-mono text-[#8C3B2E]">
                    {errors.heroImage}
                  </p>
                )}

                {/* Upload & Current Visual Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Upload Box */}
                  <div className="flex flex-col gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E4DED3] hover:border-[#A98860] bg-[#FAF7F2] p-8 rounded-[2px] flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelected}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-full bg-[#F5F1EA] group-hover:bg-[#A98860]/10 flex items-center justify-center text-[#A98860] transition-colors">
                        {isUploadingImage ? (
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#1C1A17]">
                          {isUploadingImage
                            ? locale === 'ar'
                              ? 'جاري الرفع إلى Storage...'
                              : 'Uploading to Storage...'
                            : locale === 'ar'
                            ? 'انقر لرفع صورة عالية الدقة أو اسحبها هنا'
                            : 'Click to upload hero image or drag & drop'}
                        </p>
                        <p className="text-[11px] font-mono text-[#7A736A] mt-1">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </div>
                    </div>

                    {/* Custom URL Option */}
                    <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
                      {!showCustomUrlInput ? (
                        <button
                          type="button"
                          onClick={() => setShowCustomUrlInput(true)}
                          className="text-xs font-mono text-[#A98860] hover:underline flex items-center gap-1.5"
                        >
                          <Link className="w-3.5 h-3.5" />
                          <span>{locale === 'ar' ? 'أو استخدم رابط صورة خارجي' : 'Or paste a direct image URL'}</span>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-[#7A736A] block">
                            {locale === 'ar' ? 'رابط الصورة المباشر' : 'Direct Image URL'}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={customImageUrl}
                              onChange={(e) => setCustomImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 h-8 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customImageUrl.trim()) {
                                  setFormData((prev) => ({ ...prev, heroImage: customImageUrl.trim() }));
                                  setCustomImageUrl('');
                                  setShowCustomUrlInput(false);
                                }
                              }}
                              className="h-8 px-3 bg-[#1C1A17] text-[#FAF7F2] text-xs font-mono rounded-[2px] hover:bg-[#A98860] transition-colors"
                            >
                              {locale === 'ar' ? 'تطبيق' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Active Image Preview */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono text-[#7A736A] uppercase tracking-wider">
                      {locale === 'ar' ? 'المعاينة الحالية للغلاف' : 'Active Visual Preview'}
                    </span>
                    <div className="aspect-[16/9] w-full bg-[#1C1A17] rounded-[2px] border border-[#E4DED3] overflow-hidden relative group flex items-center justify-center">
                      {formData.heroImage ? (
                        <>
                          <img
                            src={formData.heroImage}
                            alt={formData.title.en || 'Article hero visual'}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, heroImage: '' }))}
                              className="p-2 bg-[#8C3B2E] text-white rounded-[2px] text-xs font-mono flex items-center gap-1 hover:bg-[#8C3B2E]/90 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{locale === 'ar' ? 'إزالة الصورة' : 'Remove Visual'}</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-[#7A736A]">
                          <ImageIcon className="w-8 h-8 stroke-1" />
                          <span className="text-xs font-mono">
                            {locale === 'ar' ? 'لا توجد صورة غلاف بعد' : 'No hero visual assigned'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Imagery Gallery */}
                <div className="space-y-3 pt-4 border-t border-[#E4DED3]">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A98860] font-medium">
                    {locale === 'ar' ? 'مجموعة صور أرشيف DAHR الجاهزة' : 'Curated Atelier Presets'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {PRESET_JOURNAL_IMAGES.map((preset, idx) => {
                      const isSelected = formData.heroImage === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, heroImage: preset.url }))}
                          className={`flex flex-col text-start rounded-[2px] border overflow-hidden p-1 bg-[#FAF7F2] transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#A98860] ring-1 ring-[#A98860]'
                              : 'border-[#E4DED3] hover:border-[#7A736A]'
                          }`}
                        >
                          <div className="aspect-[4/3] w-full bg-[#1C1A17] rounded-[1px] overflow-hidden relative">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            {isSelected && (
                              <div className="absolute top-1 end-1 w-4 h-4 bg-[#A98860] text-white rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-[#1C1A17] truncate mt-1.5 px-0.5">
                            {locale === 'ar' ? preset.nameAr : preset.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* TAB 3: LIVE PREVIEW ACCORDING TO STOREFRONT ARCHETYPE                 */}
            {/* ===================================================================== */}
            {activeTab === 'preview' && (
              <div className="space-y-6 max-w-3xl mx-auto p-4 sm:p-6 bg-white border border-[#E4DED3] rounded-[2px]">
                <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#A98860]" />
                    <span className="text-xs font-mono uppercase tracking-wider text-[#7A736A]">
                      {locale === 'ar' ? 'معاينة المقال كما يظهر للزائر' : 'Storefront Reader Preview'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#A98860]">
                    {activeLocaleReadingTime}
                  </span>
                </div>

                {/* Article Header Preview */}
                <header className="space-y-3 text-start">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#A98860]">
                    <span className="uppercase tracking-[0.2em]">
                      {locale === 'ar' ? 'دراسة شمية متخصصة' : 'OLFACTIVE ESSAY'}
                    </span>
                    <span>•</span>
                    <span>
                      {formData.publishedAt
                        ? new Date(formData.publishedAt).toLocaleDateString(
                            locale === 'ar' ? 'ar-SA' : 'en-US',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )
                        : 'Unpublished'}
                    </span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl text-[#1C1A17] font-normal leading-snug">
                    {formData.title[locale] || formData.title.en || 'Untitled Essay'}
                  </h1>

                  {(formData.excerpt[locale] || formData.excerpt.en) && (
                    <p className="text-sm sm:text-base text-[#554F47] font-body font-light leading-relaxed border-s-2 border-[#A98860] ps-3 py-0.5">
                      {formData.excerpt[locale] || formData.excerpt.en}
                    </p>
                  )}
                </header>

                {/* Hero Image */}
                {formData.heroImage && (
                  <div className="aspect-[16/8] w-full rounded-[2px] overflow-hidden bg-[#1C1A17]">
                    <img
                      src={formData.heroImage}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Body Paragraphs */}
                <div className="space-y-4 text-start pt-2">
                  {(formData.body[locale] || formData.body.en || '')
                    .split(/\n\s*\n/)
                    .filter((p) => p.trim())
                    .map((p, idx) => (
                      <p
                        key={idx}
                        className="text-sm sm:text-base text-[#1C1A17] leading-[1.8] font-body"
                      >
                        {p}
                      </p>
                    ))}
                  {!(formData.body[locale] || formData.body.en) && (
                    <p className="text-xs font-mono text-[#7A736A] italic text-center py-6">
                      {locale === 'ar' ? 'لم تتم كتابة نص المقال بعد.' : 'No article body drafted yet.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ======================================================================= */}
          {/* MODAL FOOTER ACTIONS                                                    */}
          {/* ======================================================================= */}
          <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-mono text-[#7A736A] flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  formData.status === 'published' ? 'bg-[#4A6B53]' : 'bg-[#A98860]'
                }`}
              />
              <span>
                {formData.status === 'published'
                  ? locale === 'ar'
                    ? 'سيتم نشر المقال فوراً'
                    : 'Will publish immediately'
                  : locale === 'ar'
                  ? 'سيتم الحفظ كمسودة تحريرية'
                  : 'Will save as editorial draft'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#FAF7F2] hover:bg-[#E4DED3]/50 text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 sm:flex-initial px-6 py-2 rounded-[2px] text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  formData.status === 'published'
                    ? 'bg-[#4A6B53] text-[#FAF7F2] hover:bg-[#4A6B53]/90'
                    : 'bg-[#1C1A17] text-[#FAF7F2] hover:bg-[#A98860]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {formData.status === 'published'
                        ? locale === 'ar'
                          ? 'نشر المقال'
                          : 'Publish Essay'
                        : locale === 'ar'
                        ? 'حفظ المسودة'
                        : 'Save Draft'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Missing Bilingual Fields Alert Modal */}
      <MissingLanguageModal
        isOpen={missingModalOpen}
        onClose={() => setMissingModalOpen(false)}
        missingFields={activeMissingFields}
        onNavigateToField={handleNavigateToMissingField}
        secondaryAction={
          formData.status === 'published'
            ? {
                label: locale === 'ar' ? 'حفظ كمسودة بدلاً من ذلك' : 'Save as Draft instead',
                onClick: () => {
                  setFormData((prev) => ({ ...prev, status: 'draft' }));
                  setMissingModalOpen(false);
                },
              }
            : undefined
        }
      />
    </div>
  );
};
