import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Shield,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  UserCheck,
  UserX,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { AdminRole, AdminUser, AdminUserStatus } from '../../../types/backend';
import { RoleBadge } from '../RoleBadge';
import { StatusPill } from '../StatusPill';

export interface AdminUserModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  user: AdminUser | null;
  isLastActiveFullAdmin: boolean;
  onClose: () => void;
  onCreate: (params: {
    email: string;
    displayName: string;
    role: AdminRole;
    password?: string;
  }) => Promise<{ user: AdminUser; temporaryPassword?: string }>;
  onUpdate: (uid: string, updates: Partial<AdminUser>) => Promise<void>;
}

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  isOpen,
  mode,
  user,
  isLastActiveFullAdmin,
  onClose,
  onCreate,
  onUpdate,
}) => {
  const { locale } = useI18n();

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('staff');
  const [status, setStatus] = useState<AdminUserStatus>('active');
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomPassword, setUseCustomPassword] = useState(false);

  // Status & credentials display states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    role: AdminRole;
    displayName: string;
    password?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset form on open/change
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setCopied(false);
      if (mode === 'edit' && user) {
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setRole(user.role || 'staff');
        setStatus((user.status as AdminUserStatus) || 'active');
        setCreatedCredentials(null);
      } else {
        setDisplayName('');
        setEmail('');
        setRole('staff');
        setStatus('active');
        setCustomPassword('');
        setUseCustomPassword(false);
        setCreatedCredentials(null);
      }
    }
  }, [isOpen, mode, user]);

  if (!isOpen) return null;

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const textToCopy = `DAHR Atelier Admin Access:
Email: ${createdCredentials.email}
Temporary Password: ${createdCredentials.password}
Role: ${createdCredentials.role}
Portal: ${window.location.origin}/#admin-login`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'create') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage(
          locale === 'ar'
            ? 'يرجى إدخال عنوان بريد إلكتروني صالح.'
            : 'Please provide a valid email address.'
        );
        return;
      }

      if (useCustomPassword && customPassword.length < 6) {
        setErrorMessage(
          locale === 'ar'
            ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.'
            : 'Password must be at least 6 characters.'
        );
        return;
      }

      setIsLoading(true);
      try {
        const result = await onCreate({
          email: email.trim().toLowerCase(),
          displayName: displayName.trim() || email.split('@')[0],
          role,
          password: useCustomPassword ? customPassword.trim() : undefined,
        });

        setCreatedCredentials({
          email: result.user.email,
          role: result.user.role,
          displayName: result.user.displayName,
          password: result.temporaryPassword,
        });
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to create user account.');
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'edit' && user) {
      // Validate last active fullAdmin protection
      if (isLastActiveFullAdmin && role === 'staff') {
        setErrorMessage(
          locale === 'ar'
            ? 'لا يمكن تحويل الحساب الإداري النشط الوحيد إلى موظف عادي.'
            : 'Cannot demote the last remaining active fullAdmin to staff.'
        );
        return;
      }

      if (isLastActiveFullAdmin && status === 'deactivated') {
        setErrorMessage(
          locale === 'ar'
            ? 'لا يمكن تعطيل الحساب الإداري النشط الوحيد لتجنب إغلاق لوحة التحكم.'
            : 'Cannot deactivate the last remaining active fullAdmin account.'
        );
        return;
      }

      setIsLoading(true);
      try {
        await onUpdate(user.uid, {
          displayName: displayName.trim() || user.email.split('@')[0],
          role,
          status,
        });
        onClose();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to update user.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-user-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-start flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F5F1EA] border-b border-[#E4DED3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#A98860]" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A] block">
                {locale === 'ar' ? 'إدارة الوصول والأدوار' : 'RBAC Access Control'}
              </span>
              <h2 id="admin-user-modal-title" className="text-base font-serif font-medium text-[#1C1A17]">
                {createdCredentials
                  ? locale === 'ar'
                    ? 'تم إنشاء الحساب بنجاح'
                    : 'Account Created Successfully'
                  : mode === 'create'
                  ? locale === 'ar'
                    ? 'دعوة / إنشاء مستخدم إداري جديد'
                    : 'Create New Atelier Administrator'
                  : locale === 'ar'
                  ? `تعديل صلاحيات (${user?.email})`
                  : `Modify Privileges (${user?.email})`}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-[#7A736A] hover:text-[#1C1A17] cursor-pointer rounded-[2px] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {createdCredentials ? (
          /* ================================================================= */
          /* SUCCESS CREDENTIALS HANDOFF VIEW                                 */
          /* ================================================================= */
          <div className="p-5 sm:p-6 flex flex-col gap-4 text-xs font-mono text-[#1C1A17]">
            <div className="p-3 bg-[#4B5D46]/10 border border-[#4B5D46]/30 text-[#4B5D46] rounded-[2px] flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>
                {locale === 'ar'
                  ? 'تم إنشاء حساب المستخدم في نظام المصادقة وتوثيق صلاحياته في قاعدة البيانات.'
                  : 'Firebase Auth account provisioned and synchronized with adminUsers collection.'}
              </span>
            </div>

            <p className="text-[11px] text-[#7A736A]">
              {locale === 'ar'
                ? 'انسخ بيانات الاعتماد التالية وشاركها بأمان مع الموظف الجديد للوصول إلى لوحة التحكم:'
                : 'Share these initial credentials securely with the administrator to log into the DAHR Atelier control center:'}
            </p>

            <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
                <span className="text-[#7A736A]">{locale === 'ar' ? 'الاسم:' : 'Display Name:'}</span>
                <span className="font-bold text-[#1C1A17]">{createdCredentials.displayName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
                <span className="text-[#7A736A]">{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</span>
                <span className="font-bold text-[#1C1A17] select-all">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
                <span className="text-[#7A736A]">{locale === 'ar' ? 'الصلاحية الممنوحة:' : 'Assigned Role:'}</span>
                <RoleBadge role={createdCredentials.role} />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[#7A736A]">{locale === 'ar' ? 'كلمة المرور المؤقتة:' : 'Temporary Password:'}</span>
                <span className="font-bold font-mono text-[#A98860] bg-[#1C1A17] px-2 py-0.5 rounded-[2px] select-all">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 h-9 px-4 bg-[#1C1A17] hover:bg-[#A98860] text-[#FAF7F2] rounded-[2px] font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4B5D46]" />
                    <span>{locale === 'ar' ? 'تم نسخ البيانات!' : 'Credentials Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'نسخ بيانات الدخول' : 'Copy Login Credentials'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] font-mono text-xs transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إغلاق' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* FORM VIEW (CREATE / EDIT)                                         */
          /* ================================================================= */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-4 text-xs font-mono">
            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 text-[#8C3B2E] rounded-[2px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Last active fullAdmin warning */}
            {mode === 'edit' && isLastActiveFullAdmin && (
              <div className="p-3 bg-[#A9772F]/10 border border-[#A9772F]/30 text-[#A9772F] rounded-[2px] flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {locale === 'ar'
                    ? 'هذا الحساب هو الحساب الإداري الرئيسي والوحيد النشط بصلاحية fullAdmin. لا يمكن تحويله إلى موظف أو تعطيله.'
                    : 'This is the only remaining active fullAdmin account. Demotion and deactivation are locked to prevent administrative lockout.'}
                </span>
              </div>
            )}

            {/* Display Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#1C1A17] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#A98860]" />
                <span>{locale === 'ar' ? 'الاسم الكامل / المستعار' : 'Full Name or Alias'}</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={locale === 'ar' ? 'مثال: ليلى الخطيب' : 'e.g. Layla Al-Khatib'}
                className="h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
              />
            </div>

            {/* Email Address Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#1C1A17] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A98860]" />
                <span>{locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</span>
                <span className="text-[#8C3B2E]">*</span>
              </label>
              <input
                type="email"
                required
                disabled={mode === 'edit'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={locale === 'ar' ? 'staff@dahratelier.com' : 'staff@dahratelier.com'}
                className={`h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860] ${
                  mode === 'edit' ? 'opacity-60 cursor-not-allowed bg-[#F5F1EA]' : ''
                }`}
              />
            </div>

            {/* Role Selection Segmented Cards */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-[#1C1A17] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#A98860]" />
                  <span>{locale === 'ar' ? 'مستوى الصلاحية الإدارية' : 'Administrative Role'}</span>
                  <span className="text-[#8C3B2E]">*</span>
                </span>
                <RoleBadge role={role} />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Staff Role Card */}
                <div
                  onClick={() => {
                    if (!(mode === 'edit' && isLastActiveFullAdmin)) {
                      setRole('staff');
                    }
                  }}
                  className={`p-3 rounded-[2px] border transition-all select-none ${
                    mode === 'edit' && isLastActiveFullAdmin
                      ? 'opacity-40 cursor-not-allowed border-[#E4DED3] bg-[#F5F1EA]'
                      : 'cursor-pointer'
                  } ${
                    role === 'staff'
                      ? 'bg-[#A98860]/10 border-[#A98860] shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E4DED3] hover:border-[#A98860]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1A17]">staff</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#A98860]/20 text-[#A98860] rounded-[2px]">
                      {locale === 'ar' ? 'كتالوج ومجلة' : 'Catalog & CMS'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#7A736A] mt-1">
                    {locale === 'ar'
                      ? 'إدارة المنتجات والمقالات التحريرية فقط. محظور من الطلبات والمستخدمين.'
                      : 'Can create and edit Products and Journal essays. Restricted from Orders and Users.'}
                  </p>
                </div>

                {/* fullAdmin Role Card */}
                <div
                  onClick={() => setRole('fullAdmin')}
                  className={`p-3 rounded-[2px] border transition-all cursor-pointer select-none ${
                    role === 'fullAdmin'
                      ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17] shadow-xs'
                      : 'bg-[#FAF7F2] border-[#E4DED3] hover:border-[#1C1A17]/50 text-[#1C1A17]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">fullAdmin</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-[2px] ${
                        role === 'fullAdmin'
                          ? 'bg-[#A98860] text-[#1C1A17] font-bold'
                          : 'bg-[#1C1A17]/10 text-[#1C1A17]'
                      }`}
                    >
                      {locale === 'ar' ? 'صلاحية كاملة' : 'Unrestricted'}
                    </span>
                  </div>
                  <p
                    className={`text-[10px] mt-1 ${
                      role === 'fullAdmin' ? 'text-[#9B9488]' : 'text-[#7A736A]'
                    }`}
                  >
                    {locale === 'ar'
                      ? 'صلاحية مطلقة على جميع الوحدات الأربع: الكتالوج، الطلبات، المجلة، والمستخدمين.'
                      : 'Full authority across all four modules: Catalog, Orders, Journal, and Users.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Selector (In Edit Mode) */}
            {mode === 'edit' && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#E4DED3]">
                <label className="text-[11px] font-medium text-[#1C1A17] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {status === 'active' ? (
                      <UserCheck className="w-3.5 h-3.5 text-[#4B5D46]" />
                    ) : (
                      <UserX className="w-3.5 h-3.5 text-[#8C3B2E]" />
                    )}
                    <span>{locale === 'ar' ? 'حالة الحساب' : 'Account Status'}</span>
                  </span>
                  <StatusPill status={status} />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`h-9 px-3 border rounded-[2px] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      status === 'active'
                        ? 'bg-[#4B5D46] text-[#FAF7F2] border-[#4B5D46]'
                        : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:text-[#1C1A17]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'نشط (Active)' : 'Active'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLastActiveFullAdmin}
                    onClick={() => {
                      if (!isLastActiveFullAdmin) {
                        setStatus('deactivated');
                      }
                    }}
                    className={`h-9 px-3 border rounded-[2px] font-mono text-xs flex items-center justify-center gap-1.5 transition-colors ${
                      isLastActiveFullAdmin
                        ? 'opacity-40 cursor-not-allowed bg-[#F5F1EA] text-[#7A736A] border-[#E4DED3]'
                        : status === 'deactivated'
                        ? 'bg-[#8C3B2E] text-[#FAF7F2] border-[#8C3B2E] cursor-pointer'
                        : 'bg-[#FAF7F2] text-[#7A736A] border-[#E4DED3] hover:text-[#8C3B2E] cursor-pointer'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'معطل (Deactivated)' : 'Deactivated'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Password Configuration (In Create Mode) */}
            {mode === 'create' && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E4DED3]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-[#1C1A17] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#A98860]" />
                    <span>{locale === 'ar' ? 'كلمة المرور' : 'Password Setup'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomPassword(!useCustomPassword)}
                    className="text-[10px] text-[#A98860] hover:underline cursor-pointer"
                  >
                    {useCustomPassword
                      ? locale === 'ar'
                        ? 'توليد تلقائي'
                        : 'Auto-generate secure'
                      : locale === 'ar'
                      ? 'تعيين مخصص'
                      : 'Set custom password'}
                  </button>
                </div>

                {useCustomPassword ? (
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder={locale === 'ar' ? 'كلمة مرور مؤقتة (6 أحرف فأكثر)' : 'Temporary password (6+ chars)'}
                    className="h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
                  />
                ) : (
                  <div className="p-2.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center gap-2 text-[11px] text-[#7A736A]">
                    <Sparkles className="w-3.5 h-3.5 text-[#A98860] shrink-0" />
                    <span>
                      {locale === 'ar'
                        ? 'سيتم توليد كلمة مرور مؤقتة آمنة وعرضها للنسخ فور الإنشاء.'
                        : 'A strong temporary password will be generated and shown after creation.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E4DED3]">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="h-9 px-4 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] font-mono text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="h-9 px-5 bg-[#1C1A17] hover:bg-[#A98860] text-[#FAF7F2] rounded-[2px] font-mono text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#FAF7F2] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLoading
                    ? locale === 'ar'
                      ? 'جارٍ الحفظ...'
                      : 'Processing...'
                    : mode === 'create'
                    ? locale === 'ar'
                      ? 'إنشاء الحساب'
                      : 'Create Account'
                    : locale === 'ar'
                    ? 'حفظ التغييرات'
                    : 'Save Changes'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
