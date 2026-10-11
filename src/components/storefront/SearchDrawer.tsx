import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, Sparkles, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { formatPrice } from '../../i18n/formatters';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { RouteId } from '../../types';
import { Product } from '../../types/backend';
import { productsApi } from '../../api/productsApi';

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string, family?: string) => void;
}

interface CuratedTerm {
  en: string;
  ar: string;
}

const CURATED_SEARCH_TERMS: CuratedTerm[] = [
  { en: 'Oud Al-Waqt', ar: 'عود الوقت' },
  { en: 'Taif Dawn Rose', ar: 'ورد الطائف فجراً' },
  { en: 'Santalum Asir', ar: 'صندل عسير' },
  { en: 'Ambra Nocturne', ar: 'عنبر الليل' },
  { en: 'Hojari Sovereign', ar: 'لبان الحوجري السامي' },
  { en: 'Musk Al-Qamar', ar: 'مسك القمر' },
];

export const SearchDrawer: React.FC<SearchDrawerProps> = ({
  isOpen,
  onClose,
  onRouteChange,
  onNavigateToProduct,
}) => {
  const { locale, t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear or refocus when open state changes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
      setResults([]);
      setIsSearching(false);
      setSelectedIndex(-1);
      setLiveAnnouncement('');
    }
  }, [isOpen]);

  // Perform debounced predictive search against Firestore data layer
  const executeSearch = useCallback(
    async (queryText: string) => {
      const trimmed = queryText.trim();
      if (!trimmed) {
        setResults([]);
        setIsSearching(false);
        setSelectedIndex(-1);
        setLiveAnnouncement('');
        return;
      }

      setIsSearching(true);
      try {
        const found = await productsApi.searchProducts(trimmed, 6);
        setResults(found);
        setSelectedIndex(-1);

        // Update accessibility live region
        if (found.length === 0) {
          setLiveAnnouncement(
            locale === 'ar'
              ? 'لم يتم العثور على خلاصات عطرية مطابقة'
              : 'No matching fragrance compositions found'
          );
        } else {
          setLiveAnnouncement(
            locale === 'ar'
              ? `تم العثور على ${found.length} خلاصات مطابقة`
              : `${found.length} matching compositions found`
          );
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [locale]
  );

  // Debounced input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setIsSearching(false);
      setSelectedIndex(-1);
      setLiveAnnouncement('');
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      executeSearch(value);
    }, 150);
  };

  // Quick selection of curated chips
  const handleSelectSuggestedTerm = (term: string) => {
    setSearchTerm(term);
    executeSearch(term);
    inputRef.current?.focus();
  };

  // Direct navigation to Product Detail Page (PDP)
  const handleSelectProduct = (product: Product) => {
    if (onNavigateToProduct) {
      onNavigateToProduct(product.id, product.scentFamily);
    } else {
      if (typeof window !== 'undefined') {
        window.location.hash = `product-detail?id=${product.id}${product.scentFamily ? `&family=${product.scentFamily}` : ''}`;
      }
      onRouteChange('product-detail');
    }
    onClose();
  };

  // Route to pre-filtered Shop view with query
  const handleViewAllResults = () => {
    const q = searchTerm.trim();
    if (typeof window !== 'undefined') {
      window.location.hash = q ? `shop?search=${encodeURIComponent(q)}` : 'shop';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    onRouteChange('shop');
    onClose();
  };

  // Keyboard navigation & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        }
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && results[selectedIndex]) {
          e.preventDefault();
          handleSelectProduct(results[selectedIndex]);
        } else if (searchTerm.trim()) {
          e.preventDefault();
          handleViewAllResults();
        }
      } else if (e.key === 'Tab' && modalRef.current) {
        // Focus trap
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [isOpen, results, selectedIndex, searchTerm, onClose]);

  if (!isOpen) return null;

  const hasSearchText = searchTerm.trim().length > 0;

  return (
    <div
      id="search-overlay-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      className="fixed inset-0 z-50 flex flex-col items-center justify-start sm:pt-16 lg:pt-20 px-0 sm:px-4"
    >
      {/* Dimmed Quiet Backdrop */}
      <div
        id="search-overlay-backdrop"
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[#141311]/55 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
      />

      {/* Screen Reader Live Region Announcer */}
      <div
        id="search-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Overlay / Modal Surface */}
      <div
        ref={modalRef}
        id="search-overlay-panel"
        className={`
          relative w-full sm:max-w-3xl bg-[#FAF7F2] border-b sm:border border-[#E4DED3]
          sm:rounded-[2px] shadow-2xl z-10 flex flex-col text-start overflow-hidden
          h-full sm:h-auto sm:max-h-[85vh] animate-in slide-in-from-top-4 duration-200
        `}
      >
        {/* Top Header & Search Input Row */}
        <div className="p-4 sm:p-6 border-b border-[#E4DED3] bg-[#FAF7F2] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h2 id="search-dialog-title" className="sr-only">
              {t('header.searchAria')}
            </h2>

            {/* Input Field Container */}
            <div className="relative flex items-center flex-1 bg-[#F5F1EA] border border-[#E4DED3] focus-within:border-[#A98860] focus-within:bg-[#FAF7F2] rounded-[2px] transition-all px-3.5 py-2.5">
              <label htmlFor="search-catalog-input" className="sr-only">
                {t('utilities.searchTitle')}
              </label>

              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#A98860] animate-spin shrink-0 me-3" />
              ) : (
                <Search className="w-4 h-4 text-[#A98860] shrink-0 me-3" />
              )}

              <input
                ref={inputRef}
                id="search-catalog-input"
                type="search"
                autoComplete="off"
                spellCheck="false"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={t('utilities.searchPlaceholder')}
                aria-label={t('utilities.searchTitle')}
                aria-autocomplete="list"
                aria-controls="search-results-container"
                className="w-full bg-transparent border-none text-[15px] sm:text-[16px] font-body text-[#1C1A17] placeholder:text-[#7A736A]/60 focus:outline-none"
              />

              {hasSearchText && (
                <button
                  id="search-clear-btn"
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setResults([]);
                    setSelectedIndex(-1);
                    setLiveAnnouncement('');
                    inputRef.current?.focus();
                  }}
                  aria-label={locale === 'ar' ? 'مسح حقل البحث' : 'Clear search input'}
                  className="p-1 text-[#7A736A] hover:text-[#1C1A17] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Overlay Close Button */}
            <button
              id="search-close-button"
              type="button"
              onClick={onClose}
              aria-label={locale === 'ar' ? 'إغلاق البحث' : 'Close search overlay'}
              className="p-2.5 text-[#7A736A] hover:text-[#1C1A17] border border-[#E4DED3] rounded-[2px] bg-[#F5F1EA] hover:border-[#1C1A17] transition-colors cursor-pointer shrink-0 focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Results or Pristine Suggestions */}
        <div
          id="search-results-container"
          className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6"
        >
          {hasSearchText ? (
            /* Results State */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E4DED3]/60 pb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
                  {locale === 'ar' ? 'النتائج المطابقة' : 'Archive Matches'}{' '}
                  {!isSearching && `(${results.length})`}
                </span>

                {results.length > 0 && (
                  <span className="text-[11px] font-mono text-[#A98860] hidden sm:inline-block">
                    {locale === 'ar' ? 'استخدم الأسهم ⇅ للتنقل و Enter للاختيار' : 'Use ⇅ arrows to navigate, Enter to select'}
                  </span>
                )}
              </div>

              {/* Result Items List */}
              {results.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {results.map((product, idx) => {
                    const isSelected = selectedIndex === idx;
                    const name = locale === 'ar' ? product.name.ar : product.name.en;
                    const descriptor = locale === 'ar' ? product.shortDescriptor?.ar : product.shortDescriptor?.en;
                    const primaryPrice = product.sizes?.[0]?.price || 0;
                    const imgUrl = product.images?.[0] || '/assets/products/oud_al_waqt_hero.jpg';

                    return (
                      <button
                        key={product.id}
                        id={`search-result-${product.id}`}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`
                          w-full p-3 sm:p-3.5 rounded-[2px] border text-start transition-all cursor-pointer
                          flex items-center gap-4 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860]
                          ${
                            isSelected
                              ? 'bg-[#F5F1EA] border-[#A98860] shadow-xs'
                              : 'bg-[#FAF7F2] border-[#E4DED3] hover:bg-[#F5F1EA] hover:border-[#A98860]/70'
                          }
                        `}
                      >
                        {/* Bottle Thumbnail Image */}
                        <div className="w-14 h-16 sm:w-16 sm:h-18 bg-[#141311] rounded-[2px] border border-[#E4DED3] shrink-0 overflow-hidden relative">
                          <img
                            src={imgUrl}
                            alt={name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback on image load error
                              (e.target as HTMLImageElement).src = '/assets/products/oud_al_waqt_hero.jpg';
                            }}
                          />
                        </div>

                        {/* Middle Text Details */}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98860] truncate">
                              {locale === 'ar' ? `خلاصة ${product.scentFamily}` : `${product.scentFamily} Extrait`}
                            </span>
                            {product.flags?.isSignature && (
                              <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#141311] text-[#FAF7F2] rounded-[1px]">
                                {locale === 'ar' ? 'استثنائي' : 'Signature'}
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-[15px] sm:text-[17px] text-[#1C1A17] group-hover:text-[#A98860] transition-colors truncate">
                            {name}
                          </h3>

                          {descriptor && (
                            <p className="text-[12px] text-[#7A736A] font-body line-clamp-1">
                              {descriptor}
                            </p>
                          )}
                        </div>

                        {/* Right / End Zone: Price & Navigation Arrow */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ps-2">
                          <span className="font-mono text-[13px] sm:text-[14px] text-[#1C1A17] font-medium">
                            {formatPrice(primaryPrice, locale)}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#A98860] opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="hidden sm:inline">{locale === 'ar' ? 'استكشف' : 'View'}</span>
                            <DirectionalArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : !isSearching ? (
                /* Empty / No-Results Calm State */
                <div
                  id="search-empty-state"
                  className="p-8 sm:p-10 text-center bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col items-center gap-4"
                >
                  <p className="text-[14px] text-[#7A736A] font-body max-w-md leading-relaxed">
                    {locale === 'ar'
                      ? 'لم يتم العثور على خلاصات عطرية مطابقة في الأرشيف الشمي. جرب مصطلحات مثل "عود"، "ورد"، أو "صندل".'
                      : 'No matching fragrance compositions found in the olfactive archive. Try terms such as "Oud", "Taif Rose", or "Santalum".'}
                  </p>

                  <button
                    id="search-empty-browse-btn"
                    type="button"
                    onClick={() => {
                      onRouteChange('shop');
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF7F2] border border-[#1C1A17] text-[#1C1A17] hover:bg-[#1C1A17] hover:text-[#FAF7F2] text-[12px] font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                  >
                    <span>{locale === 'ar' ? 'استعراض كافة العطور' : 'Browse All Fragrances'}</span>
                    <DirectionalArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              {/* "View all in Shop" Option if results exist */}
              {results.length > 0 && (
                <div className="pt-3 border-t border-[#E4DED3] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#7A736A]">
                    {locale === 'ar' ? 'أرشيف DAHR الشمي — الرياض وغراس' : 'DAHR Olfactive Archive — Riyadh & Grasse'}
                  </span>

                  <button
                    id="search-view-all-shop-btn"
                    type="button"
                    onClick={handleViewAllResults}
                    className="inline-flex items-center gap-1.5 text-[12px] font-mono uppercase text-[#A98860] hover:text-[#1C1A17] transition-colors cursor-pointer font-medium py-1 px-2"
                  >
                    <span>
                      {locale === 'ar'
                        ? `عرض كافة النتائج في المتجر (${results.length})`
                        : `View all results in shop (${results.length})`}
                    </span>
                    <DirectionalArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Pristine State with Curated Suggested Searches */
            <div className="flex flex-col gap-6">
              <div>
                <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[#7A736A] mb-3">
                  {t('utilities.recentSearches')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {CURATED_SEARCH_TERMS.map((term, idx) => {
                    const label = locale === 'ar' ? term.ar : term.en;
                    return (
                      <button
                        key={idx}
                        id={`search-suggested-chip-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestedTerm(label)}
                        className="px-3.5 py-2 text-[13px] font-body bg-[#F5F1EA] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] hover:border-[#A98860] hover:text-[#A98860] hover:bg-[#FAF7F2] transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-[#A98860] focus-visible:outline-none"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4DED3] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#7A736A]">
                  {locale === 'ar' ? 'تركيز خلاصات نقية (24%–40%)' : 'Pure Extrait Formulations (24%–40%)'}
                </span>
                <button
                  id="search-explore-catalog-btn"
                  type="button"
                  onClick={() => {
                    onRouteChange('shop');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-mono uppercase text-[#A98860] hover:text-[#1C1A17] transition-colors cursor-pointer"
                >
                  <span>{locale === 'ar' ? 'استعراض الكتالوج الكامل' : 'Explore Full Catalog'}</span>
                  <DirectionalArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
