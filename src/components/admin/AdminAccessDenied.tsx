import React from 'react';
import { ShieldAlert, ArrowLeft, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { RouteId } from '../../types';
import { RoleBadge } from './RoleBadge';

export interface AdminAccessDeniedProps {
  requiredRole: 'fullAdmin';
  attemptedModule: string;
  onRouteChange: (route: RouteId) => void;
}

export const AdminAccessDenied: React.FC<AdminAccessDeniedProps> = ({
  requiredRole,
  attemptedModule,
  onRouteChange,
}) => {
  const { locale, direction } = useI18n();
  const { role, user } = useAuth();
  const isRTL = direction === 'rtl';

  return (
    <div id="admin-access-denied" className="p-8 max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 flex items-center justify-center text-[#8C3B2E]">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C3B2E]">
          {locale === 'ar' ? 'خطأ صلاحيات الوصول (403)' : 'Access Permission Denied (HTTP 403)'}
        </span>
        <h1 className="text-2xl font-serif text-[#1C1A17] mt-1">
          {locale === 'ar' ? 'الوصول إلى هذه الوحدة مقيد' : 'Module Restricted to fullAdmin'}
        </h1>
        <p className="text-xs font-mono text-[#7A736A] mt-2">
          {locale === 'ar'
            ? `تتطلب وحدة "${attemptedModule}" صلاحية مدير كامل (fullAdmin). دورك الحالي هو: `
            : `The "${attemptedModule}" module requires fullAdmin privileges. Your current role is: `}
          <span className="font-bold text-[#1C1A17] uppercase">{role || 'unknown'}</span>.
        </p>
      </div>

      {/* Role Comparison Card */}
      <div className="w-full bg-[#FAF7F2] border border-[#E4DED3] p-4 rounded-[2px] text-start flex flex-col gap-3 text-xs font-mono">
        <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
          <span className="text-[#7A736A]">{locale === 'ar' ? 'المستخدم الحالي:' : 'Authenticated User:'}</span>
          <span className="font-bold text-[#1C1A17]">{user?.email}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
          <span className="text-[#7A736A]">{locale === 'ar' ? 'مستوى الصلاحية الحالي:' : 'Assigned Role:'}</span>
          <RoleBadge role={role || 'staff'} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#7A736A]">{locale === 'ar' ? 'الصلاحية المطلوبة:' : 'Required Role:'}</span>
          <span className="px-2 py-0.5 bg-[#8C3B2E]/10 text-[#8C3B2E] border border-[#8C3B2E]/30 rounded-[2px] font-bold">
            fullAdmin
          </span>
        </div>
      </div>

      <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] text-start w-full rounded-[2px] text-[11px] font-mono text-[#7A736A] flex items-start gap-2">
        <Lock className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
        <span>
          {locale === 'ar'
            ? 'تلتزم لوحة تحكم DAHR بحماية البيانات والامتثال لسياسات الأمان الخاصة بالطلبات المالية وإدارة المستخدمين.'
            : 'DAHR Atelier enforces strict defense-in-depth role boundaries at both UI route and Firestore security rules levels.'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onRouteChange('admin-dashboard')}
          className="py-2 px-4 bg-[#1C1A17] text-[#FAF7F2] hover:bg-[#2E2B26] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
        >
          {locale === 'ar' ? 'العودة للوحة الإدارة' : 'Return to Dashboard'}
        </button>

        <button
          type="button"
          onClick={() => onRouteChange('admin-products')}
          className="py-2 px-4 bg-[#FAF7F2] border border-[#E4DED3] hover:bg-[#E4DED3] text-[#1C1A17] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
        >
          {locale === 'ar' ? 'إدارة كتالوج المنتجات' : 'Go to Products'}
        </button>
      </div>
    </div>
  );
};
