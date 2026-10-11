import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  LogOut,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../storefront/Toast';
import { RouteId, ProductData } from '../../types';
import { Order, UserAddress, UserProfile } from '../../types/backend';
import { ordersApi } from '../../api/ordersApi';
import { userStoreApi } from '../../api/userStoreApi';
import { productsApi } from '../../api/productsApi';
import { mapProductToStorefrontData } from '../../utils/productAdapter';
import { formatPrice } from '../../i18n/formatters';
import { Input } from '../storefront/Input';
import { Button } from '../storefront/Button';
import { DirectionalArrowRight, DirectionalChevronRight } from '../ui/DirectionalIcon';

export interface AccountPageProps {
  onRouteChange: (route: RouteId) => void;
  onNavigateToProduct?: (productId: string) => void;
}

type AccountSection = 'orders' | 'address' | 'wishlist';

export const AccountPage: React.FC<AccountPageProps> = ({
  onRouteChange,
  onNavigateToProduct,
}) => {
  const { locale, t } = useI18n();
  const { user, signIn, signUp, signOut } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { addToast } = useToast();

  // Navigation tab state
  const [activeSection, setActiveSection] = useState<AccountSection>('orders');

  // Auth Form State
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Saved Address State (stored on user profile)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSuccessMsg, setAddressSuccessMsg] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<UserAddress>({
    recipientName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Saudi Arabia',
  });

  // Wishlist Products State
  const [wishlistProducts, setWishlistProducts] = useState<ProductData[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  // 1. Fetch Orders when authenticated
  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      setIsLoadingOrders(true);
      ordersApi
        .getOrdersForCustomer(user.uid)
        .then((fetched) => {
          if (isMounted) setOrders(fetched);
        })
        .catch((err) => {
          console.warn('Could not load customer orders:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingOrders(false);
        });
    } else {
      setOrders([]);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  // 2. Fetch User Profile & Saved Address when authenticated
  useEffect(() => {
    let isMounted = true;
    if (user?.uid) {
      setIsLoadingProfile(true);
      userStoreApi
        .getUserProfile(user.uid)
        .then((profile) => {
          if (isMounted && profile) {
            setUserProfile(profile);
            if (profile.address) {
              setAddressForm({
                recipientName: profile.address.recipientName || profile.displayName || user.displayName || '',
                phone: profile.address.phone || profile.phone || '',
                line1: profile.address.line1 || '',
                line2: profile.address.line2 || '',
                city: profile.address.city || '',
                state: profile.address.state || '',
                postalCode: profile.address.postalCode || '',
                country: profile.address.country || 'Saudi Arabia',
              });
            } else {
              setAddressForm((prev) => ({
                ...prev,
                recipientName: profile.displayName || user.displayName || '',
                phone: profile.phone || '',
              }));
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load customer profile:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingProfile(false);
        });
    } else {
      setUserProfile(null);
    }
    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.displayName]);

  // 3. Fetch Wishlist Products
  useEffect(() => {
    let isMounted = true;
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }

    setIsLoadingWishlist(true);
    productsApi
      .getActiveProducts()
      .then((allProducts) => {
        if (isMounted) {
          const matched = allProducts
            .filter((p) => wishlistIds.includes(p.id))
            .map(mapProductToStorefrontData);
          setWishlistProducts(matched);
        }
      })
      .catch((err) => {
        console.warn('Could not load wishlist product records:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingWishlist(false);
      });

    return () => {
      isMounted = false;
    };
  }, [wishlistIds]);

  // Handle Authentication Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setAuthError(null);
    setIsAuthSubmitting(true);

    try {
      if (authMode === 'signin') {
        await signIn(authEmail, authPassword);
      } else {
        await signUp(authEmail, authPassword, authDisplayName);
      }
      setAuthPassword('');
      addToast({
        type: 'success',
        title: locale === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Authentication Successful',
        message:
          locale === 'ar'
            ? 'مرحباً بك في مجلس عملاء دار الخاص.'
            : 'Welcome to your private DAHR client space.',
      });
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setAuthError(locale === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setAuthError(locale === 'ar' ? 'البريد الإلكتروني مسجل مسبقاً.' : 'Email is already registered.');
      } else if (code === 'auth/weak-password') {
        setAuthError(
          locale === 'ar'
            ? 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل.'
            : 'Password must be at least 6 characters.'
        );
      } else {
        setAuthError(err?.message || (locale === 'ar' ? 'حدث خطأ أثناء الاتصال.' : 'Authentication error.'));
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Handle Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!addressForm.line1 || !addressForm.city || !addressForm.country) {
      setAddressSuccessMsg(null);
      return;
    }

    setIsSavingAddress(true);
    setAddressSuccessMsg(null);

    try {
      await userStoreApi.saveSavedAddress(user.uid, addressForm, addressForm.phone);
      setAddressSuccessMsg(
        locale === 'ar' ? 'تم حفظ عنوان الشحن بنجاح.' : 'Shipping address updated successfully.'
      );
      addToast({
        type: 'success',
        title: locale === 'ar' ? 'تم تحديث العنوان' : 'Address Saved',
        message:
          locale === 'ar'
            ? 'سيتم اعتماد هذا العنوان تلقائياً للطلبيات القادمة.'
            : 'Your primary shipping address has been updated.',
      });
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Move product to cart
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
      title: locale === 'ar' ? 'أضيف إلى الحقيبة' : 'Added to Bag',
      message: `${locale === 'ar' ? product.nameAr : product.nameEn} — ${product.volumeEn}`,
    });
  };

  // Helper status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-0.5 bg-[#FFF8E7] text-[#9E6B00] border border-[#F2DEB0] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'مؤكد' : 'Confirmed'}
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-0.5 bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'تم الشحن' : 'Dispatched'}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'تم التسليم' : 'Delivered'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-[#F5F1EA] text-[#7A736A] border border-[#E4DED3] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div id="customer-account-area" className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16">
      {/* Editorial Header */}
      <div className="border-b border-[#E4DED3] pb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
            {locale === 'ar' ? 'مجلس العميل' : 'Client Space'}
          </span>
          <span className="text-[10px] font-mono text-[#A98860]">•</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98860]">
            {user ? (locale === 'ar' ? 'حساب نشط' : 'Authenticated') : (locale === 'ar' ? 'تسجيل الدخول' : 'Access')}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1A17]">
            {user
              ? locale === 'ar'
                ? `أهلاً بك، ${user.displayName || user.email?.split('@')[0]}`
                : `Welcome, ${user.displayName || user.email?.split('@')[0]}`
              : locale === 'ar'
              ? 'حساب العميل'
              : 'Customer Account'}
          </h1>

          {user && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center gap-1.5 text-xs font-mono text-[#7A736A] hover:text-[#8C3B2E] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-[14px] text-[#7A736A] max-w-2xl font-body">
          {user
            ? locale === 'ar'
              ? 'مساحتك الخاصة لمتابعة الطلبات، إدارة عنوان الشحن، واستعراض قائمة رغباتك العطرية.'
              : 'Your dedicated sanctuary for tracking bespoke orders, managing your saved address, and reviewing your curated olfactive wishlist.'
            : locale === 'ar'
            ? 'سجّل الدخول إلى حسابك أو أنشئ حساباً جديداً للوصول إلى سجل طلباتك وعنوانك المحفوظ وقائمة رغباتك.'
            : 'Sign in to access your order history, manage your saved shipping address, and view your curated olfactive wishlist.'}
        </p>
      </div>

      {/* VIEW: UNAUTHENTICATED (Sign In / Create Account) */}
      {!user ? (
        <div className="max-w-md mx-auto w-full">
          <div className="bg-[#FAF7F2] border border-[#E4DED3] p-6 sm:p-8 rounded-[2px] flex flex-col gap-6 shadow-sm">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
              <button
                type="button"
                id="auth-tab-signin"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-mono uppercase tracking-wider rounded-[2px] transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold shadow-xs'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                type="button"
                id="auth-tab-signup"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`py-2 text-xs font-mono uppercase tracking-wider rounded-[2px] transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold shadow-xs'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'إنشاء حساب' : 'Create Account'}
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div
                role="alert"
                className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-2.5 text-[#8C3B2E] text-[12px] font-mono"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              {authMode === 'signup' && (
                <Input
                  id="account-display-name-input"
                  label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  type="text"
                  value={authDisplayName}
                  onChange={(e) => setAuthDisplayName(e.target.value)}
                  placeholder={locale === 'ar' ? 'سلطان عبدالعزيز' : 'Lord Vance'}
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  autoComplete="name"
                  required
                />
              )}

              <Input
                id="account-email-input"
                label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="client@dahr.luxury"
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />

              <Input
                id="account-password-input"
                label={locale === 'ar' ? 'كلمة المرور' : 'Password'}
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                required
              />

              <Button
                id="account-submit-btn"
                type="submit"
                variant="primary"
                size="md"
                loading={isAuthSubmitting}
                className="mt-2"
                fullWidth
              >
                {authMode === 'signin'
                  ? locale === 'ar'
                    ? 'تسجيل الدخول إلى الحساب'
                    : 'Sign In to Account'
                  : locale === 'ar'
                  ? 'إنشاء حساب عميل جديد'
                  : 'Create Client Account'}
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-[#E4DED3] text-xs font-mono text-[#7A736A]">
              <span>
                {authMode === 'signin'
                  ? locale === 'ar'
                    ? 'ليس لديك حساب بعد؟ '
                    : "Don't have an account yet? "
                  : locale === 'ar'
                  ? 'لديك حساب مسجل بالفعل؟ '
                  : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError(null);
                }}
                className="text-[#1C1A17] font-semibold underline hover:text-[#A98860] cursor-pointer"
              >
                {authMode === 'signin'
                  ? locale === 'ar'
                    ? 'إنشاء حساب جديد'
                    : 'Create an account'
                  : locale === 'ar'
                  ? 'تسجيل الدخول'
                  : 'Sign in here'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW: AUTHENTICATED SINGLE-PAGE AREA WITH SECTION NAVIGATION */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Section Navigation Sidebar (Desktop 3 cols / Mobile horizontal tabs) */}
          <aside className="md:col-span-3 w-full">
            {/* Mobile Tab Select / Strip */}
            <div className="md:hidden flex p-1 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] mb-6">
              <button
                type="button"
                onClick={() => setActiveSection('orders')}
                className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                  activeSection === 'orders'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'الطلبات' : 'Orders'} ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('address')}
                className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                  activeSection === 'address'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'العنوان' : 'Address'}
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('wishlist')}
                className={`flex-1 py-2 text-center text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer ${
                  activeSection === 'wishlist'
                    ? 'bg-[#1C1A17] text-[#FAF7F2] font-semibold'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'المفضلة' : 'Wishlist'} ({wishlistIds.length})
              </button>
            </div>

            {/* Desktop Vertical Section Menu */}
            <nav
              aria-label={locale === 'ar' ? 'قائمة تنقل الحساب' : 'Account Navigation Menu'}
              className="hidden md:flex flex-col bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] divide-y divide-[#E4DED3]"
            >
              <button
                type="button"
                id="acc-nav-orders"
                onClick={() => setActiveSection('orders')}
                className={`w-full p-4 flex items-center justify-between text-start text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeSection === 'orders'
                    ? 'bg-[#F5F1EA] text-[#1C1A17] font-semibold border-s-3 border-[#1C1A17]'
                    : 'text-[#7A736A] hover:bg-[#F5F1EA]/50 hover:text-[#1C1A17]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'سجل الطلبات' : 'Order History'}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#E4DED3] text-[#1C1A17] text-[10px] rounded-full">
                  {orders.length}
                </span>
              </button>

              <button
                type="button"
                id="acc-nav-address"
                onClick={() => setActiveSection('address')}
                className={`w-full p-4 flex items-center justify-between text-start text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeSection === 'address'
                    ? 'bg-[#F5F1EA] text-[#1C1A17] font-semibold border-s-3 border-[#1C1A17]'
                    : 'text-[#7A736A] hover:bg-[#F5F1EA]/50 hover:text-[#1C1A17]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'عنوان الشحن' : 'Saved Address'}</span>
                </div>
                <DirectionalChevronRight className="w-3.5 h-3.5 text-[#7A736A]" />
              </button>

              <button
                type="button"
                id="acc-nav-wishlist"
                onClick={() => setActiveSection('wishlist')}
                className={`w-full p-4 flex items-center justify-between text-start text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  activeSection === 'wishlist'
                    ? 'bg-[#F5F1EA] text-[#1C1A17] font-semibold border-s-3 border-[#1C1A17]'
                    : 'text-[#7A736A] hover:bg-[#F5F1EA]/50 hover:text-[#1C1A17]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'قائمة الرغبات' : 'Wishlist'}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#E4DED3] text-[#1C1A17] text-[10px] rounded-full">
                  {wishlistIds.length}
                </span>
              </button>
            </nav>

            {/* Profile Info Summary Card */}
            <div className="mt-6 p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                {locale === 'ar' ? 'معلومات العميل' : 'Client Profile'}
              </span>
              <p className="text-[13px] font-medium text-[#1C1A17] truncate">
                {user.displayName || (locale === 'ar' ? 'عميل خاص' : 'Private Client')}
              </p>
              <p className="text-[11px] font-mono text-[#7A736A] truncate">{user.email}</p>
            </div>
          </aside>

          {/* Main Section Outlet (9 cols on Desktop) */}
          <main className="md:col-span-9 w-full bg-[#FAF7F2] border border-[#E4DED3] p-6 sm:p-8 rounded-[2px]">
            {/* SECTION 1: ORDER HISTORY */}
            {activeSection === 'orders' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-[#A98860]" />
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A17]">
                      {locale === 'ar' ? 'سجل الطلبات الخاصة' : 'Order Ledger'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[#7A736A]">
                    {orders.length} {locale === 'ar' ? 'طلب مسجل' : 'records'}
                  </span>
                </div>

                {isLoadingOrders ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3 text-[#7A736A]">
                    <Clock className="w-6 h-6 animate-spin text-[#A98860]" />
                    <span className="text-xs font-mono">
                      {locale === 'ar' ? 'جارٍ استرجاع سجل الطلبات...' : 'Retrieving order ledger from Firestore...'}
                    </span>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-4 hover:border-[#1C1A17]/30 transition-colors"
                      >
                        {/* Order Top Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4DED3]/80">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-[#1C1A17]">
                              #{ord.id}
                            </span>
                            <span className="text-[11px] font-mono text-[#7A736A]">
                              {new Date(ord.createdAt).toLocaleDateString(
                                locale === 'ar' ? 'ar-SA' : 'en-US',
                                { year: 'numeric', month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                          <div>{getStatusBadge(ord.status)}</div>
                        </div>

                        {/* Order Items Listing */}
                        <div className="space-y-2">
                          {ord.items.map((item, idx) => (
                            <div
                              key={`${ord.id}-${item.productId}-${idx}`}
                              className="flex items-center justify-between text-xs font-body"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[#7A736A]">{item.quantity}×</span>
                                <span className="font-medium text-[#1C1A17]">
                                  {locale === 'ar' ? item.nameAr || item.nameEn : item.nameEn}
                                </span>
                                {item.size && (
                                  <span className="text-[10px] font-mono text-[#7A736A]">
                                    ({item.size})
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[#1C1A17]">
                                {formatPrice(item.price * item.quantity, locale, {
                                  currency: ord.currency === 'USD' ? 'USD' : 'USD',
                                })}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary & Destination */}
                        <div className="pt-3 border-t border-[#E4DED3]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="text-[11px] font-mono text-[#7A736A] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#A98860] shrink-0" />
                            <span className="truncate max-w-xs">
                              {ord.shippingAddress
                                ? `${ord.shippingAddress.city || ''}, ${ord.shippingAddress.country || ''}`
                                : (locale === 'ar' ? 'الشحن المباشر' : 'Direct Concierge Dispatch')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="text-[#7A736A]">{locale === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                            <span className="font-bold text-[#1C1A17] text-sm">
                              {formatPrice(ord.totalAmount || ord.subtotal, locale, { currency: 'USD' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Package className="w-10 h-10 text-[#A98860]/40 stroke-[1.2]" />
                    <h3 className="font-serif text-lg text-[#1C1A17]">
                      {locale === 'ar' ? 'لا توجد طلبات مسجلة بعد' : 'No Order History Found'}
                    </h3>
                    <p className="text-[13px] text-[#7A736A] max-w-sm font-body">
                      {locale === 'ar'
                        ? 'لم يتم تسجيل أي طلبيات سابقة على هذا الحساب. استكشف تشكيلاتنا العطرية الحصرية.'
                        : 'No previous orders recorded under this client profile. Explore our rare extrait creations.'}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRouteChange('shop')}
                      className="mt-2"
                      rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
                    >
                      {locale === 'ar' ? 'استعراض المتجر' : 'Explore Fragrance Shop'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: ONE SAVED ADDRESS */}
            {activeSection === 'address' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-[#A98860]" />
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A17]">
                      {locale === 'ar' ? 'عنوان الشحن المحفوظ' : 'Saved Shipping Address'}
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono text-[#7A736A]">
                    {locale === 'ar' ? 'عنوان رئيسي واحد' : 'Single Primary Destination'}
                  </span>
                </div>

                <p className="text-[13px] text-[#7A736A] font-body">
                  {locale === 'ar'
                    ? 'يتم استخدام هذا العنوان تلقائياً كوجهة للتوصيل المبرد في جميع طلبياتك القادمة.'
                    : 'This address is securely preserved on your client profile and applied automatically during climate-controlled courier checkout.'}
                </p>

                {addressSuccessMsg && (
                  <div
                    role="status"
                    className="p-3.5 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] rounded-[2px] flex items-center gap-2 text-xs font-mono"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{addressSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <Input
                      id="saved-addr-name"
                      label={locale === 'ar' ? 'اسم المستلم' : 'Recipient Full Name'}
                      value={addressForm.recipientName || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))
                      }
                      placeholder={locale === 'ar' ? 'سلطان عبدالعزيز' : 'Lord Vance'}
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      id="saved-addr-phone"
                      label={locale === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}
                      type="tel"
                      value={addressForm.phone || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="+966 50 000 0000"
                      leftIcon={<Phone className="w-4 h-4" />}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      id="saved-addr-line1"
                      label={locale === 'ar' ? 'عنوان الشارع / المبنى' : 'Address Line 1'}
                      value={addressForm.line1 || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, line1: e.target.value }))
                      }
                      placeholder={locale === 'ar' ? 'طريق الملك فهد، حي العليا' : 'King Fahd Road, Al Olaya'}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Input
                      id="saved-addr-line2"
                      label={locale === 'ar' ? 'رقم الشقة / الجناح (اختياري)' : 'Apartment, suite, unit (optional)'}
                      value={addressForm.line2 || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, line2: e.target.value }))
                      }
                      placeholder={locale === 'ar' ? 'فيلا 14، جناح خاص' : 'Suite 400'}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      id="saved-addr-city"
                      label={locale === 'ar' ? 'المدينة' : 'City'}
                      value={addressForm.city || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder={locale === 'ar' ? 'الرياض' : 'Riyadh'}
                      required
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      id="saved-addr-state"
                      label={locale === 'ar' ? 'المنطقة / المحافظة' : 'State / Province / Region'}
                      value={addressForm.state || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                      placeholder={locale === 'ar' ? 'منطقة الرياض' : 'Riyadh Province'}
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <Input
                      id="saved-addr-postal"
                      label={locale === 'ar' ? 'الرمز البريدي' : 'Postal / ZIP Code'}
                      value={addressForm.postalCode || ''}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))
                      }
                      placeholder="12214"
                    />
                  </div>

                  <div className="sm:col-span-1 flex flex-col gap-1 text-start">
                    <label
                      htmlFor="saved-addr-country"
                      className="text-xs font-mono uppercase tracking-wider text-[#7A736A]"
                    >
                      {locale === 'ar' ? 'الدولة' : 'Country'}
                    </label>
                    <select
                      id="saved-addr-country"
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, country: e.target.value }))
                      }
                      className="h-10 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-body text-[#1C1A17] focus:outline-none focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860]"
                    >
                      <option value="Saudi Arabia">Saudi Arabia (المملكة العربية السعودية)</option>
                      <option value="United Arab Emirates">United Arab Emirates (الإمارات)</option>
                      <option value="Kuwait">Kuwait (الكويت)</option>
                      <option value="Qatar">Qatar (قطر)</option>
                      <option value="Bahrain">Bahrain (البحرين)</option>
                      <option value="Oman">Oman (عُمان)</option>
                      <option value="France">France (فرنسا)</option>
                      <option value="United Kingdom">United Kingdom (المملكة المتحدة)</option>
                      <option value="United States">United States (الولايات المتحدة)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-4 border-t border-[#E4DED3] flex justify-end">
                    <Button
                      id="save-address-btn"
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={isSavingAddress}
                      leftIcon={<MapPin className="w-4 h-4" />}
                    >
                      {locale === 'ar' ? 'حفظ العنوان' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION 3: WISHLIST VIEW */}
            {activeSection === 'wishlist' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#E4DED3] pb-4">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-[#A98860] fill-[#A98860]/20" />
                    <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A17]">
                      {locale === 'ar' ? 'المفضلة وقائمة الرغبات' : 'Curated Wishlist'}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-[#7A736A]">
                    {wishlistIds.length} {locale === 'ar' ? 'عطور محفوظة' : 'saved items'}
                  </span>
                </div>

                {isLoadingWishlist ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3 text-[#7A736A]">
                    <Sparkles className="w-6 h-6 animate-pulse text-[#A98860]" />
                    <span className="text-xs font-mono">
                      {locale === 'ar' ? 'جارٍ تحميل العطور المحفوظة...' : 'Loading curated creations...'}
                    </span>
                  </div>
                ) : wishlistProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((product) => {
                      const name = locale === 'ar' ? product.nameAr : product.nameEn;
                      const family = locale === 'ar' ? product.olfactiveFamilyAr : product.olfactiveFamilyEn;
                      const concentration = locale === 'ar' ? product.concentrationAr : product.concentrationEn;

                      return (
                        <div
                          key={product.id}
                          className="p-5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-4 hover:border-[#1C1A17]/30 transition-colors"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
                                {family}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleWishlist(product.id)}
                                title={locale === 'ar' ? 'إزالة من المفضلة' : 'Remove from wishlist'}
                                className="text-[#7A736A] hover:text-[#8C3B2E] p-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateToProduct) {
                                  onNavigateToProduct(product.id);
                                } else {
                                  onRouteChange('product-detail');
                                }
                              }}
                              className="text-start font-serif text-lg text-[#1C1A17] hover:text-[#A98860] transition-colors cursor-pointer"
                            >
                              {name}
                            </button>

                            <p className="text-[11px] font-mono text-[#7A736A]">{concentration}</p>
                            <p className="text-[11px] font-mono text-[#7A736A]">{product.volumeEn}</p>
                          </div>

                          <div className="pt-3 border-t border-[#E4DED3]/80 flex items-center justify-between gap-2">
                            <span className="font-mono text-sm font-semibold text-[#1C1A17]">
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
                  <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Heart className="w-10 h-10 text-[#A98860]/40 stroke-[1.2]" />
                    <h3 className="font-serif text-lg text-[#1C1A17]">
                      {locale === 'ar' ? 'قائمة الرغبات فارغة' : 'Your Wishlist is Empty'}
                    </h3>
                    <p className="text-[13px] text-[#7A736A] max-w-sm font-body">
                      {locale === 'ar'
                        ? 'احفظ إبداعاتك المفضلة بالضغط على أيقونة القلب أثناء استعراض التشكيلات العطرية.'
                        : 'Save your preferred fragrance extracts by tapping the heart icon in our boutique catalog.'}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onRouteChange('shop')}
                      className="mt-2"
                      rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
                    >
                      {locale === 'ar' ? 'استعراض التشكيلة' : 'Explore Fragrance Boutique'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
