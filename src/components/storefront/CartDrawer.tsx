import React, { useEffect, useState, useRef } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Truck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { formatPrice } from '../../i18n/formatters';
import { Button } from './Button';
import { Input } from './Input';
import { QuantityStepper } from './QuantityStepper';
import { DirectionalArrowRight, DirectionalArrowLeft } from '../ui/DirectionalIcon';
import { RouteId } from '../../types';
import { useCart, CartItem } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersApi } from '../../api/ordersApi';
import { Order } from '../../types/backend';
import { useToast } from './Toast';

export interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string) => void;
}

type DrawerStep = 'cart' | 'checkout' | 'confirmation';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onRouteChange,
  onNavigateToProduct,
}) => {
  const { locale, direction, t } = useI18n();
  const { user } = useAuth();
  const { addToast } = useToast();
  const {
    items,
    isOpen: contextIsOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    totalQuantity,
  } = useCart();

  const isVisible = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const handleClose = propOnClose || closeCart;

  const [step, setStep] = useState<DrawerStep>('cart');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Checkout form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressCountry, setAddressCountry] = useState(locale === 'ar' ? 'المملكة العربية السعودية' : 'United Arab Emirates');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const drawerRef = useRef<HTMLDivElement>(null);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      if (user.displayName && !customerName) setCustomerName(user.displayName);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
    }
  }, [user, isVisible]);

  // Reset step when drawer closes
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setStep('cart');
        setOrderError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Handle focus lock & escape
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    setOrderError(null);
    setStep('checkout');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerEmail || !customerPhone || !addressLine1 || !addressCity) {
      setOrderError(
        locale === 'ar'
          ? 'يرجى إكمال جميع حقول التوصيل المطلوبة.'
          : 'Please complete all required delivery fields.'
      );
      return;
    }

    setIsSubmittingOrder(true);
    setOrderError(null);

    try {
      const orderRefId = `DAHR-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderPayload: Order = {
        id: orderRefId,
        customer: {
          uid: user ? user.uid : null,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: {
            line1: addressLine1,
            city: addressCity,
            country: addressCountry,
            postalCode: addressPostalCode || '00000',
          },
        },
        items: items.map((item) => ({
          productId: item.productId,
          name: {
            en: item.nameEn,
            ar: item.nameAr,
          },
          size: item.size,
          qty: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
        status: 'pending',
        createdAt: new Date().toISOString(),
        internalNotes: specialInstructions
          ? `Storefront Handoff. Customer Notes: ${specialInstructions}`
          : 'Storefront Handoff (Pending VIP Concierge Contact)',
      };

      await ordersApi.createOrder(orderPayload);

      setConfirmedOrder(orderPayload);
      clearCart();
      setStep('confirmation');

      addToast({
        type: 'success',
        title: locale === 'ar' ? 'تم تسجيل الطلب بنجاح' : 'Order Placed in Pending Status',
        message: locale === 'ar'
          ? `تم حفظ طلبك برقم ${orderRefId}. سيتواصل معك كونسيرج DAHR قريباً.`
          : `Your order #${orderRefId} was recorded. Our concierge will contact you shortly.`,
      });
    } catch (err: any) {
      console.error('Error placing order:', err);
      setOrderError(
        err?.message ||
          (locale === 'ar'
            ? 'تعذر إنشاء الطلب في سجلات الدار. يرجى المحاولة مرة أخرى.'
            : 'Could not record your order. Please try again.')
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div
      id="cart-drawer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('header.cartAria')}
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="fixed inset-0 bg-[#1C1A17]/40 backdrop-blur-none transition-opacity animate-in fade-in duration-200 cursor-pointer"
      />

      {/* Slideout Panel - Aligned to logical end (Right in LTR, Left in RTL) */}
      <div
        ref={drawerRef}
        className={`
          relative w-full max-w-[480px] h-full bg-[#FAF7F2] border-s border-[#E4DED3]
          flex flex-col justify-between p-6 sm:p-8 z-10 shadow-2xl text-start
          animate-in slide-in-from-end duration-250
        `}
      >
        {/* ========================================================================= */}
        {/* VIEW 1: CART LINE ITEMS                                                   */}
        {/* ========================================================================= */}
        {step === 'cart' && (
          <>
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#A98860]" />
                <h2 className="font-serif text-xl sm:text-2xl font-light text-[#1C1A17] tracking-wider">
                  {t('utilities.cartTitle')}
                </h2>
                <span className="text-[11px] font-mono text-[#7A736A] px-2 py-0.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
                  {totalQuantity} {locale === 'ar' ? 'عطر' : 'flacons'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label={locale === 'ar' ? 'إغلاق حقيبة التسوق' : 'Close shopping bag'}
                className="p-1.5 text-[#7A736A] hover:text-[#1C1A17] border border-[#E4DED3] rounded-[2px] bg-[#F5F1EA] cursor-pointer hover:border-[#1C1A17] transition-colors focus-visible:ring-1 focus-visible:ring-[#A98860]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bag Content */}
            {items.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-3.5 py-2 pe-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-3 transition-colors hover:border-[#1C1A17]/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Mini Bottle Thumbnail Badge */}
                      <div className="w-12 h-16 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px] flex flex-col items-center justify-center shrink-0 p-1">
                        <div className="w-4 h-2 bg-[#1C1A17] rounded-t-[1px]" />
                        <div className="w-2 h-1 bg-[#D1D1CF]" />
                        <div className="w-full flex-1 bg-gradient-to-b from-[#FAF7F2] to-[#F5F1EA] border border-[#D1D1CF] flex items-center justify-center">
                          <span className="text-[6px] font-serif font-bold text-[#1C1A17]">DAHR</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            handleClose();
                            if (onNavigateToProduct) {
                              onNavigateToProduct(item.productId);
                            } else {
                              onRouteChange('product-detail');
                            }
                          }}
                          className="text-start font-medium font-body text-[#1C1A17] text-[14px] hover:text-[#A98860] transition-colors truncate block w-full cursor-pointer"
                        >
                          {locale === 'ar' ? item.nameAr : item.nameEn}
                        </button>
                        <p className="text-[11px] font-mono text-[#A98860]">
                          {locale === 'ar' ? item.concentrationAr : item.concentrationEn}
                        </p>
                        <p className="text-[11px] font-mono text-[#7A736A]">
                          {locale === 'ar' ? item.volumeAr : item.volumeEn} • {formatPrice(item.price, locale, { currency: 'USD' })}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removeItem(item.id);
                          addToast({
                            type: 'info',
                            title: locale === 'ar' ? 'تمت الإزالة' : 'Item Removed',
                            message: locale === 'ar'
                              ? `تمت إزالة ${item.nameAr} من حقيبة التسوق.`
                              : `${item.nameEn} was removed from your bag.`,
                          });
                        }}
                        aria-label={`Remove ${item.nameEn} from bag`}
                        className="text-[#7A736A] hover:text-[#8C3B2E] p-1.5 cursor-pointer transition-colors rounded-[2px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[#E4DED3]/60">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(val) => updateQuantity(item.id, val)}
                        min={1}
                        max={10}
                        size="sm"
                      />
                      <span className="text-[14px] font-mono font-semibold text-[#1C1A17]">
                        {formatPrice(item.price * item.quantity, locale, { currency: 'USD' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Complimentary note */}
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#7A736A] leading-relaxed font-body">
                    {t('utilities.complimentaryShipping')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                <ShoppingBag className="w-10 h-10 text-[#A98860]/40 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#1C1A17]">{t('utilities.emptyCartTitle')}</h3>
                <p className="text-[12px] text-[#7A736A] font-body max-w-xs leading-relaxed">
                  {t('utilities.emptyCartSubtitle')}
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    onRouteChange('shop');
                    handleClose();
                  }}
                  className="mt-2"
                >
                  {t('utilities.continueShopping')}
                </Button>
              </div>
            )}

            {/* Drawer Footer & Checkout Action */}
            {items.length > 0 && (
              <div className="pt-4 border-t border-[#E4DED3] flex flex-col gap-3">
                <div className="flex items-center justify-between text-[13px] font-body">
                  <span className="text-[#7A736A]">{t('utilities.subtotal')}:</span>
                  <span className="font-mono text-[17px] font-semibold text-[#1C1A17]">
                    {formatPrice(subtotal, locale, { currency: 'USD' })}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
                  onClick={handleProceedToCheckout}
                >
                  {t('utilities.checkout')}
                </Button>

                <span className="text-center text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'شحن فوري آمن ومكيف لجميع الوجهات' : 'Complimentary White-Glove Courier Dispatch'}
                </span>
              </div>
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CHECKOUT HANDOFF & ORDER SUBMISSION FORM                           */}
        {/* ========================================================================= */}
        {step === 'checkout' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Header with Back button */}
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3 mb-3">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="flex items-center gap-1.5 text-xs font-mono text-[#7A736A] hover:text-[#1C1A17] transition-colors cursor-pointer"
              >
                <DirectionalArrowLeft className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'العودة للحقيبة' : 'Back to Bag'}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
                className="p-1 text-[#7A736A] hover:text-[#1C1A17] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="checkout-handoff-form" onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto space-y-4 pe-1">
              <div>
                <h3 className="font-serif text-xl font-light text-[#1C1A17]">
                  {locale === 'ar' ? 'تأكيد الطلب الفاخر' : 'Atelier Order Placement'}
                </h3>
                <p className="text-[12px] text-[#7A736A] font-body mt-0.5">
                  {locale === 'ar'
                    ? 'أدخل بيانات التوصيل لتسجيل طلبك الفاخر في سجلات الدار.'
                    : 'Provide delivery details to register your request in our private ledger.'}
                </p>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-3.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#7A736A]">{items.length} {locale === 'ar' ? 'عناصر مختارة' : 'Selected Items'}</span>
                  <span className="font-semibold text-[#1C1A17]">
                    {formatPrice(subtotal, locale, { currency: 'USD' })}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#A98860]">
                  {items.map((i) => `${locale === 'ar' ? i.nameAr : i.nameEn} (${i.size} × ${i.quantity})`).join(' • ')}
                </div>
              </div>

              {/* Notice regarding Payment Gateway Handoff */}
              <div className="p-3.5 bg-[#FAF7F2] border border-[#A98860]/50 rounded-[2px] flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A98860] shrink-0" />
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1C1A17]">
                    {locale === 'ar' ? 'بروتوكول التأكيد والدفع الفاخر' : 'Private Atelier Payment Protocol'}
                  </span>
                </div>
                <p className="text-[11px] text-[#554F47] leading-relaxed font-body">
                  {locale === 'ar'
                    ? 'تخضع بوابة الدفع الإلكتروني لمراجعة دار العطور. إرسال هذا النموذج يسجل طلبك بحالة (قيد الانتظار). سيتواصل معك كونسيرج DAHR هاتفياً أو عبر البريد لتأكيد ترتيبات الدفع المباشر والتوصيل الفاخر المبرد.'
                    : "Online payment gateway integration is currently in private atelier review. Placing this order creates a 'Pending' record in our registry. Our VIP Concierge will promptly contact you to confirm payment arrangements and white-glove climate delivery."}
                </p>
              </div>

              {orderError && (
                <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-2 text-[#8C3B2E] text-[12px] font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-3 pt-1">
                <Input
                  label={locale === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={locale === 'ar' ? 'سلطان عبدالعزيز' : 'Lord Julian Vance'}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label={locale === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@dahr.luxury"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label={locale === 'ar' ? 'رقم الهاتف للتوصيل *' : 'Delivery Contact Phone *'}
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+971 50 123 4567 / +966 50 123 4567"
                  leftIcon={<Phone className="w-4 h-4" />}
                  required
                />

                <Input
                  label={locale === 'ar' ? 'عنوان التوصيل (الشارع والفيلا/الشقة) *' : 'Shipping Address (Street, Villa/Apt) *'}
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder={locale === 'ar' ? 'طريق الملك فهد، برج رافال' : 'Emirates Hills, Sector E, Villa 12'}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={locale === 'ar' ? 'المدينة *' : 'City *'}
                    type="text"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder={locale === 'ar' ? 'الرياض / دبي' : 'Dubai / Riyadh'}
                    required
                  />

                  <Input
                    label={locale === 'ar' ? 'الدولة *' : 'Country *'}
                    type="text"
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    placeholder={locale === 'ar' ? 'السعودية' : 'United Arab Emirates'}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 text-start">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                    {locale === 'ar' ? 'ملاحظات الكونسيرج والتغليف (اختياري)' : 'Concierge & Packaging Notes (Optional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder={
                      locale === 'ar'
                        ? 'تغليف الهدايا الملكي، ختم الشمع المخصص...'
                        : 'Gift presentation, wax seal ribbon, discreet delivery timing...'
                    }
                    className="w-full bg-[#FFFFFF] border border-[#E4DED3] rounded-[2px] p-2.5 text-xs text-[#1C1A17] font-body focus:border-[#1C1A17] focus:outline-none resize-none transition-colors"
                  />
                </div>
              </div>
            </form>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#E4DED3] flex flex-col gap-2">
              <Button
                type="submit"
                form="checkout-handoff-form"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmittingOrder}
                rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
              >
                {locale === 'ar'
                  ? `تأكيد الطلب الفاخر (${formatPrice(subtotal, locale, { currency: 'USD' })})`
                  : `Place Order • ${formatPrice(subtotal, locale, { currency: 'USD' })}`}
              </Button>

              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-xs font-mono text-[#7A736A] hover:text-[#1C1A17] py-1 text-center cursor-pointer transition-colors"
              >
                {locale === 'ar' ? 'إلغاء والعودة للحقيبة' : 'Cancel and Return to Bag'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ORDER CONFIRMATION RECEIPT (PENDING CONCIERGE REVIEW)              */}
        {/* ========================================================================= */}
        {step === 'confirmation' && confirmedOrder && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto pe-1">
            <div className="flex flex-col gap-5 text-start py-2">
              {/* Success Badge */}
              <div className="p-4 bg-[#F5F1EA] border border-[#A98860]/40 rounded-[2px] flex flex-col items-center text-center gap-2.5">
                <div className="w-12 h-12 rounded-full bg-[#1C1A17] text-[#D4AF37] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-normal text-[#1C1A17]">
                  {locale === 'ar' ? 'تم تسجيل طلبك الفاخر بنجاح' : 'Order Recorded in Private Registry'}
                </h3>
                <span className="font-mono text-xs px-2.5 py-1 bg-[#FAF7F2] border border-[#E4DED3] text-[#A98860] font-semibold tracking-wider">
                  {confirmedOrder.id}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A736A] bg-[#FFF8E7] text-[#9E6B00] px-2 py-0.5 border border-[#F2DEB0]">
                  {locale === 'ar' ? 'الحالة: قيد مراجعة الكونسيرج (PENDING)' : 'STATUS: PENDING CONCIERGE REVIEW'}
                </span>
              </div>

              {/* Concierge Next Steps */}
              <div className="p-3.5 bg-[#FFFFFF] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#A98860]" />
                  <span className="text-xs font-mono font-medium text-[#1C1A17]">
                    {locale === 'ar' ? 'الخطوات التالية للتسليم' : 'White-Glove Dispatch Protocol'}
                  </span>
                </div>
                <p className="text-xs text-[#554F47] leading-relaxed font-body">
                  {locale === 'ar'
                    ? `تم إرسال إشعار تأكيد إلى ${confirmedOrder.customer.email}. سيتواصل معك كونسيرج الدار خلال ساعتين لتأكيد ترتيبات الدفع المباشر والشحن المبرد.`
                    : `A receipt has been logged for ${confirmedOrder.customer.email}. Our fragrance concierge will reach out within 2 hours to confirm your delivery schedule and payment verification.`}
                </p>
              </div>

              {/* Order Breakdown */}
              <div className="flex flex-col gap-2 p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'ملخص العناصر' : 'Order Summary'}
                </span>
                <div className="space-y-1.5 divide-y divide-[#E4DED3]/60">
                  {confirmedOrder.items.map((it, idx) => (
                    <div key={idx} className="pt-1.5 flex items-center justify-between text-xs font-body">
                      <span className="text-[#1C1A17]">
                        {locale === 'ar' ? it.name.ar : it.name.en} ({it.size}) × {it.qty}
                      </span>
                      <span className="font-mono font-medium text-[#1C1A17]">
                        {formatPrice(it.price * it.qty, locale, { currency: 'USD' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 mt-1 border-t border-[#E4DED3] flex items-center justify-between text-xs font-mono font-semibold">
                  <span className="text-[#7A736A]">{locale === 'ar' ? 'الإجمالي:' : 'Total Amount:'}</span>
                  <span className="text-[#1C1A17] text-sm">
                    {formatPrice(confirmedOrder.subtotal, locale, { currency: 'USD' })}
                  </span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="text-[11px] font-mono text-[#7A736A] p-2 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
                <strong>{locale === 'ar' ? 'وجهة الشحن:' : 'Delivery Destination:'}</strong>{' '}
                {confirmedOrder.customer.name}, {confirmedOrder.customer.address.line1},{' '}
                {confirmedOrder.customer.address.city}, {confirmedOrder.customer.address.country}
              </div>
            </div>

            {/* Confirmation Footer */}
            <div className="pt-4 border-t border-[#E4DED3] flex flex-col gap-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  handleClose();
                  onRouteChange('shop');
                }}
              >
                {locale === 'ar' ? 'متابعة استكشاف الكتالوج' : 'Continue Exploring Creations'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
