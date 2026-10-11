import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  X,
  Sparkles,
  Mail,
  Lock,
  LogOut,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { ModalShell } from './ModalShell';
import { Input } from './Input';
import { Button } from './Button';
import { RouteId } from '../../types';
import { ordersApi } from '../../api/ordersApi';
import { Order } from '../../types/backend';
import { formatPrice } from '../../i18n/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteChange: (route: RouteId) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onRouteChange,
}) => {
  const { locale, t } = useI18n();
  const { user, signIn, signUp, signOut } = useAuth();
  const { wishlistIds } = useWishlist();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && user?.uid) {
      setIsLoadingOrders(true);
      ordersApi
        .getOrdersForCustomer(user.uid)
        .then((orders) => {
          if (isMounted) setUserOrders(orders);
        })
        .catch((err) => {
          console.warn('Could not load user orders:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingOrders(false);
        });
    } else {
      setUserOrders([]);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
      }
      setIsSubmitting(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setIsSubmitting(false);
      const code = err?.code || '';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMsg(locale === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg(locale === 'ar' ? 'البريد الإلكتروني مسجل مسبقاً.' : 'Email is already registered.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg(locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : 'Password must be at least 6 characters.');
      } else {
        setErrorMsg(err.message || (locale === 'ar' ? 'حدث خطأ أثناء المصادقة.' : 'Authentication error.'));
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 bg-[#FFF8E7] text-[#9E6B00] border border-[#F2DEB0] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'قيد الانتظار' : 'Pending Review'}
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-0.5 bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'مؤكد' : 'Confirmed'}
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2 py-0.5 bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'تم الشحن' : 'Dispatched'}
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-0.5 bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {locale === 'ar' ? 'تم التسليم' : 'Delivered'}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-[#F5F1EA] text-[#7A736A] border border-[#E4DED3] text-[10px] font-mono uppercase tracking-wider rounded-[2px]">
            {status}
          </span>
        );
    }
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={t('utilities.accountTitle')}
      maxWidth="md"
    >
      <div className="flex flex-col gap-6 text-start">
        {user ? (
          // Authenticated User Profile View
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center font-mono text-sm uppercase">
                  {user.email ? user.email.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[#1C1A17] text-[14px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[12px] font-mono text-[#7A736A]">{user.email}</span>
                </div>
              </div>
            </div>

            {/* Order History Section */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'سجل الطلبات الخاصة' : 'Recent Private Orders'}
                </span>
                <span className="text-[11px] font-mono text-[#A98860]">
                  {userOrders.length} {locale === 'ar' ? 'طلب مسجل' : 'orders'}
                </span>
              </div>

              {isLoadingOrders ? (
                <div className="p-4 bg-[#FAF7F2] border border-[#E4DED3] text-center text-xs font-mono text-[#7A736A]">
                  {locale === 'ar' ? 'جارٍ تحميل الطلبات...' : 'Loading order ledger...'}
                </div>
              ) : userOrders.length > 0 ? (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pe-1">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2 text-xs font-body"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-semibold text-[#1C1A17]">{ord.id}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A]">
                        <span>{new Date(ord.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        <span className="font-semibold text-[#1C1A17]">
                          {formatPrice(ord.subtotal, locale, { currency: 'USD' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-center text-xs text-[#7A736A]">
                  {locale === 'ar'
                    ? 'لم يتم تسجيل طلبات سابقة بعد في هذا الحساب.'
                    : 'No past orders registered on this profile.'}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#E4DED3]">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<LogOut className="w-4 h-4" />}
                onClick={handleSignOut}
                fullWidth
              >
                {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
              </Button>
            </div>
          </div>
        ) : (
          // Sign In / Sign Up Form
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-[13px] text-[#7A736A] leading-relaxed font-body">
              {t('utilities.accountSubtitle')}
            </p>

            {errorMsg && (
              <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-2 text-[#8C3B2E] text-[12px] font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {mode === 'signup' && (
              <Input
                label={locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={locale === 'ar' ? 'سلطان عبدالعزيز' : 'Lord Vance'}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label={t('utilities.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@dahr.luxury"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label={t('utilities.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              fullWidth
            >
              {mode === 'signin' ? t('utilities.signIn') : (locale === 'ar' ? 'إنشاء حساب جديد' : 'Create Client Account')}
            </Button>

            <div className="flex items-center justify-between text-xs font-mono text-[#7A736A] pt-2 border-t border-[#E4DED3]">
              <span>
                {mode === 'signin'
                  ? (locale === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?")
                  : (locale === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg(null);
                }}
                className="text-[#1C1A17] underline hover:text-[#A98860] cursor-pointer"
              >
                {mode === 'signin'
                  ? (locale === 'ar' ? 'إنشاء حساب' : 'Register')
                  : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalShell>
  );
};
