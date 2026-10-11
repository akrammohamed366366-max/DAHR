import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Share2,
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Facebook,
  Instagram,
  MessageCircle,
  MessagesSquare,
  Send,
  Users,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../i18n/context';
import { useSettings, formatSocialUrl } from '../../../context/SettingsContext';
import { AdminAccessDenied } from '../AdminAccessDenied';
import { ContactSettings, BrandingSettings } from '../../../types/backend';
import { RouteId } from '../../../types';
import { FormFieldGroup } from '../FormFieldGroup';
import { MissingLanguageModal, MissingFieldItem, getLanguageFieldStatus } from '../MissingLanguageModal';
import { AdminLanguageToggle } from '../AdminLanguageToggle';

export interface AdminSettingsViewProps {
  onRouteChange?: (route: RouteId) => void;
}

type TabType = 'contact' | 'branding';

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({ onRouteChange }) => {
  const { isFullAdmin, role } = useAuth();
  const { locale } = useI18n();
  const {
    contactSettings,
    brandingSettings,
    loading: settingsLoading,
    saveContactSettings,
    saveBrandingSettings,
    uploadLogo,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<TabType>('contact');

  // Contact Form State
  const [contactForm, setContactForm] = useState<ContactSettings>({
    facebookPage: '',
    facebookGroup: '',
    instagram: '',
    whatsappNumber: '',
    whatsappGroup: '',
    telegramChannel: '',
    telegramGroup: '',
  });

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState<BrandingSettings>({
    logoImageUrl: '',
    siteName: { en: 'DAHR', ar: 'DAHR' },
  });

  // UI state
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [brandingErrors, setBrandingErrors] = useState<Record<string, string>>({});
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [activeMissingFields, setActiveMissingFields] = useState<MissingFieldItem[]>([]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when settings load from Firestore
  useEffect(() => {
    if (!settingsLoading) {
      setContactForm({
        facebookPage: contactSettings.facebookPage || '',
        facebookGroup: contactSettings.facebookGroup || '',
        instagram: contactSettings.instagram || '',
        whatsappNumber: contactSettings.whatsappNumber || '',
        whatsappGroup: contactSettings.whatsappGroup || '',
        telegramChannel: contactSettings.telegramChannel || '',
        telegramGroup: contactSettings.telegramGroup || '',
      });

      setBrandingForm({
        logoImageUrl: brandingSettings.logoImageUrl || '',
        siteName: {
          en: brandingSettings.siteName?.en || 'DAHR',
          ar: brandingSettings.siteName?.ar || 'DAHR',
        },
      });
    }
  }, [settingsLoading, contactSettings, brandingSettings]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Route-level and component-level RBAC enforcement
  if (!isFullAdmin) {
    return (
      <AdminAccessDenied
        requiredRole="fullAdmin"
        attemptedModule={locale === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
        onRouteChange={onRouteChange || (() => {})}
      />
    );
  }

  // Basic validation helpers
  const validateContactInputs = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate WhatsApp number if non-empty
    if (contactForm.whatsappNumber && contactForm.whatsappNumber.trim()) {
      const val = contactForm.whatsappNumber.trim();
      const isPhoneLike = /^[+0-9\s()-]{5,25}$/.test(val);
      const isUrlLike = val.startsWith('http://') || val.startsWith('https://');
      if (!isPhoneLike && !isUrlLike) {
        errors.whatsappNumber =
          locale === 'ar'
            ? 'يرجى إدخال رقم هاتف دولي صالح أو رابط wa.me'
            : 'Please enter a valid international phone number or wa.me URL.';
      }
    }

    setContactErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContactInputs()) {
      showNotification(
        locale === 'ar' ? 'يرجى تصحيح أخطاء الإدخال قبل الحفظ.' : 'Please fix input validation errors.',
        'error'
      );
      return;
    }

    setIsSavingContact(true);
    try {
      await saveContactSettings(contactForm);
      showNotification(
        locale === 'ar'
          ? 'تم حفظ روابط التواصل الاجتماعي بنجاح وتحديث المتجر مباشرة.'
          : 'Contact & social channels saved successfully. Storefront updated live.'
      );
    } catch (err: any) {
      console.error('Failed to save contact settings:', err);
      showNotification(
        err.message || (locale === 'ar' ? 'فشل حفظ الإعدادات.' : 'Failed to save settings.'),
        'error'
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  const getMissingLanguageFields = (): MissingFieldItem[] => {
    const missing: MissingFieldItem[] = [];

    if (!brandingForm.siteName.en.trim()) {
      missing.push({
        id: 'input-site-name-en',
        fieldLabel: locale === 'ar' ? 'اسم المتجر (الإنجليزية)' : 'Site Name (English)',
        language: 'en',
        tabId: 'branding',
        tabLabel: locale === 'ar' ? 'هوية العلامة والشعار' : 'Brand Identity',
        status: brandingForm.siteName.ar.trim() ? 'pending' : 'required',
      });
    }

    if (!brandingForm.siteName.ar.trim()) {
      missing.push({
        id: 'input-site-name-ar',
        fieldLabel: locale === 'ar' ? 'اسم المتجر (العربية)' : 'Site Name (Arabic)',
        language: 'ar',
        tabId: 'branding',
        tabLabel: locale === 'ar' ? 'هوية العلامة والشعار' : 'Brand Identity',
        status: brandingForm.siteName.en.trim() ? 'pending' : 'required',
      });
    }

    return missing;
  };

  const handleNavigateToMissingField = (item: MissingFieldItem) => {
    setMissingModalOpen(false);
    setActiveTab('branding');
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingLanguageFields = getMissingLanguageFields();
    if (missingLanguageFields.length > 0) {
      setActiveMissingFields(missingLanguageFields);
      setMissingModalOpen(true);

      const errors: Record<string, string> = {};
      if (!brandingForm.siteName.en.trim()) {
        errors['siteName.en'] =
          locale === 'ar'
            ? 'اسم المتجر بالإنجليزية مطلوب'
            : 'English site name is required.';
      }
      if (!brandingForm.siteName.ar.trim()) {
        errors['siteName.ar'] =
          locale === 'ar'
            ? 'اسم المتجر بالعربية مطلوب'
            : 'Arabic site name is required.';
      }
      setBrandingErrors(errors);
      return;
    }

    setBrandingErrors({});
    setIsSavingBranding(true);
    try {
      await saveBrandingSettings({
        ...brandingForm,
        siteName: {
          en: brandingForm.siteName.en.trim(),
          ar: brandingForm.siteName.ar.trim(),
        },
      });
      showNotification(
        locale === 'ar'
          ? 'تم حفظ الهوية البصرية واسم المتجر بنجاح.'
          : 'Brand identity and site name updated successfully.'
      );
    } catch (err: any) {
      console.error('Failed to save branding settings:', err);
      showNotification(
        err.message || (locale === 'ar' ? 'فشل حفظ الهوية.' : 'Failed to save branding.'),
        'error'
      );
    } finally {
      setIsSavingBranding(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      showNotification(
        locale === 'ar' ? 'يرجى اختيار ملف صورة صالح (PNG, JPG, SVG, WebP).' : 'Please upload a valid image file.',
        'error'
      );
      return;
    }

    setIsUploadingLogo(true);
    try {
      const downloadUrl = await uploadLogo(file);
      setBrandingForm((prev) => ({
        ...prev,
        logoImageUrl: downloadUrl,
      }));
      showNotification(
        locale === 'ar' ? 'تم رفع الشعار بنجاح. انقر على حفظ لاعتماده.' : 'Logo uploaded successfully. Click Save to apply.'
      );
    } catch (err: any) {
      console.error('Failed to upload logo:', err);
      showNotification(
        err.message || (locale === 'ar' ? 'فشل رفع الشعار.' : 'Failed to upload logo image.'),
        'error'
      );
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setBrandingForm((prev) => ({
      ...prev,
      logoImageUrl: '',
    }));
  };

  return (
    <div id="admin-settings-view" className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4DED3]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
              {locale === 'ar' ? 'إدارة النظام' : 'System Administration'}
            </span>
            <span
              id="admin-settings-fulladmin-badge"
              className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#A98860]/10 text-[#A98860] border border-[#A98860]/30 rounded-[2px]"
            >
              FULLADMIN
            </span>
            <span
              id="admin-settings-firestore-badge"
              className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-[#4B5D46]/10 text-[#4B5D46] border border-[#4B5D46]/30 rounded-[2px] inline-flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4B5D46]" />
              LIVE FIRESTORE
            </span>
            <AdminLanguageToggle id="admin-settings-language-toggle" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-[#1C1A17] flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#A98860]" />
            <span>{locale === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}</span>
          </h1>
          <p className="text-xs text-[#7A736A] font-body mt-1">
            {locale === 'ar'
              ? 'إدارة الروابط الرسمية للتواصل الاجتماعي وهوية العلامة التجارية (الشعار والاسم الثنائي) المباشرة على المتجر.'
              : 'Manage live contact/social channels and brand identity without code deployments.'}
          </p>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            className={`px-3.5 py-2 text-xs font-mono rounded-[2px] flex items-center gap-2 shadow-sm animate-in fade-in ${
              toastMessage.type === 'success'
                ? 'bg-[#4B5D46] text-[#FAF7F2]'
                : 'bg-[#8C3B2E] text-[#FAF7F2]'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E4DED3] bg-[#FAF7F2] rounded-t-[2px] px-2 pt-2 gap-2">
        <button
          type="button"
          id="tab-contact-settings"
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'contact'
              ? 'border-[#1C1A17] text-[#1C1A17] font-semibold bg-[#F5F1EA]'
              : 'border-transparent text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#F5F1EA]/60'
          }`}
        >
          <Share2 className="w-4 h-4 text-[#A98860]" />
          <span>{locale === 'ar' ? 'التواصل والشبكات الاجتماعية' : 'Contact & Social'}</span>
        </button>

        <button
          type="button"
          id="tab-branding-settings"
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2.5 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'branding'
              ? 'border-[#1C1A17] text-[#1C1A17] font-semibold bg-[#F5F1EA]'
              : 'border-transparent text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#F5F1EA]/60'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#A98860]" />
          <span>{locale === 'ar' ? 'هوية العلامة والشعار' : 'Brand Identity'}</span>
        </button>
      </div>

      {/* TAB 1: CONTACT & SOCIAL FORM */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-[#FAF7F2] border border-[#E4DED3] p-5 sm:p-7 space-y-6">
          {/* Section guidance */}
          <div className="p-3.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5C564E] font-body space-y-1">
              <p className="font-semibold text-[#1C1A17]">
                {locale === 'ar' ? 'قاعدة عرض قنوات التواصل في المتجر:' : 'Storefront Display Logic:'}
              </p>
              <p>
                {locale === 'ar'
                  ? 'أي حقل يُترك فارغاً لن يظهر في تذييل المتجر نهائياً. سيتم فقط إظهار الأيقونات للقنوات المكتملة وربطها بروابط مباشرة وصحيحة.'
                  : 'Leaving a field empty means that channel simply will not be shown anywhere on the storefront footer. Only filled-in channels render an icon linking directly.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Facebook Page */}
            <div>
              <label
                htmlFor="input-facebook-page"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'صفحة فيسبوك الرسمية (Facebook Page)' : 'Facebook Page URL'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <Facebook className="w-4 h-4" />
                </div>
                <input
                  id="input-facebook-page"
                  type="text"
                  value={contactForm.facebookPage || ''}
                  onChange={(e) => setContactForm({ ...contactForm, facebookPage: e.target.value })}
                  placeholder="https://facebook.com/dahr.atelier"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. رابط الصفحة أو اسمها.' : 'Optional. Page URL or full path.'}
              </p>
            </div>

            {/* 2. Facebook Group */}
            <div>
              <label
                htmlFor="input-facebook-group"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'مجموعة أو مجتمع فيسبوك (Facebook Group)' : 'Facebook Group URL'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <Users className="w-4 h-4" />
                </div>
                <input
                  id="input-facebook-group"
                  type="text"
                  value={contactForm.facebookGroup || ''}
                  onChange={(e) => setContactForm({ ...contactForm, facebookGroup: e.target.value })}
                  placeholder="https://facebook.com/groups/dahr.parfums"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. رابط مجتمع فيسبوك.' : 'Optional. Direct link to Facebook group.'}
              </p>
            </div>

            {/* 3. Instagram */}
            <div>
              <label
                htmlFor="input-instagram"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'حساب إنستغرام (Instagram)' : 'Instagram Handle / URL'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <Instagram className="w-4 h-4" />
                </div>
                <input
                  id="input-instagram"
                  type="text"
                  value={contactForm.instagram || ''}
                  onChange={(e) => setContactForm({ ...contactForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/dahr or @dahr"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. اسم المستخدم مع @ أو الرابط الكامل.' : 'Optional. Handle with @ or complete URL.'}
              </p>
            </div>

            {/* 4. WhatsApp Number */}
            <div>
              <label
                htmlFor="input-whatsapp-number"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'رقم واتساب المباشر (WhatsApp Number)' : 'WhatsApp Number (Direct)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
                  id="input-whatsapp-number"
                  type="text"
                  value={contactForm.whatsappNumber || ''}
                  onChange={(e) => {
                    setContactForm({ ...contactForm, whatsappNumber: e.target.value });
                    if (contactErrors.whatsappNumber) {
                      setContactErrors({ ...contactErrors, whatsappNumber: '' });
                    }
                  }}
                  placeholder="+966501234567 or wa.me/966501234567"
                  className={`w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border rounded-[2px] text-xs font-mono text-[#1C1A17] outline-none transition-colors ${
                    contactErrors.whatsappNumber
                      ? 'border-[#8C3B2E] ring-1 ring-[#8C3B2E]'
                      : 'border-[#E4DED3] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860]'
                  }`}
                />
              </div>
              {contactErrors.whatsappNumber ? (
                <p className="text-[10px] font-mono text-[#8C3B2E] mt-1">{contactErrors.whatsappNumber}</p>
              ) : (
                <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                  {locale === 'ar'
                    ? 'رقم هاتف دولي أو رابط. سيتم إنشاء رابط wa.me تلقائياً في التذييل.'
                    : 'International phone or URL. Automatically formatted as wa.me link.'}
                </p>
              )}
            </div>

            {/* 5. WhatsApp Group */}
            <div>
              <label
                htmlFor="input-whatsapp-group"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'مجموعة أو مجتمع واتساب (WhatsApp Group)' : 'WhatsApp Group Link'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <MessagesSquare className="w-4 h-4" />
                </div>
                <input
                  id="input-whatsapp-group"
                  type="text"
                  value={contactForm.whatsappGroup || ''}
                  onChange={(e) => setContactForm({ ...contactForm, whatsappGroup: e.target.value })}
                  placeholder="https://chat.whatsapp.com/inviteCode"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. رابط الدعوة لمجموعة واتساب.' : 'Optional. WhatsApp chat invite link.'}
              </p>
            </div>

            {/* 6. Telegram Channel */}
            <div>
              <label
                htmlFor="input-telegram-channel"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'قناة تيليجرام الرسمية (Telegram Channel)' : 'Telegram Channel'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <Send className="w-4 h-4" />
                </div>
                <input
                  id="input-telegram-channel"
                  type="text"
                  value={contactForm.telegramChannel || ''}
                  onChange={(e) => setContactForm({ ...contactForm, telegramChannel: e.target.value })}
                  placeholder="https://t.me/dahrofficial or @dahrofficial"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. اسم القناة مع @ أو رابط t.me.' : 'Optional. Channel name or t.me URL.'}
              </p>
            </div>

            {/* 7. Telegram Group */}
            <div>
              <label
                htmlFor="input-telegram-group"
                className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1.5"
              >
                {locale === 'ar' ? 'مجموعة نقاش تيليجرام (Telegram Group)' : 'Telegram Community Group'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-[#7A736A]">
                  <Send className="w-4 h-4" />
                </div>
                <input
                  id="input-telegram-group"
                  type="text"
                  value={contactForm.telegramGroup || ''}
                  onChange={(e) => setContactForm({ ...contactForm, telegramGroup: e.target.value })}
                  placeholder="https://t.me/dahrcommunity"
                  className="w-full ps-9 pe-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] font-mono text-[#7A736A] mt-1">
                {locale === 'ar' ? 'اختياري. رابط مجموعة تيليجرام التفاعلية.' : 'Optional. Discussion group link.'}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-[#7A736A]">
              {contactSettings.updatedAt && (
                <span>
                  {locale === 'ar' ? 'آخر تحديث: ' : 'Last synchronized: '}
                  {new Date(contactSettings.updatedAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setContactForm({
                    facebookPage: contactSettings.facebookPage || '',
                    facebookGroup: contactSettings.facebookGroup || '',
                    instagram: contactSettings.instagram || '',
                    whatsappNumber: contactSettings.whatsappNumber || '',
                    whatsappGroup: contactSettings.whatsappGroup || '',
                    telegramChannel: contactSettings.telegramChannel || '',
                    telegramGroup: contactSettings.telegramGroup || '',
                  });
                  setContactErrors({});
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#F5F1EA] hover:bg-[#E4DED3] text-[#1C1A17] text-xs font-mono uppercase tracking-wider rounded-[2px] border border-[#E4DED3] transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إعادة تعيين' : 'Reset'}
              </button>

              <button
                type="submit"
                id="btn-save-contact-settings"
                disabled={isSavingContact}
                className="flex-1 sm:flex-none px-5 py-2 bg-[#1C1A17] hover:bg-[#2A2723] text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingContact ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A98860]" />
                    <span>{locale === 'ar' ? 'حفظ روابط التواصل' : 'Save Contact Channels'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: BRAND IDENTITY FORM */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveBranding} className="bg-[#FAF7F2] border border-[#E4DED3] p-5 sm:p-7 space-y-8">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DED3]">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#1C1A17]">
                  {locale === 'ar' ? 'شعار العلامة التجارية (Storefront Logo)' : 'Brand Visual Mark / Logo'}
                </h3>
                <p className="text-xs text-[#7A736A] font-body mt-0.5">
                  {locale === 'ar'
                    ? 'رفع شعار مرئي لاستبدال وورد مارك DAHR في ترويسة المتجر وتذييله وتطبيق الجوال.'
                    : 'Upload a logo asset to replace or accompany the typographic wordmark in the header.'}
                </p>
              </div>

              {brandingForm.logoImageUrl && (
                <span className="text-[10px] font-mono text-[#4B5D46] bg-[#4B5D46]/10 px-2 py-0.5 rounded-[2px] border border-[#4B5D46]/30">
                  {locale === 'ar' ? 'شعار مخصص نشط' : 'Custom Logo Active'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Live Preview Box */}
              <div className="md:col-span-1 flex flex-col gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'المعاينة الحية للشعار:' : 'Live Logo Preview:'}
                </span>

                <div
                  id="logo-preview-box"
                  className="h-32 bg-[#FAF7F2] border-2 border-dashed border-[#D5CEBF] rounded-[2px] flex items-center justify-center p-4 relative overflow-hidden group shadow-inner"
                >
                  {brandingForm.logoImageUrl ? (
                    <img
                      src={brandingForm.logoImageUrl}
                      alt={
                        locale === 'ar'
                          ? `معاينة شعار ${brandingForm.siteName.ar || 'DAHR'}`
                          : `Live preview of ${brandingForm.siteName.en || 'DAHR'} brand logo`
                      }
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center gap-1.5 text-[#7A736A]">
                      <span className="font-serif text-2xl tracking-[0.25em] font-light text-[#1C1A17]">
                        {brandingForm.siteName.en || 'DAHR'}
                      </span>
                      <span className="text-[10px] font-mono">
                        {locale === 'ar' ? '(وورد مارك خطي افتراضي)' : '(Default Typographic Wordmark)'}
                      </span>
                    </div>
                  )}

                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-[#1C1A17]/60 flex flex-col items-center justify-center text-[#FAF7F2] gap-1 backdrop-blur-xs">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#A98860]" />
                      <span className="text-[10px] font-mono uppercase">
                        {locale === 'ar' ? 'جارٍ رفع الصورة...' : 'Uploading Asset...'}
                      </span>
                    </div>
                  )}
                </div>

                {brandingForm.logoImageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 text-xs font-mono text-[#8C3B2E] hover:bg-[#8C3B2E]/10 rounded-[2px] transition-colors cursor-pointer border border-[#8C3B2E]/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{locale === 'ar' ? 'إزالة الشعار واستعادة الوورد مارك' : 'Remove Custom Logo'}</span>
                  </button>
                )}
              </div>

              {/* Upload Dropzone & URL Input */}
              <div className="md:col-span-2 space-y-4">
                {/* File Upload Trigger */}
                <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-start">
                    <p className="text-xs font-mono font-semibold uppercase text-[#1C1A17]">
                      {locale === 'ar' ? 'رفع ملف صورة جديد' : 'Upload New Asset File'}
                    </p>
                    <p className="text-[11px] text-[#7A736A] font-body">
                      {locale === 'ar'
                        ? 'يدعم PNG شفاف، SVG، أو JPG عالية الدقة تحت /branding/logo في Storage.'
                        : 'Recommended: Transparent PNG or SVG (height 40-60px) stored in Firebase Storage.'}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    id="logo-file-input"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    aria-label={locale === 'ar' ? 'اختر ملف الشعار' : 'Select brand logo file'}
                  />

                  <button
                    type="button"
                    id="btn-upload-logo"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-4 py-2 bg-[#1C1A17] hover:bg-[#2A2723] text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#A98860]" />
                    <span>{locale === 'ar' ? 'اختيار ملف...' : 'Select File...'}</span>
                  </button>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label
                    htmlFor="input-logo-url"
                    className="block text-xs font-mono uppercase tracking-wider text-[#1C1A17] mb-1"
                  >
                    {locale === 'ar' ? 'أو أدخل رابط الشعار المباشر (URL)' : 'Or specify direct Image URL'}
                  </label>
                  <input
                    id="input-logo-url"
                    type="url"
                    value={brandingForm.logoImageUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoImageUrl: e.target.value })}
                    placeholder="https://storage.googleapis.com/... or /branding/logo.png"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bilingual Site Name Section */}
          <div className="space-y-4 pt-6 border-t border-[#E4DED3]">
            <div className="pb-2 border-b border-[#E4DED3]">
              <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-[#1C1A17]">
                {locale === 'ar' ? 'اسم المتجر الثنائي (Bilingual Site Name)' : 'Bilingual Site Name'}
              </h3>
              <p className="text-xs text-[#7A736A] font-body mt-0.5">
                {locale === 'ar'
                  ? 'يُستخدم كعنوان المتجر العام وتسمية إمكانية الوصول وعنوان الترويسة والتذييل.'
                  : 'Used across browser title tags, accessibility landmarks, header and footer wordmarks.'}
              </p>
            </div>

            {/* Crucial Guidelines Inline Note */}
            <div className="p-3 bg-[#A98860]/10 border border-[#A98860]/30 rounded-[2px] flex items-start gap-3">
              <Info className="w-4 h-4 text-[#A98860] shrink-0 mt-0.5" />
              <div className="text-xs text-[#5C564E] font-body">
                <span className="font-semibold text-[#1C1A17] block mb-0.5">
                  {locale === 'ar' ? 'توجيه الهوية البصرية لدار (Brand Identity Note):' : 'Brand Guidelines Specification:'}
                </span>
                <p>
                  <strong className="text-[#1C1A17]">"DAHR"</strong>{' '}
                  {locale === 'ar'
                    ? 'يجب أن تظل بالحروف اللاتينية في كلا اللغتين (العربية والإنجليزية) طبقاً للدليل الإرشادي للعلامة الفاخرة.'
                    : 'should remain in Latin characters in both languages per brand guidelines.'}
                  <span className="text-[#7A736A] ms-1">
                    {locale === 'ar' ? '(ملاحظة إرشادية فقط)' : '(Guideline note only, not a save-blocking restriction)'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* English Site Name */}
              <FormFieldGroup
                label={locale === 'ar' ? 'اسم المتجر بالإنجليزية (English Name)' : 'Site Name (English)'}
                htmlFor="input-site-name-en"
                required
                statusBadge={getLanguageFieldStatus(brandingForm.siteName.en, brandingForm.siteName.ar)}
                errorText={brandingErrors['siteName.en']}
                helperText={
                  locale === 'ar'
                    ? 'يُستخدم في ترويسة المتجر بالإنجليزية وعناوين المتصفح والإشعارات'
                    : 'Displayed in English storefront header, browser title, and notifications'
                }
              >
                <div className="relative">
                  <input
                    id="input-site-name-en"
                    type="text"
                    dir="ltr"
                    value={brandingForm.siteName.en}
                    onChange={(e) => {
                      setBrandingForm({
                        ...brandingForm,
                        siteName: { ...brandingForm.siteName, en: e.target.value },
                      });
                      if (brandingErrors['siteName.en']) {
                        setBrandingErrors((prev) => ({ ...prev, 'siteName.en': '' }));
                      }
                    }}
                    required
                    placeholder="DAHR"
                    className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                  />
                  <span className="absolute end-2 top-2.5 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                    EN
                  </span>
                </div>
              </FormFieldGroup>

              {/* Arabic Site Name */}
              <FormFieldGroup
                label={locale === 'ar' ? 'اسم المتجر بالعربية (Arabic Name)' : 'Site Name (Arabic)'}
                htmlFor="input-site-name-ar"
                required
                statusBadge={getLanguageFieldStatus(brandingForm.siteName.ar, brandingForm.siteName.en)}
                errorText={brandingErrors['siteName.ar']}
                helperText={
                  locale === 'ar'
                    ? 'يُستخدم في ترويسة المتجر باللغة العربية وعناوين المتصفح والمراسلات'
                    : 'Displayed in Arabic storefront header, browser title, and notifications'
                }
              >
                <div className="relative">
                  <input
                    id="input-site-name-ar"
                    type="text"
                    dir="rtl"
                    value={brandingForm.siteName.ar}
                    onChange={(e) => {
                      setBrandingForm({
                        ...brandingForm,
                        siteName: { ...brandingForm.siteName, ar: e.target.value },
                      });
                      if (brandingErrors['siteName.ar']) {
                        setBrandingErrors((prev) => ({ ...prev, 'siteName.ar': '' }));
                      }
                    }}
                    required
                    placeholder="دار"
                    className="w-full h-10 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:border-[#A98860] focus:ring-1 focus:ring-[#A98860] outline-none transition-colors"
                  />
                  <span className="absolute start-2 top-2.5 px-1.5 py-0.5 bg-[#E4DED3]/60 text-[10px] font-mono text-[#7A736A] rounded-[1px]">
                    AR
                  </span>
                </div>
              </FormFieldGroup>
            </div>
          </div>

          {/* Branding Actions */}
          <div className="pt-4 border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-[#7A736A]">
              {brandingSettings.updatedAt && (
                <span>
                  {locale === 'ar' ? 'آخر تحديث للهوية: ' : 'Branding updated: '}
                  {new Date(brandingSettings.updatedAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setBrandingForm({
                    logoImageUrl: brandingSettings.logoImageUrl || '',
                    siteName: {
                      en: brandingSettings.siteName?.en || 'DAHR',
                      ar: brandingSettings.siteName?.ar || 'DAHR',
                    },
                  });
                }}
                className="flex-1 sm:flex-none px-4 py-2 bg-[#F5F1EA] hover:bg-[#E4DED3] text-[#1C1A17] text-xs font-mono uppercase tracking-wider rounded-[2px] border border-[#E4DED3] transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إلغاء التعديلات' : 'Reset'}
              </button>

              <button
                type="submit"
                id="btn-save-branding-settings"
                disabled={isSavingBranding || isUploadingLogo}
                className="flex-1 sm:flex-none px-5 py-2 bg-[#1C1A17] hover:bg-[#2A2723] text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingBranding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#A98860]" />
                    <span>{locale === 'ar' ? 'حفظ الهوية واسم المتجر' : 'Save Brand Identity'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Missing Language Fields Alert Modal */}
      <MissingLanguageModal
        isOpen={missingModalOpen}
        onClose={() => setMissingModalOpen(false)}
        missingFields={activeMissingFields}
        onNavigateToField={handleNavigateToMissingField}
      />
    </div>
  );
};
