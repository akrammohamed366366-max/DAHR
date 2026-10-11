import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/context';
import { ProductData } from '../../types';
import { Product } from '../../types/backend';
import { productsApi } from '../../api/productsApi';
import { formatPrice } from '../../i18n/formatters';
import { ModalShell } from '../storefront/ModalShell';
import { Button } from '../storefront/Button';
import { Badge } from '../storefront/Badge';
import { Sparkles, ShieldCheck, Check, Loader2, Heart } from 'lucide-react';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../storefront/Toast';

export interface QuickViewModalProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: ProductData) => void;
  onViewProductDetails?: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onViewProductDetails,
}) => {
  const { locale, t } = useI18n();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      if (!product || !isOpen) {
        setFullProduct(null);
        return;
      }

      try {
        setIsLoadingDetails(true);
        const doc = await productsApi.getProductById(product.id);
        if (isMounted) {
          setFullProduct(doc);
          setSelectedSizeIndex(0);
        }
      } catch (err) {
        console.warn('Error fetching full product details for quick view:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDetails(false);
        }
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [product, isOpen]);

  if (!product) return null;

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const olfactiveFamily = locale === 'ar' ? product.olfactiveFamilyAr : product.olfactiveFamilyEn;
  const concentration = locale === 'ar' ? product.concentrationAr : product.concentrationEn;

  // Selected size calculation
  const currentSize = fullProduct?.sizes?.[selectedSizeIndex];
  const currentPrice = currentSize?.price || product.price;
  const currentVolume = currentSize?.size || product.volumeEn;
  const formattedPrice = formatPrice(currentPrice, locale, { currency: 'USD' });

  // Notes pyramid from full product or fallback
  const topNotes = fullProduct?.notes?.top
    ? locale === 'ar'
      ? fullProduct.notes.top.ar
      : fullProduct.notes.top.en
    : product.topNotesEn || (locale === 'ar' ? 'مستخلصات علوية نادرة' : 'Rare Botanical Top Notes');

  const heartNotes = fullProduct?.notes?.heart
    ? locale === 'ar'
      ? fullProduct.notes.heart.ar
      : fullProduct.notes.heart.en
    : locale === 'ar'
    ? 'قلب عطري غني بالخلاصات الجبلية'
    : 'Rich Highland Floral & Balsamic Heart';

  const baseNotes = fullProduct?.notes?.base
    ? locale === 'ar'
      ? fullProduct.notes.base.ar
      : fullProduct.notes.base.en
    : locale === 'ar'
    ? 'قاعدة من العود المعتق والعنبر والراتنج'
    : 'Aged Agarwood, Resinous Amber & Cedar';

  const longDesc = fullProduct?.longDescription
    ? locale === 'ar'
      ? fullProduct.longDescription.ar
      : fullProduct.longDescription.en
    : locale === 'ar'
    ? 'عطر فاخر مصنوع بنسب تركيز استثنائية دون تخفيف، يعكس تقاليد الصياغة الشمية الأصيلة.'
    : 'An exquisite extrait de parfum crafted at pure concentration without dilution, celebrating the quiet depth of timeless botanicals.';

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      id="quick-view-modal"
    >
      <div className="flex flex-col md:flex-row gap-6 text-start">
        {/* Left: Product Flacon Presentation */}
        <div className="w-full md:w-5/12 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-6 flex flex-col items-center justify-center relative overflow-hidden">
          {product.isNew ? (
            <div className="absolute top-3 start-3">
              <Badge variant="accent" size="sm">
                {locale === 'ar' ? 'جديد' : 'NEW'}
              </Badge>
            </div>
          ) : product.isLimited ? (
            <div className="absolute top-3 start-3">
              <Badge variant="neutral" size="sm">
                {locale === 'ar' ? 'إصدار خاص' : 'LIMITED'}
              </Badge>
            </div>
          ) : null}

          {/* Bottle Graphic */}
          <div className="w-28 h-44 relative flex flex-col items-center justify-end my-4">
            <div className="w-10 h-7 bg-[#1C1A17] rounded-t-[1px] relative">
              <div className="absolute inset-x-2 bottom-0 h-[1px] bg-[#A98860]/40" />
            </div>
            <div className="w-4 h-2 bg-[#D1D1CF] border-x border-[#E4DED3]" />
            <div className="w-full flex-1 bg-gradient-to-b from-[#FAF7F2] to-[#F5F1EA] border border-[#D1D1CF] rounded-[1px] flex flex-col items-center justify-center p-3 relative shadow-inner">
              <span className="font-serif text-[12px] font-bold tracking-[0.25em] text-[#1C1A17] select-none">
                DAHR
              </span>
              <div className="w-4 h-[0.5px] bg-[#A98860] my-1.5" />
              <span className="text-[9px] font-mono text-[#7A736A] uppercase tracking-widest text-center truncate max-w-[90px]">
                {name}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#7A736A] uppercase tracking-wider mt-2">
            {currentVolume}
          </span>
        </div>

        {/* Right: Olfactive Details & Purchase */}
        <div className="w-full md:w-7/12 flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#A98860] uppercase tracking-widest">
                  DAHR LUXURY
                </span>
                <span className="text-[11px] font-mono text-[#7A736A]">
                  {concentration}
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17] font-normal mt-1">
                {name}
              </h2>
              <p className="text-xs font-mono text-[#7A736A] mt-0.5">
                {olfactiveFamily}
              </p>
            </div>

            {/* Price */}
            <div className="text-xl font-mono font-medium text-[#1C1A17]">
              {formattedPrice}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-[13px] font-body text-[#554F47] leading-relaxed line-clamp-3">
              {longDesc}
            </p>

            {/* Olfactive Pyramid (Notes) */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2 font-body text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98860] font-semibold">
                {locale === 'ar' ? 'الهرم الشمي والتدرج العطري' : 'Olfactive Architecture'}
              </span>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <strong className="text-[#1C1A17] block font-mono text-[10px] uppercase">
                    {locale === 'ar' ? 'القمة' : 'Top'}
                  </strong>
                  <span className="text-[#7A736A]">{topNotes}</span>
                </div>
                <div>
                  <strong className="text-[#1C1A17] block font-mono text-[10px] uppercase">
                    {locale === 'ar' ? 'القلب' : 'Heart'}
                  </strong>
                  <span className="text-[#7A736A]">{heartNotes}</span>
                </div>
                <div>
                  <strong className="text-[#1C1A17] block font-mono text-[10px] uppercase">
                    {locale === 'ar' ? 'القاعدة' : 'Base'}
                  </strong>
                  <span className="text-[#7A736A]">{baseNotes}</span>
                </div>
              </div>
            </div>

            {/* Size Variants Selection */}
            {fullProduct?.sizes && fullProduct.sizes.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'اختر الحجم' : 'Select Volume'}
                </span>
                <div className="flex items-center gap-2">
                  {fullProduct.sizes.map((s, idx) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`px-3 py-1.5 text-xs font-mono rounded-[2px] border transition-colors cursor-pointer ${
                        selectedSizeIndex === idx
                          ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17]'
                          : 'bg-[#FFFFFF] text-[#554F47] border-[#E4DED3] hover:border-[#1C1A17]'
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E4DED3] flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  onAddToCart?.({
                    ...product,
                    price: currentPrice,
                    volumeEn: currentVolume,
                    volumeAr: currentVolume,
                  });
                  onClose();
                }}
                rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
              >
                {t('actions.addToBag')} • {formattedPrice}
              </Button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => {
                  const nowWishlisted = toggleWishlist(product.id);
                  addToast({
                    type: 'success',
                    title: nowWishlisted
                      ? (locale === 'ar' ? 'أضيف إلى المفضلة' : 'Saved to Wishlist')
                      : (locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist'),
                    message: locale === 'ar'
                      ? `تم تحديث ${product.nameAr} في قائمة رغباتك.`
                      : `${product.nameEn} has been updated in your wishlist.`,
                  });
                }}
                aria-label={
                  locale === 'ar'
                    ? (isWishlisted(product.id) ? 'إزالة من قائمة الرغبات' : 'إضافة إلى قائمة الرغبات')
                    : (isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist')
                }
                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
                  isWishlisted(product.id)
                    ? 'bg-[#FAF7F2] text-[#A98860] border-[#A98860]'
                    : 'bg-[#FFFFFF] text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17] hover:border-[#1C1A17]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-[#A98860]' : ''}`} />
              </button>
            </div>

            {onViewProductDetails && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewProductDetails(product.id);
                }}
                className="w-full text-center text-xs font-mono uppercase tracking-wider text-[#7A736A] hover:text-[#1C1A17] py-1 transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{locale === 'ar' ? 'عرض ملف العطر الكامل والتفاصيل' : 'View Full Fragrance Dossier & Notes'}</span>
                <DirectionalArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  );
};
