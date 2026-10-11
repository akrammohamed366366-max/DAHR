import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductData } from '../../types';
import { useI18n } from '../../i18n/context';
import { formatPrice } from '../../i18n/formatters';
import { Button } from './Button';
import { Badge } from './Badge';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from './Toast';
import { heartVariants } from '../../utils/motion';

export interface ProductCardProps {
  product: ProductData;
  onAddToCart?: (product: ProductData) => void;
  onQuickView?: (product: ProductData) => void;
  onSelect?: (product: ProductData) => void;
  className?: string;
  id?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  onSelect,
  className = '',
  id,
}) => {
  const { locale, t } = useI18n();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const [heartAnimKey, setHeartAnimKey] = useState(0);

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const olfactiveFamily = locale === 'ar' ? product.olfactiveFamilyAr : product.olfactiveFamilyEn;
  const concentration = locale === 'ar' ? product.concentrationAr : product.concentrationEn;
  const volume = locale === 'ar' ? product.volumeAr : product.volumeEn;
  const formattedPrice = formatPrice(product.price, locale, { currency: 'USD' });
  const wishlisted = isWishlisted(product.id);

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowWishlisted = toggleWishlist(product.id);
    setHeartAnimKey((k) => k + 1);
    addToast({
      type: 'success',
      title: nowWishlisted
        ? (locale === 'ar' ? 'أضيف إلى المفضلة' : 'Saved to Wishlist')
        : (locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from Wishlist'),
      message: locale === 'ar'
        ? `تم تحديث ${name} في قائمة رغباتك الخاصة.`
        : `${name} has been updated in your curated wishlist.`,
    });
  };

  return (
    <article
      id={id || `product-card-${product.id}`}
      className={`
        group relative flex flex-col bg-[#FAF7F2] border border-[#E4DED3]
        rounded-[2px] overflow-hidden transition-all duration-300 ease-out
        hover:border-[#1C1A17]/40 hover:bg-[#FFFFFF]
        ${className}
      `}
    >
      {/* Visual Image Presentation Area */}
      <div 
        onClick={handleCardClick}
        className={`relative w-full aspect-[3/4] bg-[#F5F1EA] flex flex-col items-center justify-center p-6 border-b border-[#E4DED3] overflow-hidden ${
          onSelect ? 'cursor-pointer' : ''
        }`}
      >
        {/* Top Badges & Wishlist Button */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 pointer-events-none">
            {product.isNew ? (
              <Badge variant="accent" size="sm">
                {locale === 'ar' ? 'جديد' : 'NEW'}
              </Badge>
            ) : product.isLimited ? (
              <Badge variant="neutral" size="sm">
                {locale === 'ar' ? 'إصدار محدود' : 'LIMITED'}
              </Badge>
            ) : null}
            <span className="text-[10px] font-mono text-[#7A736A] uppercase tracking-wider bg-[#FAF7F2]/90 px-2 py-0.5 border border-[#E4DED3]">
              {volume}
            </span>
          </div>

          {/* Wishlist Heart Toggle */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            title={wishlisted ? (locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from Wishlist') : (locale === 'ar' ? 'إضافة إلى المفضلة' : 'Save to Wishlist')}
            className={`
              w-8 h-8 rounded-[2px] flex items-center justify-center transition-colors duration-200 cursor-pointer border
              ${wishlisted 
                ? 'bg-[#1C1A17] text-[#D4AF37] border-[#1C1A17]' 
                : 'bg-[#FAF7F2]/90 text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17] hover:border-[#1C1A17]'
              }
            `}
          >
            <motion.span
              key={heartAnimKey}
              variants={heartVariants}
              initial="initial"
              animate={heartAnimKey > 0 ? 'active' : 'initial'}
              className="flex items-center justify-center"
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-[#D4AF37]' : ''}`} />
            </motion.span>
          </button>
        </div>

        {/* Minimalist Fragrance Bottle Silhouette Representation */}
        <div className="w-24 sm:w-28 h-36 sm:h-44 relative flex flex-col items-center justify-end group-hover:scale-[1.02] transition-transform duration-500 ease-out">
          {/* Cap */}
          <div className="w-8 sm:w-10 h-6 sm:h-7 bg-[#1C1A17] border border-[#1C1A17] rounded-t-[1px] mb-1 relative">
            <div className="absolute inset-x-1.5 bottom-0 h-[1px] bg-[#A98860]/40" />
          </div>
          {/* Neck */}
          <div className="w-4 h-2 bg-[#D1D1CF] border-x border-[#E4DED3]" />
          {/* Glass Body */}
          <div className="w-full flex-1 bg-gradient-to-b from-[#FAF7F2] to-[#F5F1EA] border border-[#D1D1CF] rounded-[1px] flex flex-col items-center justify-center p-3 relative shadow-inner">
            <span className="font-serif text-[11px] font-bold tracking-[0.25em] text-[#1C1A17] select-none">
              DAHR
            </span>
            <div className="w-4 h-[0.5px] bg-[#A98860] my-1" />
            <span className="text-[8px] font-mono text-[#7A736A] uppercase tracking-widest text-center truncate max-w-[80px]">
              {name}
            </span>
          </div>
        </div>

        {/* Quick View Hover Trigger */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="
              absolute bottom-3 inset-x-4 py-2 text-[11px] uppercase tracking-[0.1em]
              bg-[#FAF7F2]/95 text-[#1C1A17] border border-[#E4DED3] rounded-[2px]
              opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer
              hover:bg-[#1C1A17] hover:text-[#FAF7F2] hover:border-[#1C1A17]
              [dir=rtl]:tracking-normal [dir=rtl]:normal-case
            "
          >
            {t('actions.quickView')}
          </button>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 text-start">
        <div className="flex flex-col gap-1">
          {/* Brand Name strictly Latin "DAHR" */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#A98860] uppercase tracking-widest">
              DAHR
            </span>
            <span className="text-[11px] font-mono text-[#7A736A]">
              {concentration}
            </span>
          </div>

          <h3 
            onClick={handleCardClick}
            className={`font-display text-[20px] sm:text-[22px] text-[#1C1A17] font-normal tracking-wide group-hover:text-[#A98860] transition-colors line-clamp-1 ${
              onSelect ? 'cursor-pointer' : ''
            }`}
          >
            {name}
          </h3>

          <p className="text-[12px] text-[#7A736A] font-body line-clamp-1">
            {olfactiveFamily}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E4DED3] flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#7A736A] font-mono uppercase tracking-wider">
              {volume}
            </span>
            <span className="font-mono text-[14px] sm:text-[15px] font-medium text-[#1C1A17]">
              {formattedPrice}
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAddToCart?.(product)}
            aria-label={`${t('actions.addToBag')} - ${name}`}
          >
            {t('actions.addToBag')}
          </Button>
        </div>
      </div>
    </article>
  );
};
