import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Sparkles,
  FileText,
  X,
} from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { journalApi } from '../../../api/journalApi';
import { JournalArticle, ArticleStatus } from '../../../types/backend';
import { RouteId } from '../../../types';
import { JournalEditor } from './JournalEditor';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { StatusPill } from '../StatusPill';
import { calculateReadingTime, resolveArticleImage } from '../../journal/journalUtils';
import { seedInitialFirestoreData } from '../../../utils/seeder';

export interface AdminJournalViewProps {
  onRouteChange: (route: RouteId) => void;
}

export const AdminJournalView: React.FC<AdminJournalViewProps> = ({ onRouteChange }) => {
  const { locale } = useI18n();

  // Articles state
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<'title' | 'status' | 'publishedAt' | 'id'>('publishedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<JournalArticle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch articles from Firestore
  const fetchArticles = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const data = await journalApi.getAllArticlesAdmin(forceRefresh);
      setArticles(data || []);
    } catch (err: any) {
      console.warn('Failed to load articles in admin view:', err);
      showNotification('error', err.message || 'Failed to fetch journal records from Firestore.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Quick Status Toggle (Draft <-> Published)
  const handleToggleStatus = async (article: JournalArticle, e: React.MouseEvent) => {
    e.stopPropagation();

    // If publishing, ensure required bilingual fields are present
    if (article.status === 'draft') {
      const missingEn = !article.title?.en || !article.excerpt?.en || !article.body?.en;
      const missingAr = !article.title?.ar || !article.excerpt?.ar || !article.body?.ar;
      if (missingEn || missingAr) {
        showNotification(
          'error',
          locale === 'ar'
            ? 'لا يمكن نشر المقال قبل استكمال كافة الحقول باللغتين العربية والإنجليزية.'
            : 'Cannot publish essay with incomplete bilingual fields. Please edit to complete all fields first.'
        );
        return;
      }
    }

    const newStatus: ArticleStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      await journalApi.updateArticle(article.id, { status: newStatus });
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a))
      );
      showNotification(
        'success',
        locale === 'ar'
          ? `تم تغيير حالة "${article.title?.ar || article.title?.en}" إلى ${
              newStatus === 'published' ? 'منشور' : 'مسودة'
            }.`
          : `Changed status of "${article.title?.en}" to ${newStatus}.`
      );
    } catch (err: any) {
      showNotification('error', `Failed to update status: ${err.message}`);
    }
  };

  // Save Article from Editor (Create or Update)
  const handleSaveArticle = async (articleData: JournalArticle) => {
    const isExisting = articles.some((a) => a.id === articleData.id);
    if (isExisting) {
      await journalApi.updateArticle(articleData.id, articleData);
      setArticles((prev) =>
        prev.map((a) => (a.id === articleData.id ? articleData : a))
      );
      showNotification(
        'success',
        locale === 'ar'
          ? `تم تحديث المقال "${articleData.title.ar || articleData.title.en}" بنجاح.`
          : `Essay "${articleData.title.en}" updated successfully.`
      );
    } else {
      await journalApi.createArticle(articleData);
      setArticles((prev) => [articleData, ...prev]);
      showNotification(
        'success',
        locale === 'ar'
          ? `تم إنشاء المقال الجديد "${articleData.title.ar || articleData.title.en}" بنجاح.`
          : `New essay "${articleData.title.en}" published/saved successfully.`
      );
    }
  };

  // Delete Article Action
  const confirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await journalApi.deleteArticle(articleToDelete.id);
      setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
      showNotification(
        'success',
        locale === 'ar'
          ? `تم حذف المقال "${articleToDelete.title?.ar || articleToDelete.title?.en}" نهائياً.`
          : `Essay "${articleToDelete.title?.en}" permanently removed.`
      );
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    } catch (err: any) {
      showNotification('error', `Failed to delete article: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore Seed Articles if empty
  const handleRestoreSampleArticles = async () => {
    setIsLoading(true);
    try {
      await seedInitialFirestoreData(true);
      await fetchArticles();
      showNotification(
        'success',
        locale === 'ar'
          ? 'تمت استعادة مقالات المجلة الافتراضية بنجاح.'
          : 'Standard journal essays re-seeded successfully.'
      );
    } catch (err: any) {
      showNotification('error', `Failed to seed articles: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Filter and Search logic
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 1. Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitleEn = article.title?.en?.toLowerCase().includes(q) || false;
        const matchesTitleAr = article.title?.ar?.toLowerCase().includes(q) || false;
        const matchesExcerptEn = article.excerpt?.en?.toLowerCase().includes(q) || false;
        const matchesExcerptAr = article.excerpt?.ar?.toLowerCase().includes(q) || false;
        const matchesBodyEn = article.body?.en?.toLowerCase().includes(q) || false;
        const matchesBodyAr = article.body?.ar?.toLowerCase().includes(q) || false;
        const matchesId = article.id.toLowerCase().includes(q);

        if (
          !matchesTitleEn &&
          !matchesTitleAr &&
          !matchesExcerptEn &&
          !matchesExcerptAr &&
          !matchesBodyEn &&
          !matchesBodyAr &&
          !matchesId
        ) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'all' && article.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [articles, search, statusFilter]);

  // Sorting
  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'title':
          valA = (a.title?.[locale] || a.title?.en || '').toLowerCase();
          valB = (b.title?.[locale] || b.title?.en || '').toLowerCase();
          break;
        case 'status':
          valA = a.status;
          valB = b.status;
          break;
        case 'publishedAt':
          valA = new Date(a.publishedAt || a.createdAt || 0).getTime();
          valB = new Date(b.publishedAt || b.createdAt || 0).getTime();
          break;
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredArticles, sortField, sortDirection, locale]);

  // Pagination
  const totalPages = Math.ceil(sortedArticles.length / pageSize) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedArticles.slice(start, start + pageSize);
  }, [sortedArticles, currentPage, pageSize]);

  // Adjust page if out of range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSort = (field: 'title' | 'status' | 'publishedAt' | 'id') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Status counts
  const countAll = articles.length;
  const countPublished = articles.filter((a) => a.status === 'published').length;
  const countDrafts = articles.filter((a) => a.status === 'draft').length;

  return (
    <div id="admin-journal-view" className="flex flex-col gap-6 text-[#1C1A17] max-w-7xl mx-auto w-full">
      {/* ========================================================================= */}
      {/* NOTIFICATIONS TOAST BANNER                                                */}
      {/* ========================================================================= */}
      {notification && (
        <div
          role="alert"
          className={`p-3.5 rounded-[2px] border text-xs font-mono flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-[#4A6B53]/10 text-[#4A6B53] border-[#4A6B53]/30'
              : 'bg-[#8C3B2E]/10 text-[#8C3B2E] border-[#8C3B2E]/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODULE HEADER & PRIMARY ACTION BAR                                     */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E4DED3] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#A98860]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'إدارة المحتوى والمجلة' : 'Editorial CMS Module'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#1C1A17] mt-1 font-normal">
            {locale === 'ar' ? 'مقالات وأبحاث مجلة DAHR' : 'Journal & Olfactive Essays'}
          </h1>
          <p className="text-xs text-[#7A736A] font-body mt-0.5">
            {locale === 'ar'
              ? 'إدارة المقالات والدراسات الشمية وتعيين الصور وحالات النشر بالعربية والإنجليزية.'
              : 'Publish, draft, edit, and organize bilingual editorial essays in the journalArticles collection.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {articles.length === 0 && !isLoading && (
            <button
              type="button"
              onClick={handleRestoreSampleArticles}
              className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#A98860] border border-[#A98860]/40 rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'استعادة مقالات العينة' : 'Seed Sample Articles'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchArticles(true)}
            disabled={isLoading}
            className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title={locale === 'ar' ? 'تحديث المقالات' : 'Refresh Articles'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedArticle(null);
              setIsEditorOpen(true);
            }}
            className="h-9 px-4 bg-[#1C1A17] hover:bg-[#A98860] text-[#FAF7F2] rounded-[2px] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{locale === 'ar' ? 'إنشاء مقال جديد' : 'Compose Essay'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 relative flex items-center max-w-md">
          <Search className="w-4 h-4 absolute start-3 text-[#7A736A] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={
              locale === 'ar'
                ? 'البحث في العنوان، المحتوى أو المعرف...'
                : 'Search title, excerpt, body, or slug...'
            }
            className="w-full h-9 ps-9 pe-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute end-2.5 text-[#7A736A] hover:text-[#1C1A17]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 border border-[#E4DED3] rounded-[2px] text-xs font-mono self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-[1px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                : 'text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>{locale === 'ar' ? 'الكل' : 'All'}</span>
            <span className="text-[10px] opacity-75">({countAll})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('published');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-[1px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'published'
                ? 'bg-[#4A6B53] text-[#FAF7F2] font-medium'
                : 'text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>{locale === 'ar' ? 'المنشورة' : 'Published'}</span>
            <span className="text-[10px] opacity-75">({countPublished})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('draft');
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-[1px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'draft'
                ? 'bg-[#1C1A17] text-[#FAF7F2] font-medium'
                : 'text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>{locale === 'ar' ? 'المسودات' : 'Drafts'}</span>
            <span className="text-[10px] opacity-75">({countDrafts})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DENSE DATA TABLE (DESKTOP) & ADAPTIVE CARD VIEW (MOBILE)              */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start text-xs font-mono">
            <thead>
              <tr className="bg-[#F5F1EA] border-b border-[#E4DED3] text-[#7A736A] uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4 text-start font-medium w-14">
                  {locale === 'ar' ? 'الغلاف' : 'Hero'}
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-4 text-start font-medium cursor-pointer hover:text-[#1C1A17]"
                >
                  <div className="flex items-center gap-1">
                    <span>{locale === 'ar' ? 'عنوان المقال والدراسة' : 'Essay Title & Summary'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 text-start font-medium cursor-pointer hover:text-[#1C1A17] w-32"
                >
                  <div className="flex items-center gap-1">
                    <span>{locale === 'ar' ? 'الحالة' : 'Status'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('publishedAt')}
                  className="py-3 px-4 text-start font-medium cursor-pointer hover:text-[#1C1A17] w-40"
                >
                  <div className="flex items-center gap-1">
                    <span>{locale === 'ar' ? 'تاريخ النشر' : 'Publish Date'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-start font-medium w-28">
                  {locale === 'ar' ? 'القراءة' : 'Read Time'}
                </th>
                <th className="py-3 px-4 text-end font-medium w-36">
                  {locale === 'ar' ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DED3]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A736A]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#A98860]" />
                      <span className="text-xs">{locale === 'ar' ? 'جاري تحميل المقالات من قاعدة البيانات...' : 'Fetching articles from Firestore...'}</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#7A736A]">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <BookOpen className="w-6 h-6 stroke-1 text-[#A98860]" />
                      <p className="text-sm font-serif text-[#1C1A17]">
                        {locale === 'ar' ? 'لم يتم العثور على أي مقالات' : 'No articles found'}
                      </p>
                      <p className="text-xs text-[#7A736A] font-body">
                        {search || statusFilter !== 'all'
                          ? locale === 'ar'
                            ? 'جرّب تعديل عبارة البحث أو الفلتر للعثور على المقال.'
                            : 'Try adjusting your search query or filter to find what you are looking for.'
                          : locale === 'ar'
                          ? 'ابدأ بنشر دراستك الشمية الأولى أو استعد المقالات الافتراضية.'
                          : 'Begin by composing your first olfactive essay or re-seed sample articles.'}
                      </p>
                      {!search && statusFilter === 'all' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedArticle(null);
                            setIsEditorOpen(true);
                          }}
                          className="mt-2 px-3 py-1.5 bg-[#1C1A17] text-[#FAF7F2] text-xs font-mono rounded-[2px] hover:bg-[#A98860] transition-colors cursor-pointer"
                        >
                          {locale === 'ar' ? 'إنشاء مقال جديد' : 'Compose First Essay'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((article) => {
                  const resolvedImg = resolveArticleImage(article);
                  const readTime = calculateReadingTime(
                    locale === 'ar' ? article.body?.ar : article.body?.en,
                    locale
                  );
                  const formattedDate = article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString(
                        locale === 'ar' ? 'ar-SA' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )
                    : '—';

                  return (
                    <tr
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setIsEditorOpen(true);
                      }}
                      className="hover:bg-[#F5F1EA]/60 transition-colors cursor-pointer group"
                    >
                      {/* Hero Image Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-[2px] bg-[#1C1A17] border border-[#E4DED3] overflow-hidden relative shrink-0">
                          <img
                            src={resolvedImg}
                            alt={article.title?.en || 'Hero'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>

                      {/* Title & Excerpt */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-sm font-medium text-[#1C1A17] group-hover:text-[#A98860] transition-colors truncate">
                              {article.title?.[locale] || article.title?.en || 'Untitled Essay'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7A736A] font-body line-clamp-1">
                            {article.excerpt?.[locale] || article.excerpt?.en || 'No excerpt summary provided.'}
                          </span>
                          <span className="text-[9px] font-mono text-[#A98860]/80">
                            {article.id}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(article, e)}
                          className="text-start cursor-pointer hover:opacity-80 transition-opacity"
                          title={
                            locale === 'ar'
                              ? 'انقر لتغيير الحالة بين منشور ومسودة'
                              : 'Click to toggle status between Published and Draft'
                          }
                        >
                          <StatusPill
                            status={article.status === 'published' ? 'active' : 'draft'}
                            label={
                              article.status === 'published'
                                ? locale === 'ar'
                                  ? 'منشور'
                                  : 'Published'
                                : locale === 'ar'
                                ? 'مسودة'
                                : 'Draft'
                            }
                          />
                        </button>
                      </td>

                      {/* Publish Date */}
                      <td className="py-3 px-4 text-[#554F47]">
                        <div className="flex items-center gap-1.5 text-xs font-mono">
                          <Calendar className="w-3 h-3 text-[#7A736A]" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Read Time */}
                      <td className="py-3 px-4 text-[#7A736A]">
                        <span className="text-[11px] font-mono">{readTime}</span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-end">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Preview in Storefront */}
                          <button
                            type="button"
                            onClick={() => onRouteChange('journal')}
                            className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E4DED3] rounded-[2px] transition-colors cursor-pointer"
                            title={locale === 'ar' ? 'عرض في واجهة المجلة' : 'View in Storefront'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Essay */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#FAF7F2] border border-transparent hover:border-[#E4DED3] rounded-[2px] transition-colors cursor-pointer"
                            title={locale === 'ar' ? 'تعديل المقال' : 'Edit Article'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              setArticleToDelete(article);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-[#8C3B2E]/80 hover:text-[#8C3B2E] hover:bg-[#8C3B2E]/10 border border-transparent hover:border-[#8C3B2E]/20 rounded-[2px] transition-colors cursor-pointer"
                            title={locale === 'ar' ? 'حذف المقال' : 'Delete Article'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Adaptive Cards View (< 768px) */}
        <div className="md:hidden divide-y divide-[#E4DED3]">
          {isLoading ? (
            <div className="py-10 text-center text-[#7A736A] font-mono text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#A98860]" />
              <span>{locale === 'ar' ? 'جاري تحميل المقالات...' : 'Loading articles...'}</span>
            </div>
          ) : paginatedArticles.length === 0 ? (
            <div className="p-6 text-center text-[#7A736A]">
              <p className="font-serif text-sm text-[#1C1A17]">
                {locale === 'ar' ? 'لا توجد مقالات مطابقة' : 'No matching articles'}
              </p>
            </div>
          ) : (
            paginatedArticles.map((article) => {
              const resolvedImg = resolveArticleImage(article);
              const readTime = calculateReadingTime(
                locale === 'ar' ? article.body?.ar : article.body?.en,
                locale
              );
              const formattedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )
                : '—';

              return (
                <div
                  key={article.id}
                  onClick={() => {
                    setSelectedArticle(article);
                    setIsEditorOpen(true);
                  }}
                  className="p-4 flex flex-col gap-3 hover:bg-[#F5F1EA]/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-[2px] bg-[#1C1A17] border border-[#E4DED3] overflow-hidden shrink-0">
                      <img
                        src={resolvedImg}
                        alt="Hero"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <StatusPill
                          status={article.status === 'published' ? 'active' : 'draft'}
                          label={
                            article.status === 'published'
                              ? locale === 'ar'
                                ? 'منشور'
                                : 'Published'
                              : locale === 'ar'
                              ? 'مسودة'
                              : 'Draft'
                          }
                        />
                        <span className="text-[10px] font-mono text-[#7A736A]">{readTime}</span>
                      </div>
                      <h3 className="font-serif text-sm font-medium text-[#1C1A17] mt-1 line-clamp-2">
                        {article.title?.[locale] || article.title?.en || 'Untitled'}
                      </h3>
                      <p className="text-[11px] text-[#7A736A] font-body line-clamp-1 mt-0.5">
                        {article.excerpt?.[locale] || article.excerpt?.en}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4DED3]/60 text-xs font-mono">
                    <span className="text-[11px] text-[#7A736A] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#A98860]" />
                      {formattedDate}
                    </span>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(article, e)}
                        className="px-2 py-1 bg-[#FAF7F2] border border-[#E4DED3] text-[10px] rounded-[2px] text-[#1C1A17]"
                      >
                        {article.status === 'published'
                          ? locale === 'ar'
                            ? 'إلى مسودة'
                            : 'Unpublish'
                          : locale === 'ar'
                          ? 'نشر'
                          : 'Publish'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedArticle(article);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setArticleToDelete(article);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-[#8C3B2E] bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ======================================================================= */}
        {/* 4. PAGINATION FOOTER                                                    */}
        {/* ======================================================================= */}
        <div className="p-3 sm:p-4 bg-[#F5F1EA] border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#7A736A]">
          <div className="flex items-center gap-2">
            <span>
              {locale === 'ar' ? 'عرض' : 'Showing'} {paginatedArticles.length}{' '}
              {locale === 'ar' ? 'من أصل' : 'of'} {sortedArticles.length}{' '}
              {locale === 'ar' ? 'مقال' : 'articles'}
            </span>

            <div className="h-3 w-[1px] bg-[#E4DED3] mx-1" />

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] px-2 py-1 text-xs text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              {locale === 'ar' ? 'صفحة' : 'Page'} {currentPage} {locale === 'ar' ? 'من' : 'of'}{' '}
              {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-[#1C1A17] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E4DED3] transition-colors cursor-pointer"
                title={locale === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
              >
                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-[#1C1A17] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E4DED3] transition-colors cursor-pointer"
                title={locale === 'ar' ? 'الصفحة التالية' : 'Next page'}
              >
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CREATE / EDIT MODAL                                                    */}
      {/* ========================================================================= */}
      <JournalEditor
        isOpen={isEditorOpen}
        article={selectedArticle}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedArticle(null);
        }}
        onSave={handleSaveArticle}
      />

      {/* ========================================================================= */}
      {/* 6. DELETE CONFIRMATION DIALOG                                             */}
      {/* ========================================================================= */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        title={locale === 'ar' ? 'حذف المقال التحريري نهائياً؟' : 'Permanently Delete Essay?'}
        description={
          locale === 'ar'
            ? `هل أنت متأكد من رغبتك في حذف المقال "${
                articleToDelete?.title?.ar || articleToDelete?.title?.en
              }"؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه من قاعدة البيانات فوراً.`
            : `Are you sure you want to permanently delete the essay "${
                articleToDelete?.title?.en || 'Untitled'
              }"? This action cannot be undone and will immediately remove it from Firestore.`
        }
        confirmLabel={locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
        cancelLabel={locale === 'ar' ? 'إلغاء' : 'Cancel'}
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={confirmDeleteArticle}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setArticleToDelete(null);
        }}
      />
    </div>
  );
};
