import React, { useEffect, useState, useRef } from 'react';
import { Heart, X, ShoppingBag, Trash2, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { formatPrice } from '../../i18n/formatters';
import { Button } from './Button';
import { RouteId, ProductData } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { productsApi } from '../../api/productsApi';
import { mapProductToStorefrontData } from '../../utils/productAdapter';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { useToast } from './Toast';

export interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  onRouteChange,
  onNavigateToProduct,
}) => {
  const { locale, t } = useI18n();
  const { wishlistIds, toggleWishlist, clearWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const { addToast } = useToast();
  const [wishlistProducts, setWishlistProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadWishlistProducts() {
      if (!isOpen || wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }

      setIsLoading(true);
      try {
        const allProducts = await productsApi.getActiveProducts();
        if (isMounted) {
          const matched = allProducts
            .filter((p) => wishlistIds.includes(p.id))
            .map(mapProductToStorefrontData);
          setWishlistProducts(matched);
        }
      } catch (err) {
        console.warn('Could not load wishlist product details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadWishlistProducts();

    return () => {
      isMounted = false;
    };
  }, [isOpen, wishlistIds]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trapping setup
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMoveToBag = (product: ProductData) => {
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      concentrationEn: product.concentrationEn,
      concentrationAr: product.concentrationAr,
      volumeEn: product.volumeEn,
      volumeAr: product.volumeAr,
      price: product.price,
      size: '100ml',
    });

    addToast({
      type: 'success',
      title: locale === 'ar' ? 'تمت الإضافة للحقيبة' : 'Added to Bag',
      message: locale === 'ar'
        ? `تم نقل ${product.nameAr} إلى حقيبة التسوق الخاصة بك.`
        : `${product.nameEn} has been added to your shopping bag.`,
    });

    onClose();
    openCart();
  };

  const handleRemove = (productId: string, name: string) => {
    toggleWishlist(productId);
    addToast({
      type: 'info',
      title: locale === 'ar' ? 'تمت الإزالة' : 'Item Removed',
      message: locale === 'ar'
        ? `تمت إزالة ${name} من قائمة رغباتك.`
        : `${name} was removed from your wishlist.`,
    });
  };

  return (
    <div
      id="wishlist-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={locale === 'ar' ? 'قائمة الرغبات الخاصة' : 'Private Curated Wishlist'}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1A17]/40 backdrop-blur-none transition-opacity animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Slideout Panel - Aligned to end-0 (Right in LTR, Left in RTL) */}
      <div
        ref={drawerRef}
        className={`
          relative w-full max-w-[440px] h-full bg-[#FAF7F2] border-s border-[#E4DED3]
          flex flex-col justify-between p-6 sm:p-8 z-10 shadow-2xl text-start
          animate-in slide-in-from-end duration-250
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-[#A98860] fill-[#A98860]/20" />
            <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1C1A17] tracking-wider">
              {locale === 'ar' ? 'قائمة الرغبات' : 'Curated Wishlist'}
            </h2>
            <span className="text-[11px] font-mono text-[#7A736A] px-2 py-0.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
              {wishlistIds.length} {locale === 'ar' ? 'عطر' : 'fragrances'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'ar' ? 'إغلاق قائمة الرغبات' : 'Close wishlist'}
            className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] border border-[#E4DED3] rounded-[2px] bg-[#F5F1EA] cursor-pointer hover:border-[#1C1A17] transition-colors focus-visible:ring-1 focus-visible:ring-[#A98860]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#7A736A]">
            <Sparkles className="w-6 h-6 animate-pulse text-[#A98860]" />
            <span className="text-xs font-mono">
              {locale === 'ar' ? 'جارٍ تحميل المفضلة...' : 'Loading curated creations...'}
            </span>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-4 py-2 pe-1">
            {wishlistProducts.map((product) => {
              const name = locale === 'ar' ? product.nameAr : product.nameEn;
              const concentration = locale === 'ar' ? product.concentrationAr : product.concentrationEn;
              const volume = locale === 'ar' ? product.volumeAr : product.volumeEn;

              return (
                <div
                  key={product.id}
                  className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-3 transition-colors hover:border-[#1C1A17]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigateToProduct) {
                            onNavigateToProduct(product.id);
                          } else {
                            onRouteChange('product-detail');
                          }
                        }}
                        className="text-start font-medium font-body text-[#1C1A17] text-[14px] hover:text-[#A98860] transition-colors cursor-pointer block"
                      >
                        {name}
                      </button>
                      <p className="text-[11px] font-mono text-[#A98860]">{concentration}</p>
                      <p className="text-[11px] font-mono text-[#7A736A]">{volume}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(product.id, name)}
                      aria-label={`Remove ${name} from wishlist`}
                      className="text-[#7A736A] hover:text-[#8C3B2E] p-1.5 cursor-pointer transition-colors rounded-[2px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4DED3]/60">
                    <span className="text-[14px] font-mono font-semibold text-[#1C1A17]">
                      {formatPrice(product.price, locale, { currency: 'USD' })}
                    </span>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleMoveToBag(product)}
                      leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    >
                      {locale === 'ar' ? 'إضافة للحقيبة' : 'Add to Bag'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
            <Heart className="w-10 h-10 text-[#A98860]/40 stroke-[1.2]" />
            <h3 className="font-serif text-lg text-[#1C1A17]">
              {locale === 'ar' ? 'قائمة الرغبات فارغة' : 'Your Wishlist is Empty'}
            </h3>
            <p className="text-[12px] text-[#7A736A] font-body max-w-xs leading-relaxed">
              {locale === 'ar'
                ? 'احفظ إبداعات العطور النادرة المفضلة لديك بالضغط على أيقونة القلب أثناء تصفح التشكيلات.'
                : 'Save your preferred rare fragrance extracts by tapping the heart icon while exploring our catalog.'}
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                onClose();
                onRouteChange('shop');
              }}
              className="mt-2"
            >
              {locale === 'ar' ? 'استكشف العطور' : 'Explore Fragrances'}
            </Button>
          </div>
        )}

        {/* Footer */}
        {wishlistProducts.length > 0 && (
          <div className="pt-4 border-t border-[#E4DED3] flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                clearWishlist();
                addToast({
                  type: 'info',
                  title: locale === 'ar' ? 'تم مسح المفضلة' : 'Wishlist Cleared',
                  message: locale === 'ar' ? 'تمت إزالة جميع العناصر من المفضلة.' : 'All items have been cleared from your wishlist.',
                });
              }}
              className="text-xs font-mono text-[#7A736A] hover:text-[#8C3B2E] transition-colors py-1 cursor-pointer text-center"
            >
              {locale === 'ar' ? 'مسح قائمة الرغبات بالكامل' : 'Clear Entire Wishlist'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
