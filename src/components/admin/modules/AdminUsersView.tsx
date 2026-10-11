import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Power,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  UserCheck,
  UserX,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/context';
import { AdminRole, AdminUser, AdminUserStatus } from '../../../types/backend';
import { adminUsersApi } from '../../../api/adminUsersApi';
import { RoleBadge } from '../RoleBadge';
import { StatusPill } from '../StatusPill';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { AdminUserModal } from './AdminUserModal';
import { AdminAccessDenied } from '../AdminAccessDenied';
import { RouteId } from '../../../types';

export interface AdminUsersViewProps {
  onRouteChange?: (route: RouteId) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({ onRouteChange }) => {
  const { user: currentAuthUser, isFullAdmin } = useAuth();

  const { locale } = useI18n();

  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AdminUserStatus>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {},
  });

  // Copied email feedback
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const loadUsers = async (quiet = false, forceRefresh = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const data = await adminUsersApi.listAdminUsers(forceRefresh);
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load admin users list:', err);
      setErrorMessage(
        err.message ||
          (locale === 'ar'
            ? 'فشل في تحميل قائمة المستخدمين الإداريين.'
            : 'Failed to retrieve administrative users.')
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFullAdmin) {
      loadUsers();
    }
  }, [isFullAdmin]);

  // Compute active fullAdmins to prevent accidental lockouts
  const activeFullAdmins = useMemo(() => {
    return users.filter(
      (u) =>
        u.role === 'fullAdmin' &&
        (u.status === 'active' || !u.status || u.status === undefined)
    );
  }, [users]);

  const isLastActiveFullAdmin = (targetUser: AdminUser) => {
    return (
      targetUser.role === 'fullAdmin' &&
      (targetUser.status === 'active' || !targetUser.status) &&
      activeFullAdmins.length <= 1
    );
  };

  // Filtered & Searched Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.uid && u.uid.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      const userStatus = (u.status as AdminUserStatus) || 'active';
      const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // If user is not fullAdmin, strictly guard this view
  if (!isFullAdmin) {
    return (
      <AdminAccessDenied
        requiredRole="fullAdmin"
        title={locale === 'ar' ? 'وحدة إدارة المستخدمين مقيدة' : 'Admin & Staff Access Restricted'}
        description={
          locale === 'ar'
            ? 'تتطلب هذه الوحدة صلاحيات fullAdmin الكاملة. بصفتك موظفاً (staff)، يمكنك الوصول إلى إدارة المنتجات والمجلة فقط.'
            : 'Managing administrative accounts and role permissions requires fullAdmin privileges. Staff accounts may only manage Products and Journal entries.'
        }
      />
    );
  }

  // Action handlers
  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCreateUser = async (params: {
    email: string;
    displayName: string;
    role: AdminRole;
    password?: string;
  }) => {
    const result = await adminUsersApi.createAdminUserWithAuth(params);
    await loadUsers(true);
    showToast(
      locale === 'ar'
        ? `تم إنشاء الحساب الإداري بنجاح (${result.user.email})`
        : `Admin account provisioned for ${result.user.email}`
    );
    return result;
  };

  const handleUpdateUser = async (uid: string, updates: Partial<AdminUser>) => {
    await adminUsersApi.updateAdminUser(uid, updates);
    await loadUsers(true);
    showToast(
      locale === 'ar'
        ? 'تم تحديث بيانات وصلاحيات المستخدم بنجاح.'
        : 'User privileges updated successfully.'
    );
  };

  const handleToggleStatus = (targetUser: AdminUser) => {
    const currentStatus = (targetUser.status as AdminUserStatus) || 'active';
    const nextStatus: AdminUserStatus = currentStatus === 'active' ? 'deactivated' : 'active';

    if (currentStatus === 'active' && isLastActiveFullAdmin(targetUser)) {
      alert(
        locale === 'ar'
          ? 'لا يمكن تعطيل الحساب الإداري النشط الوحيد بصلاحية fullAdmin لتجنب إغلاق لوحة التحكم.'
          : 'Cannot deactivate the last remaining active fullAdmin account.'
      );
      return;
    }

    const isSelf = currentAuthUser?.uid === targetUser.uid;

    setConfirmDialog({
      isOpen: true,
      title:
        nextStatus === 'deactivated'
          ? locale === 'ar'
            ? `تعطيل حساب (${targetUser.email})`
            : `Deactivate Access (${targetUser.email})`
          : locale === 'ar'
          ? `إعادة تنشيط حساب (${targetUser.email})`
          : `Reactivate Access (${targetUser.email})`,
      description:
        nextStatus === 'deactivated'
          ? isSelf
            ? locale === 'ar'
              ? 'تنبيه: أنت على وشك تعطيل حسابك الحالي! ستفقد حق الوصول فوراً إلى لوحة التحكم.'
              : 'Warning: You are about to deactivate your own account. You will immediately lose administrative access.'
            : locale === 'ar'
            ? 'سيتم حرمان هذا المستخدم فوراً من الوصول إلى لوحة تحكم DAHR وإلغاء صلاحياته النشطة.'
            : 'This user will immediately be locked out of the DAHR administrative portal upon their next action.'
          : locale === 'ar'
          ? 'سيتمكن هذا المستخدم من تسجيل الدخول واستئناف مهامه الإدارية وفق صلاحياته المحددة.'
          : 'This user will regain full access to their designated administrative modules upon signing in.',
      confirmLabel:
        nextStatus === 'deactivated'
          ? locale === 'ar'
            ? 'تعطيل الحساب'
            : 'Deactivate Account'
          : locale === 'ar'
          ? 'تنشيط الحساب'
          : 'Reactivate Account',
      isDestructive: nextStatus === 'deactivated',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminUsersApi.setAdminUserStatus(targetUser.uid, nextStatus);
          await loadUsers(true);
          showToast(
            nextStatus === 'deactivated'
              ? locale === 'ar'
                ? `تم تعطيل حساب (${targetUser.email}) بنجاح.`
                : `Account ${targetUser.email} has been deactivated.`
              : locale === 'ar'
              ? `تم تنشيط حساب (${targetUser.email}) بنجاح.`
              : `Account ${targetUser.email} has been reactivated.`
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: any) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          alert(err.message || 'Action failed.');
        }
      },
    });
  };

  const handleToggleRole = (targetUser: AdminUser) => {
    const nextRole: AdminRole = targetUser.role === 'fullAdmin' ? 'staff' : 'fullAdmin';

    if (targetUser.role === 'fullAdmin' && isLastActiveFullAdmin(targetUser)) {
      alert(
        locale === 'ar'
          ? 'لا يمكن تحويل الحساب الإداري النشط الوحيد بصلاحية fullAdmin إلى موظف عادي.'
          : 'Cannot demote the last remaining active fullAdmin account to staff.'
      );
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title:
        nextRole === 'fullAdmin'
          ? locale === 'ar'
            ? `ترقية (${targetUser.email}) إلى fullAdmin`
            : `Promote to fullAdmin (${targetUser.email})`
          : locale === 'ar'
          ? `تغيير صلاحية (${targetUser.email}) إلى staff`
          : `Demote to staff (${targetUser.email})`,
      description:
        nextRole === 'fullAdmin'
          ? locale === 'ar'
            ? 'سيتم منح هذا المستخدم حق الوصول الكامل لجميع أقسام لوحة التحكم بما فيها إدارة الطلبات وحسابات المستخدمين.'
            : 'This user will gain full authority across all administrative modules, including Orders & Ledger and User Management.'
          : locale === 'ar'
            ? 'سيقتصر وصول هذا المستخدم على إدارة المنتجات ومقالات المجلة فقط، وسيتم حجب الطلبات والمستخدمين عنه.'
            : 'This user will be restricted to Products and Journal entries only. Access to Orders and User Management will be revoked.',
      confirmLabel:
        nextRole === 'fullAdmin'
          ? locale === 'ar'
            ? 'تأكيد الترقية'
            : 'Confirm Promotion'
          : locale === 'ar'
          ? 'تأكيد التغيير'
          : 'Confirm Role Change',
      isDestructive: nextRole === 'staff',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminUsersApi.updateAdminUserRole(targetUser.uid, nextRole);
          await loadUsers(true);
          showToast(
            locale === 'ar'
              ? `تم تحديث صلاحية (${targetUser.email}) إلى ${nextRole}.`
              : `Role for ${targetUser.email} updated to ${nextRole}.`
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: any) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          alert(err.message || 'Role change failed.');
        }
      },
    });
  };

  const handleDeleteUser = (targetUser: AdminUser) => {
    if (isLastActiveFullAdmin(targetUser)) {
      alert(
        locale === 'ar'
          ? 'لا يمكن حذف الحساب الإداري النشط الوحيد بصلاحية fullAdmin.'
          : 'Cannot delete the last remaining active fullAdmin account.'
      );
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title:
        locale === 'ar'
          ? `حذف حساب إداري (${targetUser.email})`
          : `Remove Admin User (${targetUser.email})`,
      description:
        locale === 'ar'
          ? 'سيتم حذف سجل المستخدم من قاعدة بيانات adminUsers. لن يتمكن هذا الحساب من الوصول إلى لوحة الإدارة.'
          : 'Permanently remove this user record from adminUsers. The user will lose administrative access completely.',
      confirmLabel: locale === 'ar' ? 'حذف نهائي' : 'Delete Account',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await adminUsersApi.deleteAdminUser(targetUser.uid);
          await loadUsers(true);
          showToast(
            locale === 'ar'
              ? `تم حذف الحساب الإداري (${targetUser.email}) بنجاح.`
              : `Admin record for ${targetUser.email} removed.`
          );
          setConfirmDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: any) {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          alert(err.message || 'Delete failed.');
        }
      },
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div id="admin-users-view" className="flex flex-col gap-5 text-start">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#1C1A17] text-[#FAF7F2] border border-[#A98860]/40 rounded-[2px] shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#A98860] shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DED3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#7A736A]">
              {locale === 'ar' ? 'لوحة التحكم الإدارية' : 'Admin Management'}
            </span>
            <span className="text-[#E4DED3]">/</span>
            <RoleBadge role="fullAdmin" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-medium text-[#1C1A17] tracking-tight">
            {locale === 'ar' ? 'إدارة المستخدمين والصلاحيات' : 'User Access & Roles'}
          </h1>
          <p className="text-xs text-[#7A736A] font-body mt-1">
            {locale === 'ar'
              ? 'إنشاء وتعديل وإلغاء صلاحيات الحسابات الإدارية والموظفين في أتيليه DAHR.'
              : 'Provision, inspect, and govern fullAdmin and staff roles across the atelier.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadUsers(true, true)}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh users list"
            className="h-9 px-3 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A98860]' : ''}`}
            />
            <span className="hidden sm:inline">{locale === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="h-9 px-4 bg-[#1C1A17] hover:bg-[#A98860] text-[#FAF7F2] rounded-[2px] font-mono text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-[#A98860]" />
            <span>{locale === 'ar' ? 'إضافة مستخدم جديد' : 'New Admin / Staff'}</span>
          </button>
        </div>
      </div>

      {/* RBAC Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* FullAdmin Summary */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex items-start gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#A98860]" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C1A17]">fullAdmin</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#1C1A17]/5 rounded text-[#1C1A17]">
                {users.filter((u) => u.role === 'fullAdmin').length} {locale === 'ar' ? 'حسابات' : 'accounts'}
              </span>
            </div>
            <p className="text-[11px] text-[#7A736A] mt-1 font-body">
              {locale === 'ar'
                ? 'وصول كامل: المنتجات، الطلبات، المجلة، وإدارة المستخدمين.'
                : 'Unrestricted access to Catalog, Orders, Journal, and Users.'}
            </p>
          </div>
        </div>

        {/* Staff Summary */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex items-start gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#A98860]/20 text-[#A98860] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#A98860]" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C1A17]">staff</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[#A98860]/15 text-[#A98860] rounded">
                {users.filter((u) => u.role === 'staff').length} {locale === 'ar' ? 'حسابات' : 'accounts'}
              </span>
            </div>
            <p className="text-[11px] text-[#7A736A] mt-1 font-body">
              {locale === 'ar'
                ? 'إدارة محتوى الكتالوج والمقالات فقط. محجوب من الطلبات والمستخدمين.'
                : 'Restricted to Products and Journal. Blocked from Orders & Users.'}
            </p>
          </div>
        </div>

        {/* Safety Lock Status */}
        <div className="p-3.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-start gap-3">
          <div className="w-8 h-8 rounded-[2px] bg-[#FAF7F2] border border-[#E4DED3] text-[#4B5D46] flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-[#4B5D46]" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C1A17]">
                {locale === 'ar' ? 'حماية الحساب الإداري' : 'Anti-Lockout Lock'}
              </span>
              <span className="font-mono text-[10px] text-[#4B5D46] font-medium">
                {activeFullAdmins.length} {locale === 'ar' ? 'نشط' : 'Active'}
              </span>
            </div>
            <p className="text-[11px] text-[#7A736A] mt-1 font-body">
              {activeFullAdmins.length <= 1
                ? locale === 'ar'
                  ? 'مفعل: لا يمكن تعطيل أو خفض رتبة الحساب الإداري النشط الوحيد.'
                  : 'Active: Last fullAdmin is protected from deactivation and demotion.'
                : locale === 'ar'
                ? 'يوجد أكثر من حساب إداري كامل نشط.'
                : 'Multiple active fullAdmin accounts registered.'}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A736A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === 'ar'
                ? 'بحث بالاسم، البريد الإلكتروني، أو الـ UID...'
                : 'Search by display name, email, or UID...'
            }
            className="w-full h-9 pl-9 pr-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] font-mono text-xs text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] font-mono text-xs text-[#1C1A17] focus:outline-none focus:border-[#A98860] cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">{locale === 'ar' ? 'كل الصلاحيات' : 'All Roles'}</option>
            <option value="fullAdmin">fullAdmin</option>
            <option value="staff">staff</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] font-mono text-xs text-[#1C1A17] focus:outline-none focus:border-[#A98860] cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">{locale === 'ar' ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="active">{locale === 'ar' ? 'نشط (Active)' : 'Active'}</option>
            <option value="deactivated">
              {locale === 'ar' ? 'معطل (Deactivated)' : 'Deactivated'}
            </option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 text-[#8C3B2E] rounded-[2px] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => loadUsers()}
            className="underline hover:text-[#1C1A17] cursor-pointer ml-4"
          >
            {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-12 text-center bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-[#1C1A17] border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-[#7A736A]">
            {locale === 'ar'
              ? 'جارٍ استرداد سجلات المستخدمين والصلاحيات...'
              : 'Retrieving administrative accounts and permissions...'}
          </span>
        </div>
      ) : filteredUsers.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F5F1EA] flex items-center justify-center text-[#7A736A]">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base text-[#1C1A17]">
            {locale === 'ar' ? 'لم يتم العثور على مستخدمين' : 'No matching users found'}
          </h3>
          <p className="text-xs text-[#7A736A] font-body max-w-sm">
            {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
              ? locale === 'ar'
                ? 'جرّب تعديل معايير البحث أو خيارات التصفية أعلاه.'
                : 'Try adjusting your search query or filter criteria.'
              : locale === 'ar'
              ? 'لم يتم تسجيل أي مستخدمين إداريين إضافيين بعد.'
              : 'No administrative users created yet.'}
          </p>
          {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="mt-2 text-xs font-mono text-[#A98860] hover:underline cursor-pointer"
            >
              {locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
            </button>
          )}
        </div>
      ) : (
        /* =================================================================== */
        /* DATA TABLE (DESKTOP) + ADAPTIVE CARDS (MOBILE)                      */
        /* =================================================================== */
        <div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E4DED3] bg-[#F5F1EA] text-[#7A736A] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">{locale === 'ar' ? 'المستخدم' : 'User'}</th>
                  <th className="py-3 px-4 font-medium">{locale === 'ar' ? 'الصلاحية' : 'Role'}</th>
                  <th className="py-3 px-4 font-medium">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 font-medium">{locale === 'ar' ? 'تاريخ الإنشاء' : 'Created'}</th>
                  <th className="py-3 px-4 font-medium text-right">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DED3] font-mono">
                {filteredUsers.map((item) => {
                  const isCurrent = currentAuthUser?.uid === item.uid;
                  const isLastAdmin = isLastActiveFullAdmin(item);
                  const userStatus = (item.status as AdminUserStatus) || 'active';
                  const initials = (item.displayName || item.email || 'AU')
                    .substring(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={item.uid}
                      className={`hover:bg-[#F5F1EA]/60 transition-colors ${
                        userStatus === 'deactivated' ? 'opacity-65 bg-[#F5F1EA]/30' : ''
                      }`}
                    >
                      {/* User Info Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[2px] bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center font-bold text-[11px] shrink-0 border border-[#A98860]/40">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#1C1A17] truncate font-body">
                                {item.displayName || item.email.split('@')[0]}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 text-[9px] bg-[#A98860]/20 text-[#A98860] border border-[#A98860]/40 rounded-[2px] font-mono font-medium">
                                  {locale === 'ar' ? 'حسابك الحالي' : 'You'}
                                </span>
                              )}
                              {isLastAdmin && (
                                <span
                                  title="Last active fullAdmin - locked"
                                  className="px-1.5 py-0.2 text-[9px] bg-[#1C1A17] text-[#FAF7F2] rounded-[2px] font-mono"
                                >
                                  {locale === 'ar' ? 'رئيسي' : 'Primary'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#7A736A] mt-0.5">
                              <span className="truncate">{item.email}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.email)}
                                title="Copy Email"
                                className="hover:text-[#1C1A17] cursor-pointer"
                              >
                                {copiedEmail === item.email ? (
                                  <Check className="w-3 h-3 text-[#4B5D46]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-[#7A736A]/70 truncate max-w-[180px]">
                              UID: {item.uid}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <RoleBadge role={item.role} />
                          <button
                            type="button"
                            onClick={() => handleToggleRole(item)}
                            disabled={isLastAdmin && item.role === 'fullAdmin'}
                            title={
                              isLastAdmin && item.role === 'fullAdmin'
                                ? 'Cannot demote the last remaining active fullAdmin'
                                : `Switch to ${item.role === 'fullAdmin' ? 'staff' : 'fullAdmin'}`
                            }
                            className="text-[10px] text-[#7A736A] hover:text-[#1C1A17] hover:underline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {item.role === 'fullAdmin' ? '→ staff' : '→ fullAdmin'}
                          </button>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StatusPill status={userStatus} />
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            disabled={isLastAdmin && userStatus === 'active'}
                            title={
                              isLastAdmin && userStatus === 'active'
                                ? 'Cannot deactivate the last remaining active fullAdmin'
                                : userStatus === 'active'
                                ? 'Deactivate account'
                                : 'Reactivate account'
                            }
                            className={`p-1 rounded hover:bg-[#E4DED3] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              userStatus === 'active'
                                ? 'text-[#8C3B2E] hover:text-[#8C3B2E]'
                                : 'text-[#4B5D46] hover:text-[#4B5D46]'
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-[#7A736A]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#7A736A]" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title={locale === 'ar' ? 'تعديل الصلاحيات والاسم' : 'Edit Privileges'}
                            className="p-1.5 text-[#1C1A17] hover:bg-[#E4DED3] rounded-[2px] transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(item)}
                            disabled={isLastAdmin}
                            title={
                              isLastAdmin
                                ? 'Cannot delete the last remaining active fullAdmin'
                                : locale === 'ar'
                                ? 'حذف الحساب'
                                : 'Delete User'
                            }
                            className="p-1.5 text-[#8C3B2E] hover:bg-[#8C3B2E]/10 rounded-[2px] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredUsers.map((item) => {
              const isCurrent = currentAuthUser?.uid === item.uid;
              const isLastAdmin = isLastActiveFullAdmin(item);
              const userStatus = (item.status as AdminUserStatus) || 'active';
              const initials = (item.displayName || item.email || 'AU')
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={item.uid}
                  className={`p-4 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-3 font-mono text-xs ${
                    userStatus === 'deactivated' ? 'opacity-70 bg-[#F5F1EA]' : ''
                  }`}
                >
                  {/* Top: Avatar, Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-[2px] bg-[#1C1A17] text-[#FAF7F2] flex items-center justify-center font-bold text-xs shrink-0 border border-[#A98860]/40">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#1C1A17] font-body text-sm">
                            {item.displayName || item.email.split('@')[0]}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-[#A98860]/20 text-[#A98860] border border-[#A98860]/40 rounded-[2px] font-mono">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#7A736A] truncate">{item.email}</span>
                      </div>
                    </div>

                    <StatusPill status={userStatus} />
                  </div>

                  {/* Badges & Date */}
                  <div className="flex items-center justify-between border-y border-[#E4DED3] py-2 text-[11px]">
                    <div className="flex items-center gap-2">
                      <RoleBadge role={item.role} />
                      {isLastAdmin && (
                        <span className="text-[9px] px-1 bg-[#1C1A17] text-[#FAF7F2] rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-[#7A736A] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(item)}
                        disabled={isLastAdmin && item.role === 'fullAdmin'}
                        className="h-8 px-2.5 bg-[#F5F1EA] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-[10px] transition-colors disabled:opacity-30"
                      >
                        {item.role === 'fullAdmin' ? 'Make staff' : 'Make fullAdmin'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        disabled={isLastAdmin && userStatus === 'active'}
                        className={`h-8 px-2.5 border rounded-[2px] text-[10px] flex items-center gap-1 transition-colors disabled:opacity-30 ${
                          userStatus === 'active'
                            ? 'bg-[#8C3B2E]/10 text-[#8C3B2E] border-[#8C3B2E]/30 hover:bg-[#8C3B2E] hover:text-[#FAF7F2]'
                            : 'bg-[#4B5D46]/10 text-[#4B5D46] border-[#4B5D46]/30 hover:bg-[#4B5D46] hover:text-[#FAF7F2]'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {userStatus === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        aria-label="Edit User"
                        className="w-8 h-8 flex items-center justify-center bg-[#FAF7F2] hover:bg-[#E4DED3] border border-[#E4DED3] text-[#1C1A17] rounded-[2px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(item)}
                        disabled={isLastAdmin}
                        aria-label="Delete User"
                        className="w-8 h-8 flex items-center justify-center bg-[#8C3B2E]/10 hover:bg-[#8C3B2E] text-[#8C3B2E] hover:text-[#FAF7F2] border border-[#8C3B2E]/20 rounded-[2px] disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer count indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#7A736A] px-1 pt-3">
            <span>
              {locale === 'ar' ? 'إجمالي الحسابات المسجلة:' : 'Total administrative accounts:'}{' '}
              <strong className="text-[#1C1A17]">{users.length}</strong> (
              {filteredUsers.length} {locale === 'ar' ? 'معروض' : 'showing'})
            </span>
            <span>
              {locale === 'ar' ? 'الحسابات النشطة:' : 'Active accounts:'}{' '}
              <strong className="text-[#4B5D46]">
                {users.filter((u) => u.status === 'active' || !u.status).length}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      <AdminUserModal
        isOpen={isModalOpen}
        mode={modalMode}
        user={selectedUser}
        isLastActiveFullAdmin={selectedUser ? isLastActiveFullAdmin(selectedUser) : false}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
