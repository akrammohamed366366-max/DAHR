import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  Undo,
  Redo,
  CornerDownRight,
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  CheckCircle,
  SlidersHorizontal,
  Filter,
  Bell,
  Info,
  Lock,
  Plus,
  Minus,
  Check,
  Calendar,
  DollarSign,
  Hash,
  Clock,
  Compass,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { LocaleSwitcher } from '../ui/LocaleSwitcher';
import {
  DirectionalIcon,
  DirectionalArrowRight,
  DirectionalChevronRight,
  DirectionalExternalArrow,
} from '../ui/DirectionalIcon';
import {
  formatPrice,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatList,
  toEasternArabicNumerals,
} from '../../i18n/formatters';
import { ICON_MIRRORING_RULES } from '../../utils/iconRules';
import { Button } from './Button';
import { Badge } from './Badge';
import { Input } from './Input';
import { Select } from './Select';
import { QuantityStepper } from './QuantityStepper';

export const BilingualAuditSection: React.FC = () => {
  const { locale, direction, setLocale, t } = useI18n();

  // Formatting Lab State
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [useEasternNumerals, setUseEasternNumerals] = useState<boolean>(false);
  const [testAmount, setTestAmount] = useState<number>(320);

  // Tab & Focus Order Sequence Demo State
  const [focusedStep, setFocusedStep] = useState<number | null>(null);
  const [demoFormStep1, setDemoFormStep1] = useState<string>('');
  const [demoFormStep2, setDemoFormStep2] = useState<string>('oud-01');
  const [demoFormStep3, setDemoFormStep3] = useState<number>(1);

  const sampleFragranceNotes = locale === 'ar'
    ? ['خشب العود المعتق', 'الورد الطائفي', 'العنبر الرمادي', 'الزعفران النقي']
    : ['Aged Cambodian Oud', 'Taif Rose', 'Grey Amber', 'Pure Saffron'];

  const directionalIconsList = [
    { name: 'ArrowRight / Forward', icon: ArrowRight, desc: 'Flow along reading axis' },
    { name: 'ChevronRight / Deep Link', icon: ChevronRight, desc: 'Hierarchy drill-down' },
    { name: 'ArrowUpRight / External', icon: ArrowUpRight, desc: 'External link pointer' },
    { name: 'Undo / Back', icon: Undo, desc: 'Temporal flow back' },
    { name: 'CornerDownRight / Sub-tree', icon: CornerDownRight, desc: 'Nested hierarchy line' },
  ];

  const nonDirectionalIconsList = [
    { name: 'ShoppingBag', icon: ShoppingBag, desc: 'Physical commerce object' },
    { name: 'Search', icon: Search, desc: 'Global magnifier standard' },
    { name: 'Heart', icon: Heart, desc: 'Symmetrical sentiment marker' },
    { name: 'User', icon: User, desc: 'Symmetrical identity metaphor' },
    { name: 'X / Close', icon: X, desc: 'Universal dialog dismissal' },
    { name: 'CheckCircle', icon: CheckCircle, desc: 'Validation & status feedback' },
    { name: 'SlidersHorizontal', icon: SlidersHorizontal, desc: 'Filter adjustment tool' },
    { name: 'Lock / Security', icon: Lock, desc: 'Symmetrical security symbol' },
  ];

  return (
    <section id="bilingual-infrastructure-audit" className="flex flex-col gap-10 text-start">
      {/* Section Title Header */}
      <div className="flex flex-col gap-2 border-b border-[#E4DED3] pb-4">
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">
            {locale === 'ar' ? 'البنية التحتية المحصنة' : 'HARDENED INFRASTRUCTURE'}
          </Badge>
          <Badge variant="outline" size="sm">
            {direction.toUpperCase()} FLOW
          </Badge>
        </div>
        <h2 className="font-display text-[24px] sm:text-[30px] text-[#1C1A17] font-normal">
          {t('storefrontShowcase.bilingualAuditSection')}
        </h2>
        <p className="text-[14px] text-[#7A736A] font-body max-w-3xl leading-relaxed">
          {t('storefrontShowcase.bilingualAuditSubtitle')}
        </p>
      </div>

      {/* 1. Language Switcher & Document Direction Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[#A98860]">
            <Compass className="w-4 h-4" />
            <span className="text-[11px] font-mono uppercase tracking-widest font-semibold">
              {locale === 'ar' ? 'محدد اللغة السري والاتجاه' : 'Discreet Language Control'}
            </span>
          </div>
          <p className="text-[13px] text-[#7A736A] leading-relaxed">
            {locale === 'ar'
              ? 'مفتاح تبديل لغة هادئ وخالٍ تماماً من الأعلام ("EN / AR") يغير فورياً اتجاه الوثيقة (dir="rtl" أو dir="ltr") ولغة التنسيق.'
              : 'Small, quiet-luxury text switcher ("EN / AR" — no flags) controlling global document direction (dir="rtl" / dir="ltr") and typography.'}
          </p>

          <div className="pt-2 flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase text-[#7A736A]">Header Variant (Minimal):</span>
            <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center justify-between">
              <span className="text-[12px] font-mono text-[#1C1A17]">Active:</span>
              <LocaleSwitcher id="audit-locale-switcher-min" variant="minimal" size="md" />
            </div>

            <span className="text-[11px] font-mono uppercase text-[#7A736A] mt-2">Segmented Variant:</span>
            <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center justify-between">
              <span className="text-[12px] font-mono text-[#1C1A17]">Toggle:</span>
              <LocaleSwitcher id="audit-locale-switcher-seg" variant="segmented" size="sm" />
            </div>
          </div>
        </div>

        {/* Live Document Direction Telemetry */}
        <div className="lg:col-span-2 flex flex-col justify-between p-5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] gap-4 font-mono text-[12px]">
          <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3">
            <span className="text-[#7A736A] uppercase">Active DOM Parameters:</span>
            <Badge variant={direction === 'rtl' ? 'accent' : 'default'} size="sm">
              dir=&quot;{direction}&quot; / lang=&quot;{locale}&quot;
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px]">
              <span className="text-[10px] text-[#7A736A] block">LOCALE</span>
              <span className="text-[14px] text-[#1C1A17] font-bold uppercase">{locale}</span>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px]">
              <span className="text-[10px] text-[#7A736A] block">DIRECTION</span>
              <span className="text-[14px] text-[#1C1A17] font-bold uppercase">{direction}</span>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px]">
              <span className="text-[10px] text-[#7A736A] block">NUMERALS</span>
              <span className="text-[14px] text-[#1C1A17] font-bold">
                {locale === 'ar' ? (useEasternNumerals ? '٠-٩ (عربي)' : '0-9 (عالمي)') : '0-9 (Western)'}
              </span>
            </div>
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px]">
              <span className="text-[10px] text-[#7A736A] block">BRAND NAME</span>
              <span className="text-[14px] text-[#1C1A17] font-serif font-bold tracking-widest">DAHR</span>
            </div>
          </div>

          <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] text-[11px] text-[#7A736A] leading-relaxed">
            <span className="text-[#1C1A17] font-semibold">Rule Enforcement: </span>
            {locale === 'ar'
              ? 'يتم عرض اسم العلامة دائماً بالأحرف اللاتينية "DAHR" دون ترجمة أو تعريب في كلا اللغتين، وتنعكس محاذاة النص والبدء من اليمين بشكل طبيعي دون تشويه لخطوط النسخ.'
              : 'Brand name DAHR is immutable in Latin script. Arabic layout preserves zero letter-spacing on cursive Arabic glyphs with full logical CSS (start/end).'}
          </div>
        </div>
      </div>

      {/* 2. Icon Mirroring Semantics Matrix */}
      <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.iconMirroringSection')}
            </h3>
            <span className="text-[11px] font-mono text-[#A98860] uppercase">
              SEMANTIC RULES AUDIT
            </span>
          </div>
          <p className="text-[13px] text-[#7A736A]">
            {t('storefrontShowcase.iconMirroringSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Directional Icons (FLIP IN RTL) */}
          <div className="flex flex-col gap-3 p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
              <span className="text-[12px] font-mono uppercase text-[#1C1A17] font-bold">
                Directional Icons (Auto-Flip in RTL)
              </span>
              <Badge variant="accent" size="sm">
                {direction === 'rtl' ? 'FLIPPED ⟲' : 'STANDARD ➔'}
              </Badge>
            </div>
            <p className="text-[12px] text-[#7A736A]">
              These icons follow the reading direction axis. Next points Left in Arabic (RTL); Previous points Right in Arabic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {directionalIconsList.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px]"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono font-medium text-[#1C1A17]">{item.name}</span>
                      <span className="text-[10px] text-[#7A736A]">{item.desc}</span>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center bg-[#F5F1EA] border border-[#E4DED3] text-[#1C1A17]">
                      {/* DirectionalIcon automatically applies [dir=rtl]:-scale-x-100 */}
                      <DirectionalIcon icon={IconComponent} className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Non-Directional Icons (NEVER FLIP IN RTL) */}
          <div className="flex flex-col gap-3 p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
            <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
              <span className="text-[12px] font-mono uppercase text-[#1C1A17] font-bold">
                Non-Directional Icons (Never Flipped)
              </span>
              <Badge variant="neutral" size="sm">
                FIXED ANCHOR
              </Badge>
            </div>
            <p className="text-[12px] text-[#7A736A]">
              Physical objects (Bag), search magnifiers, symmetric dialogue controls (Close X, Plus/Minus), and security icons are never inverted.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {nonDirectionalIconsList.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.name}
                    className="flex flex-col items-center justify-center p-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[1px] text-center gap-1.5"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-[#F5F1EA] border border-[#E4DED3] text-[#1C1A17]">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[#1C1A17] truncate max-w-full">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Locale-Aware Formatting Lab */}
      <div className="flex flex-col gap-6 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.formattingLabSection')}
            </h3>
            <span className="text-[11px] font-mono text-[#A98860] uppercase">
              INTL UTILITIES
            </span>
          </div>
          <p className="text-[13px] text-[#7A736A]">
            {t('storefrontShowcase.formattingLabSubtitle')}
          </p>
        </div>

        {/* Controls Bar for Testing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-[#7A736A]">
              {locale === 'ar' ? 'عملة العرض:' : 'Currency:'}
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-[#FAF7F2] border border-[#E4DED3] text-[#1C1A17] text-[13px] p-2 rounded-[2px] focus:outline-none focus:border-[#A98860] font-mono"
            >
              <option value="USD">USD ($)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="SAR">SAR (ر.س)</option>
              <option value="QAR">QAR (ر.ق)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase text-[#7A736A]">
              {locale === 'ar' ? 'قيمة الاختبار ($):' : 'Sample Amount ($):'}
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(Number(e.target.value))}
              className="bg-[#FAF7F2] border border-[#E4DED3] text-[#1C1A17] text-[13px] p-2 rounded-[2px] focus:outline-none focus:border-[#A98860] font-mono"
            />
          </div>

          <div className="flex flex-col justify-end">
            {locale === 'ar' ? (
              <button
                type="button"
                onClick={() => setUseEasternNumerals(!useEasternNumerals)}
                className="py-2.5 px-3 text-[11px] font-mono uppercase bg-[#FAF7F2] border border-[#E4DED3] text-[#1C1A17] hover:border-[#1C1A17] rounded-[2px] cursor-pointer transition-colors"
              >
                الأرقام: {useEasternNumerals ? 'المشرقية (٣٢٠)' : 'اللاتينية (320)'}
              </button>
            ) : (
              <div className="p-2 text-[11px] font-mono text-[#7A736A] bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
                Standard Western Decimal (US-EN)
              </div>
            )}
          </div>
        </div>

        {/* Live Formatter Outputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Formatter */}
          <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-[#7A736A] font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#A98860]" />
                PRICE FORMAT
              </span>
              <span>formatPrice()</span>
            </div>
            <div className="text-[20px] font-serif font-medium text-[#1C1A17]">
              {formatPrice(testAmount, locale, {
                currency: selectedCurrency,
                useEasternArabicNumerals: useEasternNumerals,
              })}
            </div>
            <span className="text-[10px] text-[#7A736A] font-mono">
              Raw: {testAmount} | Curr: {selectedCurrency}
            </span>
          </div>

          {/* Date Formatter */}
          <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-[#7A736A] font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#A98860]" />
                DATE FORMAT
              </span>
              <span>formatDate()</span>
            </div>
            <div className="text-[14px] font-medium text-[#1C1A17] leading-snug">
              {formatDate(new Date(), locale, 'medium')}
            </div>
            <span className="text-[10px] text-[#7A736A] font-mono">
              Full: {formatDate(new Date(), locale, 'full')}
            </span>
          </div>

          {/* Relative Time Formatter */}
          <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-[#7A736A] font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#A98860]" />
                RELATIVE TIME
              </span>
              <span>formatRelativeTime()</span>
            </div>
            <div className="text-[14px] font-medium text-[#1C1A17]">
              {formatRelativeTime(-2, 'hour', locale)}
            </div>
            <span className="text-[10px] text-[#7A736A] font-mono">
              Future: {formatRelativeTime(3, 'day', locale)}
            </span>
          </div>

          {/* List Formatter with Conjunctions */}
          <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-[#7A736A] font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#A98860]" />
                LIST CONJUNCTION
              </span>
              <span>formatList()</span>
            </div>
            <div className="text-[12px] font-body text-[#1C1A17] line-clamp-2">
              {formatList(sampleFragranceNotes, locale)}
            </div>
            <span className="text-[10px] text-[#7A736A] font-mono">
              {sampleFragranceNotes.length} Items joined
            </span>
          </div>
        </div>
      </div>

      {/* 4. Directional Tab & Keyboard Focus Traversal Flow */}
      <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.focusOrderSection')}
            </h3>
            <span className="text-[11px] font-mono text-[#A98860] uppercase">
              WCAG ACCESSIBILITY AUDIT
            </span>
          </div>
          <p className="text-[13px] text-[#7A736A]">
            {t('storefrontShowcase.focusOrderSubtitle')}
          </p>
        </div>

        {/* Interactive Keyboard Test Flow */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="p-3 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center justify-between text-[12px] font-mono text-[#7A736A]">
            <span>
              {locale === 'ar'
                ? 'اضغط مفتاح Tab للتنقل: يتبع المسار الطبيعي من اليمين إلى اليسار (١ ➔ ٢ ➔ ٣ ➔ ٤ ➔ ٥)'
                : 'Press Tab to verify sequential flow: Natural Left-to-Right DOM reading traversal (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5)'}
            </span>
            <Badge variant="outline" size="sm">
              CURRENT FOCUS: {focusedStep !== null ? `STEP ${focusedStep}` : 'IDLE'}
            </Badge>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert(locale === 'ar' ? 'تم إرسال النموذج بنجاح بالترتيب الصحيح!' : 'Form submitted sequentially!');
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Step 1: Input */}
            <div
              className={`p-4 bg-[#F5F1EA] border rounded-[2px] flex flex-col gap-2 transition-colors ${
                focusedStep === 1 ? 'border-[#A98860] bg-[#FAF7F2]' : 'border-[#E4DED3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#7A736A]">Step 1 (First)</span>
                <span className="w-5 h-5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono flex items-center justify-center">
                  1
                </span>
              </div>
              <input
                type="text"
                placeholder={locale === 'ar' ? 'اسم العميل' : 'Client Name'}
                value={demoFormStep1}
                onChange={(e) => setDemoFormStep1(e.target.value)}
                onFocus={() => setFocusedStep(1)}
                onBlur={() => setFocusedStep(null)}
                className="w-full bg-[#FAF7F2] border border-[#E4DED3] text-[#1C1A17] p-2 text-[13px] rounded-[1px] focus:outline-none focus:border-[#A98860]"
              />
            </div>

            {/* Step 2: Select */}
            <div
              className={`p-4 bg-[#F5F1EA] border rounded-[2px] flex flex-col gap-2 transition-colors ${
                focusedStep === 2 ? 'border-[#A98860] bg-[#FAF7F2]' : 'border-[#E4DED3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#7A736A]">Step 2</span>
                <span className="w-5 h-5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono flex items-center justify-center">
                  2
                </span>
              </div>
              <select
                value={demoFormStep2}
                onChange={(e) => setDemoFormStep2(e.target.value)}
                onFocus={() => setFocusedStep(2)}
                onBlur={() => setFocusedStep(null)}
                className="w-full bg-[#FAF7F2] border border-[#E4DED3] text-[#1C1A17] p-2 text-[13px] rounded-[1px] focus:outline-none focus:border-[#A98860]"
              >
                <option value="oud-01">{locale === 'ar' ? 'عود الوقت (خلاصة)' : 'Oud Al-Waqt'}</option>
                <option value="rose-02">{locale === 'ar' ? 'ورد الصحراء (ماء عطر)' : 'Desert Rose'}</option>
              </select>
            </div>

            {/* Step 3: Stepper */}
            <div
              className={`p-4 bg-[#F5F1EA] border rounded-[2px] flex flex-col gap-2 transition-colors ${
                focusedStep === 3 ? 'border-[#A98860] bg-[#FAF7F2]' : 'border-[#E4DED3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#7A736A]">Step 3</span>
                <span className="w-5 h-5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[12px] text-[#7A736A] font-mono">Qty:</span>
                <QuantityStepper
                  value={demoFormStep3}
                  min={1}
                  max={5}
                  onChange={setDemoFormStep3}
                  size="sm"
                />
              </div>
            </div>

            {/* Step 4: Action Button */}
            <div
              className={`p-4 bg-[#F5F1EA] border rounded-[2px] flex flex-col gap-2 justify-between transition-colors ${
                focusedStep === 4 ? 'border-[#A98860] bg-[#FAF7F2]' : 'border-[#E4DED3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#7A736A]">Step 4 (Submit)</span>
                <span className="w-5 h-5 rounded-full bg-[#1C1A17] text-[#FAF7F2] text-[10px] font-mono flex items-center justify-center">
                  4
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onFocus={() => setFocusedStep(4)}
                onBlur={() => setFocusedStep(null)}
                rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}
              >
                {locale === 'ar' ? 'تأكيد التسلسل' : 'Complete Sequence'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
