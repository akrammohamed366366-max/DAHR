import React, { useState } from 'react';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft, ArrowRight, CheckCircle, Key } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { RouteId } from '../../types';
import { Input } from '../storefront/Input';
import { Button } from '../storefront/Button';
import { RoleBadge } from './RoleBadge';

export interface AdminLoginProps {
  onRouteChange: (route: RouteId) => void;
  targetAdminRoute?: RouteId;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onRouteChange,
  targetAdminRoute = 'admin-dashboard',
}) => {
  const { locale, direction } = useI18n();
  const { user, isStaffOrAdmin, role, signIn, signOut } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = direction === 'rtl';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      // Auth state listener in AuthContext will update adminProfile/role.
      // If the user has valid admin/staff role, navigation will proceed to the target admin route.
    } catch (err: any) {
      console.error('Admin authentication failure:', err);
      const code = err?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        setErrorMsg(
          locale === 'ar'
            ? 'بيانات تسجيل الدخول غير صحيحة.'
            : 'Invalid credentials. Please verify your administrator email and password.'
        );
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg(
          locale === 'ar'
            ? 'تم تجاوز عدد محاولات الدخول المسموح بها. يرجى المحاولة لاحقاً.'
            : 'Too many unsuccessful attempts. Please try again in a few minutes.'
        );
      } else {
        setErrorMsg(
          err?.message ||
            (locale === 'ar' ? 'فشل تسجيل الدخول إلى لوحة الإدارة.' : 'Admin authentication failed.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated with admin privileges
  if (user && isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#2A2723] border border-[#3E3A34] p-8 rounded-[2px] text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#4B5D46]/20 border border-[#4B5D46]/40 flex items-center justify-center text-[#4B5D46]">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
              {locale === 'ar' ? 'جلسة إدارية نشطة' : 'Active Session'}
            </span>
            <h2 className="text-xl font-serif text-[#FAF7F2] mt-1">
              {locale === 'ar' ? 'مرحباً بك في لوحة الإدارة' : 'Atelier Access Granted'}
            </h2>
            <p className="text-xs font-mono text-[#9B9488] mt-2">{user.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9B9488]">
              {locale === 'ar' ? 'الصلاحية:' : 'Role:'}
            </span>
            <RoleBadge role={role === 'fullAdmin' ? 'admin' : 'manager'} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => onRouteChange('admin-dashboard')}
              className="flex-1 py-2.5 px-4 bg-[#A98860] hover:bg-[#967750] text-[#1C1A17] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'دخول لوحة التحكم' : 'Enter Dashboard'}
            </button>
            <button
              type="button"
              onClick={() => onRouteChange('home')}
              className="py-2.5 px-4 bg-[#1C1A17] hover:bg-[#3E3A34] text-[#FAF7F2] border border-[#3E3A34] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'المتجر' : 'Storefront'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If signed in as a customer account without admin record
  if (user && !isStaffOrAdmin) {
    return (
      <div className="min-h-screen bg-[#1C1A17] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#2A2723] border border-[#8C3B2E]/40 p-8 rounded-[2px] text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#8C3B2E]/20 border border-[#8C3B2E]/40 flex items-center justify-center text-[#8C3B2E]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C3B2E]">
              {locale === 'ar' ? 'وصول مقيّد' : 'Access Restricted'}
            </span>
            <h2 className="text-xl font-serif text-[#FAF7F2] mt-1">
              {locale === 'ar' ? 'صلاحيات غير كافية' : 'Admin Privileges Required'}
            </h2>
            <p className="text-xs font-mono text-[#9B9488] mt-2">
              {locale === 'ar'
                ? `الحساب الحالي (${user.email}) لا يملك صلاحيات وصول إدارية في سجل adminUsers.`
                : `The authenticated account (${user.email}) is not registered in the atelier adminUsers ledger.`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <button
              type="button"
              onClick={() => signOut()}
              className="flex-1 py-2.5 px-4 bg-[#8C3B2E] hover:bg-[#722F24] text-[#FAF7F2] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
            <button
              type="button"
              onClick={() => onRouteChange('home')}
              className="py-2.5 px-4 bg-[#1C1A17] hover:bg-[#3E3A34] text-[#FAF7F2] border border-[#3E3A34] font-mono text-xs uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
            >
              {locale === 'ar' ? 'العودة للمتجر' : 'Storefront'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-login-screen" className="min-h-screen bg-[#141312] text-[#FAF7F2] flex flex-col justify-between p-6 sm:p-12">
      {/* Top Bar Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#A98860] text-[#1C1A17] flex items-center justify-center font-serif font-bold text-sm rounded-[2px]">
            D
          </div>
          <span className="font-serif tracking-widest text-base font-semibold text-[#FAF7F2]">
            DAHR
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#2A2723] text-[#A98860] border border-[#3E3A34] rounded-[2px]">
            ATELIER ADMIN
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRouteChange('home')}
          className="flex items-center gap-1.5 text-xs font-mono text-[#9B9488] hover:text-[#FAF7F2] transition-colors cursor-pointer"
        >
          {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{locale === 'ar' ? 'العودة للمتجر' : 'Public Storefront'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-8">
        <div className="bg-[#1C1A17] border border-[#2E2B26] p-8 rounded-[2px] shadow-2xl flex flex-col gap-6">
          <div className="border-b border-[#2E2B26] pb-4">
            <div className="flex items-center gap-2 text-[#A98860]">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                {locale === 'ar' ? 'بوابة التحقق الآمنة' : 'Secure Management Console'}
              </span>
            </div>
            <h1 className="font-serif text-2xl text-[#FAF7F2] mt-2">
              {locale === 'ar' ? 'تسجيل دخول الإدارة' : 'Admin Sign In'}
            </h1>
            <p className="text-xs font-body text-[#9B9488] mt-1">
              {locale === 'ar'
                ? 'مخصصة لمسؤولي النظام ومديري المحتوى المصرح لهم فقط.'
                : 'Restricted to authorized atelier staff and system administrators.'}
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-[#8C3B2E]/20 border border-[#8C3B2E]/50 rounded-[2px] flex items-center gap-2.5 text-[#E68A7E] text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#8C3B2E]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="admin-email-input"
                className="text-[11px] font-mono uppercase tracking-wider text-[#9B9488]"
              >
                {locale === 'ar' ? 'البريد الإلكتروني الإداري' : 'Administrator Email'}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute start-3 text-[#7A736A] pointer-events-none" />
                <input
                  id="admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dahr.luxury"
                  required
                  autoComplete="email"
                  className="w-full h-10 ps-9 pe-3 bg-[#2A2723] border border-[#3E3A34] text-xs font-mono text-[#FAF7F2] placeholder-[#5C564E] rounded-[2px] focus:outline-none focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-start">
              <label
                htmlFor="admin-password-input"
                className="text-[11px] font-mono uppercase tracking-wider text-[#9B9488]"
              >
                {locale === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 absolute start-3 text-[#7A736A] pointer-events-none" />
                <input
                  id="admin-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-10 ps-9 pe-3 bg-[#2A2723] border border-[#3E3A34] text-xs font-mono text-[#FAF7F2] placeholder-[#5C564E] rounded-[2px] focus:outline-none focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860]"
                />
              </div>
            </div>

            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full h-10 bg-[#A98860] hover:bg-[#967750] disabled:opacity-50 text-[#1C1A17] font-mono text-xs uppercase tracking-wider font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{locale === 'ar' ? 'جارٍ التحقق...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'دخول لوحة التحكم' : 'Authenticate & Enter'}</span>
                </>
              )}
            </button>
          </form>

          {/* Verification notice */}
          <div className="p-3 bg-[#24211D] border border-[#332F28] rounded-[2px] text-[11px] font-mono text-[#9B9488] flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-[#A98860] shrink-0 mt-0.5" />
            <span>
              {locale === 'ar'
                ? 'يتم التحقق من الصلاحيات عبر سجلات Firestore adminUsers (أدوار: fullAdmin أو staff).'
                : 'Role verification is enforced server-side against Firestore adminUsers records (fullAdmin or staff).'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#5C564E]">
        <span>DAHR Fragrances Atelier • Management Core</span>
        <span>Version 2.4.0 • Enterprise Security Layer</span>
      </div>
    </div>
  );
};
