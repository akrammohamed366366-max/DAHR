import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Globe,
} from 'lucide-react';
import { useI18n } from '../i18n/context';
import { Button } from '../components/storefront/Button';
import { Input } from '../components/storefront/Input';
import { Select } from '../components/storefront/Select';
import { QuantityStepper } from '../components/storefront/QuantityStepper';
import { ProductCard } from '../components/storefront/ProductCard';
import { Breadcrumb } from '../components/storefront/Breadcrumb';
import { TabGroup } from '../components/storefront/TabGroup';
import { Accordion } from '../components/storefront/Accordion';
import { Badge } from '../components/storefront/Badge';
import { ModalShell } from '../components/storefront/ModalShell';
import { useToast } from '../components/storefront/Toast';
import { BilingualAuditSection } from '../components/storefront/BilingualAuditSection';
import { DirectionalArrowRight, DirectionalChevronRight } from '../components/ui/DirectionalIcon';
import { FullAdminAuthGate } from '../components/admin/FullAdminAuthGate';
import { SAMPLE_FRAGRANCES } from '../data/fragrances';
import { ProductData } from '../types';

export const StorefrontShowcase: React.FC = () => {
  const { locale, direction, t } = useI18n();
  const { addToast } = useToast();

  // State for interactive component demos
  const [stepperVal, setStepperVal] = useState<number>(1);
  const [stepperValSmall, setStepperValSmall] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const [selectedFragrance, setSelectedFragrance] = useState<string>('oud-01');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeModalProduct, setActiveModalProduct] = useState<ProductData | null>(null);

  const breadcrumbItems = [
    { label: locale === 'ar' ? 'الرئيسية' : 'Home', href: '#home' },
    { label: locale === 'ar' ? 'المجموعة الاستثنائية' : 'Exclusive Collection', href: '#collection' },
    { label: locale === 'ar' ? 'عود الوقت' : 'Oud Al-Waqt', active: true },
  ];

  const tabItems = [
    { id: 'all', label: locale === 'ar' ? 'جميع العطور' : 'All Fragrances', badge: 8 },
    { id: 'extrait', label: locale === 'ar' ? 'خلاصة عطرية' : 'Extrait de Parfum', badge: 5 },
    { id: 'edp', label: locale === 'ar' ? 'ماء عطر' : 'Eau de Parfum', badge: 3 },
    { id: 'limited', label: locale === 'ar' ? 'إصدارات محدودة' : 'Limited Editions' },
  ];

  const accordionItems = [
    {
      id: 'olfactory-pyramid',
      title: locale === 'ar' ? 'الهرم العطري والنوتات' : 'Olfactory Pyramid & Scent Profile',
      subtitle: locale === 'ar' ? 'القمة، القلب، والقاعدة' : 'Top, Heart & Base Notes',
      content:
        locale === 'ar'
          ? 'افتتاحية متألقة من الزعفران الإيراني واللبان الحوجري، يعقبها قلب غني من خشب الصندل والورد الدمشقي، وتستقر القاعدة على خشب العود الكمبودي المعتق والعنبر الرمادي الطبيعي.'
          : 'Opening with radiant saffron and rare silver frankincense, transitioning into a core of smoked Taif rose and Mysore sandalwood, resting upon aged Cambodian oud and natural grey amber.',
    },
    {
      id: 'craftsmanship',
      title: locale === 'ar' ? 'حرفية التركيب والتعتيق' : 'Craftsmanship & Maturation',
      subtitle: locale === 'ar' ? 'تركيز ٣٠٪، تعتيق ٦ أشهر' : '30% Concentration, 6-Month Cask Aged',
      content:
        locale === 'ar'
          ? 'تُصاغ عطور DAHR في دفعات محدودة مرقمة يدويًا. يُترك المستخلص ليتعتّق في براميل زجاجية لمدة ستة أشهر لضمان ثبات النوتات وعمق الفوحان.'
          : 'DAHR fragrances are hand-blended in numbered micro-batches. Each master formula undergoes a 6-month resting period in temperature-controlled glass demijohns to attain peak resonance.',
    },
    {
      id: 'sustainability',
      title: locale === 'ar' ? 'الاستدامة والتغليف' : 'Packaging & Sustainable Sourcing',
      subtitle: locale === 'ar' ? 'زجاج إيطالي قابل لإعادة التدوير' : 'Recyclable Heavyweight Italian Glass',
      content:
        locale === 'ar'
          ? 'زجاجة ثقيلة مصقولة يدويًا مع غطاء معدني ثقيل، ومغلفة بورق طبيعي معاد تدويره خالٍ تمامًا من البلاستيك.'
          : 'Encased in custom heavyweight flint glass with a weighted monolithic cap. Outer packaging is crafted from 100% FSC-certified cotton-blend paper with no plastic laminates.',
    },
  ];

  const handleProductAddToCart = (product: ProductData) => {
    const title = locale === 'ar' ? product.nameAr : product.nameEn;
    addToast({
      type: 'success',
      title: locale === 'ar' ? 'تمت الإضافة إلى الحقيبة' : 'Added to Bag',
      message: `${title} (${product.volumeEn}) — ${product.price} USD`,
    });
  };

  const handleProductQuickView = (product: ProductData) => {
    setActiveModalProduct(product);
    setIsModalOpen(true);
  };

  return (
    <FullAdminAuthGate
      title="Storefront Component Showcase"
      subtitle="Access Restricted to Full Administrators"
    >
      <div className="w-full flex flex-col gap-12 sm:gap-16 pb-20">
      {/* Header Banner */}
      <header className="flex flex-col gap-3 pb-8 border-b border-[#E4DED3] text-start">
        <div className="flex items-center gap-2">
          <Badge variant="accent" size="sm">
            {locale === 'ar' ? 'نظام التصميم' : 'DESIGN SYSTEM'}
          </Badge>
          <Badge variant="outline" size="sm">
            {locale === 'ar' ? 'مكتبة المتجر' : 'STOREFRONT SYSTEM'}
          </Badge>
          <span className="text-[11px] font-mono text-[#7A736A]">
            DIR: {direction.toUpperCase()} ({locale.toUpperCase()})
          </span>
        </div>

        <h1 className="font-display text-[32px] sm:text-[44px] text-[#1C1A17] font-normal tracking-tight">
          {t('storefrontShowcase.title')}
        </h1>

        <p className="text-[14px] sm:text-[16px] text-[#7A736A] font-body max-w-3xl leading-relaxed">
          {t('storefrontShowcase.subtitle')}
        </p>

        {/* Token Specs Bar */}
        <div className="mt-4 p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-wrap items-center gap-4 text-[12px] font-mono text-[#7A736A]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[1px] bg-[#F5F1EA] border border-[#E4DED3]" />
            <span>bg: #F5F1EA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[1px] bg-[#FAF7F2] border border-[#E4DED3]" />
            <span>surface: #FAF7F2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[1px] bg-[#1C1A17]" />
            <span>text: #1C1A17</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[1px] bg-[#A98860]" />
            <span>accent: #A98860</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[1px] bg-[#E4DED3]" />
            <span>border: #E4DED3</span>
          </div>
        </div>
      </header>

      {/* 00. Bilingual & RTL Hardened Infrastructure Audit */}
      <BilingualAuditSection />

      {/* 01. Buttons Section */}
      <section className="flex flex-col gap-6 text-start">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <h2 className="font-display text-[22px] sm:text-[26px] text-[#1C1A17]">
            {t('storefrontShowcase.buttonsSection')}
          </h2>
          <p className="text-[13px] text-[#7A736A]">
            Primary (#1C1A17), Secondary (hairline bordered #FAF7F2), and minimal Text action links.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          {/* Primary Buttons */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase text-[#7A736A]">Primary Variant</span>
            <Button variant="primary" size="lg" fullWidth>
              {locale === 'ar' ? 'استكشف المجموعة' : 'Explore Collection'}
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<ShoppingBag className="w-4 h-4" />}
            >
              {locale === 'ar' ? 'إضافة إلى الحقيبة' : 'Add to Bag'}
            </Button>
            <Button variant="primary" size="sm" isLoading>
              {locale === 'ar' ? 'جارٍ التحميل' : 'Loading State'}
            </Button>
          </div>

          {/* Secondary Buttons */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase text-[#7A736A]">Secondary Variant</span>
            <Button variant="secondary" size="lg" fullWidth>
              {locale === 'ar' ? 'طلب عينة تجريبية' : 'Request Discovery Sample'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
            >
              {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
            </Button>
            <Button variant="secondary" size="sm" disabled>
              {locale === 'ar' ? 'غير متوفر حالياً' : 'Disabled / Sold Out'}
            </Button>
          </div>

          {/* Text Action Links */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-mono uppercase text-[#7A736A]">Text Action Link</span>
            <div className="flex flex-col items-start gap-2 pt-2">
              <Button variant="text" size="md" rightIcon={<DirectionalArrowRight className="w-3.5 h-3.5" />}>
                {locale === 'ar' ? 'قراءة دليل النوتات العطرية' : 'Read Olfactory Guide'}
              </Button>
              <Button variant="text" size="sm">
                {locale === 'ar' ? 'سياسة الشحن والإرجاع' : 'Shipping & Returns Policy'}
              </Button>
              <Button variant="text" size="sm" disabled>
                {locale === 'ar' ? 'رابط غير متاح' : 'Disabled Action'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 02. Inputs & Selects */}
      <section className="flex flex-col gap-6 text-start">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <h2 className="font-display text-[22px] sm:text-[26px] text-[#1C1A17]">
            {t('storefrontShowcase.inputsSection')}
          </h2>
          <p className="text-[13px] text-[#7A736A]">
            Hairline borders with bronze focus transitions, validation errors, and custom select triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <Input
            label={locale === 'ar' ? 'البحث عن عطر' : 'Fragrance Search'}
            placeholder={locale === 'ar' ? 'ابحث بالنوتة العطرية (عود، مسك...)' : 'Search by notes (Oud, Rose...)'}
            leftIcon={<Search className="w-4 h-4" />}
            hint={locale === 'ar' ? 'جرّب البحث عن "خلاصة عطرية"' : 'Try searching "Extrait" or "Amber"'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <Input
            label={locale === 'ar' ? 'البريد الإلكتروني' : 'Newsletter Membership'}
            placeholder="client@dahr.luxury"
            required
            error={inputError || (locale === 'ar' ? 'يرجى إدخال عنوان بريد إلكتروني صالح' : 'Please provide a valid email')}
            defaultValue="invalid.email@"
            onChange={(e) => {
              if (e.target.value.includes('@') && e.target.value.includes('.')) {
                setInputError('');
              } else {
                setInputError(locale === 'ar' ? 'صيغة البريد غير صحيحة' : 'Invalid email format');
              }
            }}
          />

          <Select
            label={locale === 'ar' ? 'اختر الحجم والتركيز' : 'Select Volume & Concentration'}
            required
            value={selectedFragrance}
            onChange={(e) => setSelectedFragrance(e.target.value)}
            options={[
              { value: 'oud-01', label: locale === 'ar' ? '١٠٠ مل — خلاصة عطرية ($320)' : '100 ML — Extrait de Parfum ($320)' },
              { value: 'oud-02', label: locale === 'ar' ? '٥٠ مل — ماء عطر ($210)' : '50 ML — Eau de Parfum ($210)' },
              { value: 'sample', label: locale === 'ar' ? 'مجموعة العينات الاستكشافية ($45)' : 'Discovery Sample Vial Set ($45)' },
            ]}
          />
        </div>
      </section>

      {/* 03. Stepper & Badges & Breadcrumbs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
        {/* Stepper */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h3 className="font-display text-[18px] sm:text-[20px] text-[#1C1A17]">
              {t('storefrontShowcase.stepperSection')}
            </h3>
            <p className="text-[12px] text-[#7A736A]">
              Interactive quantity control with min/max bounds.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#7A736A] font-body">
                {locale === 'ar' ? 'الحجم العادي (Standard):' : 'Standard Size:'}
              </span>
              <QuantityStepper
                value={stepperVal}
                min={1}
                max={10}
                onChange={setStepperVal}
                size="md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#7A736A] font-body">
                {locale === 'ar' ? 'الحجم الصغير (Compact):' : 'Compact Size:'}
              </span>
              <QuantityStepper
                value={stepperValSmall}
                min={1}
                max={5}
                onChange={setStepperValSmall}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h3 className="font-display text-[18px] sm:text-[20px] text-[#1C1A17]">
              {t('storefrontShowcase.badgesSection')}
            </h3>
            <p className="text-[12px] text-[#7A736A]">
              Quiet luxury badge tokens with no default use.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <Badge variant="default">
              {locale === 'ar' ? 'خلاصة عطرية' : 'EXTRAIT DE PARFUM'}
            </Badge>
            <Badge variant="accent">
              {locale === 'ar' ? 'إصدار جديد' : 'NEW EDITION'}
            </Badge>
            <Badge variant="neutral">
              {locale === 'ar' ? 'كمية محدودة' : 'LIMITED BATCH'}
            </Badge>
            <Badge variant="outline">
              {locale === 'ar' ? 'صناعة يدوية' : 'HAND-CRAFTED'}
            </Badge>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h3 className="font-display text-[18px] sm:text-[20px] text-[#1C1A17]">
              {t('storefrontShowcase.breadcrumbsSection')}
            </h3>
            <p className="text-[12px] text-[#7A736A]">
              Bidirectional hierarchical navigation.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Breadcrumb items={breadcrumbItems} />
            <Breadcrumb
              items={[
                { label: 'DAHR', href: '#' },
                { label: locale === 'ar' ? 'العطور' : 'Fragrances', href: '#' },
                { label: locale === 'ar' ? 'خلاصة عطرية' : 'Extraits', active: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 04. Tab Group & Accordion */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-start">
        {/* Tab Group Demo */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h2 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.tabsSection')}
            </h2>
            <p className="text-[13px] text-[#7A736A]">
              Minimalist underline tab list with item counters.
            </p>
          </div>

          <TabGroup
            tabs={tabItems}
            activeId={activeTab}
            onChange={setActiveTab}
          />

          <div className="p-5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] text-[13px] text-[#7A736A]">
            <p>
              {locale === 'ar'
                ? `التبويب النشط: ${tabItems.find((t) => t.id === activeTab)?.label}`
                : `Active Tab Selected: ${tabItems.find((t) => t.id === activeTab)?.label}`}
            </p>
          </div>
        </div>

        {/* Accordion Demo */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h2 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.accordionSection')}
            </h2>
            <p className="text-[13px] text-[#7A736A]">
              Collapsible product details and olfactory pyramiding.
            </p>
          </div>

          <Accordion
            items={accordionItems}
            defaultOpenIds={['olfactory-pyramid']}
            allowMultiple={false}
          />
        </div>
      </section>

      {/* 05. Product Cards Grid */}
      <section className="flex flex-col gap-6 text-start">
        <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[22px] sm:text-[28px] text-[#1C1A17]">
              {t('storefrontShowcase.productsSection')}
            </h2>
            <Badge variant="accent" size="sm">
              {SAMPLE_FRAGRANCES.length} FRAGRANCES
            </Badge>
          </div>
          <p className="text-[13px] text-[#7A736A]">
            Architectural card silhouette framing with brand Latin mark DAHR, pricing, notes, and hover actions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_FRAGRANCES.map((fragrance) => (
            <ProductCard
              key={fragrance.id}
              product={fragrance}
              onAddToCart={handleProductAddToCart}
              onQuickView={handleProductQuickView}
            />
          ))}
        </div>
      </section>

      {/* 06. Toasts & Modals Interactive Trigger Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
        {/* Toast triggers */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h3 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.toastSection')}
            </h3>
            <p className="text-[13px] text-[#7A736A]">
              Discreet notifications leveraging semantic color tokens (#4B5D46, #A9772F, #8C3B2E).
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'success',
                  title: locale === 'ar' ? 'تم حفظ التفضيلات' : 'Preferences Saved',
                  message: locale === 'ar' ? 'تم تحديث قائمة الرغبات الخاصة بك بنجاح.' : 'Your fragrance wishlist has been updated.',
                })
              }
            >
              {t('storefrontShowcase.triggerToastSuccess')}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'warning',
                  title: locale === 'ar' ? 'كمية محدودة متبقية' : 'Low Inventory Notice',
                  message: locale === 'ar' ? 'متبقي فقط ٣ زجاجات من عطر مسك الليل.' : 'Only 3 bottles remaining in the current batch.',
                })
              }
            >
              {t('storefrontShowcase.triggerToastWarning')}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                addToast({
                  type: 'error',
                  title: locale === 'ar' ? 'تعذر إتمام الطلب' : 'Checkout Notice',
                  message: locale === 'ar' ? 'يرجى التحقق من تفاصيل العنوان المرفق.' : 'Please verify your international delivery postal code.',
                })
              }
            >
              {t('storefrontShowcase.triggerToastError')}
            </Button>
          </div>
        </div>

        {/* Modal Shell Trigger */}
        <div className="flex flex-col gap-4 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
          <div className="flex flex-col gap-1 border-b border-[#E4DED3] pb-2">
            <h3 className="font-display text-[20px] sm:text-[24px] text-[#1C1A17]">
              {t('storefrontShowcase.modalSection')}
            </h3>
            <p className="text-[13px] text-[#7A736A]">
              Minimal quiet-luxury dialog shell with backdrop and action controls.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <p className="text-[13px] text-[#7A736A]">
              {locale === 'ar'
                ? 'انقر لتجربة النافذة المنبثقة التفاعلية مع دعم كامل لجميع الأحجام واتجاهات النص.'
                : 'Test the dialog overlay with keyboard escape listeners and backdrop dismissal.'}
            </p>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setActiveModalProduct(SAMPLE_FRAGRANCES[0]);
                setIsModalOpen(true);
              }}
            >
              {t('storefrontShowcase.openModalBtn')}
            </Button>
          </div>
        </div>
      </section>

      {/* Modal Shell Instance */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeModalProduct ? (locale === 'ar' ? activeModalProduct.nameAr : activeModalProduct.nameEn) : 'DAHR Quick View'}
        subtitle={activeModalProduct ? `DAHR / ${activeModalProduct.concentrationEn.toUpperCase()}` : 'FRAGRANCE PREVIEW'}
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            {activeModalProduct && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  handleProductAddToCart(activeModalProduct);
                  setIsModalOpen(false);
                }}
              >
                {t('actions.addToBag')} — {activeModalProduct.price} USD
              </Button>
            )}
          </>
        }
      >
        {activeModalProduct ? (
          <div className="flex flex-col gap-4 text-start">
            <div className="p-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-[#A98860] uppercase">
                  {locale === 'ar' ? 'العائلة العطرية' : 'Olfactive Family'}
                </span>
                <span className="text-[14px] text-[#1C1A17] font-medium">
                  {locale === 'ar' ? activeModalProduct.olfactiveFamilyAr : activeModalProduct.olfactiveFamilyEn}
                </span>
              </div>
              <span className="text-[18px] font-mono font-medium text-[#1C1A17]">
                ${activeModalProduct.price}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-[13px] text-[#7A736A]">
              <span className="font-mono text-[11px] uppercase text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'النوتات الرئيسية:' : 'Primary Notes:'}
              </span>
              <p>
                {locale === 'ar' ? activeModalProduct.topNotesAr : activeModalProduct.topNotesEn}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-[13px] text-[#7A736A]">
                {locale === 'ar' ? 'الكمية المطلوبة:' : 'Select Quantity:'}
              </span>
              <QuantityStepper
                value={stepperVal}
                min={1}
                max={10}
                onChange={setStepperVal}
                size="sm"
              />
            </div>
          </div>
        ) : (
          <p>Fragrance preview details.</p>
        )}
      </ModalShell>
    </div>
    </FullAdminAuthGate>
  );
};
