import React, { useState } from 'react';
import { Mail, Clock, MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { useToast } from '../storefront/Toast';
import { Button } from '../storefront/Button';
import { Input } from '../storefront/Input';
import { Select } from '../storefront/Select';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { RouteId } from '../../types';
import { inquiriesApi } from '../../api/inquiriesApi';

interface ContactPageProps {
  onRouteChange: (route: RouteId) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onRouteChange }) => {
  const { locale } = useI18n();
  const { addToast } = useToast();

  // Form Field States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('bespoke-inquiry');
  const [message, setMessage] = useState('');

  // Status & Validation States
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name =
        locale === 'ar' ? 'يرجى إدخال الاسم الكريم' : 'Please provide your name';
    } else if (name.trim().length < 2) {
      newErrors.name =
        locale === 'ar'
          ? 'يجب أن يحتوي الاسم على حرفين على الأقل'
          : 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email =
        locale === 'ar'
          ? 'يرجى إدخال البريد الإلكتروني'
          : 'Please provide your email address';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email =
        locale === 'ar'
          ? 'يرجى إدخال بريد إلكتروني صالح'
          : 'Please enter a valid email address';
    }

    if (!message.trim()) {
      newErrors.message =
        locale === 'ar'
          ? 'يرجى كتابة تفاصيل استفساركم'
          : 'Please enter your inquiry details';
    } else if (message.trim().length < 10) {
      newErrors.message =
        locale === 'ar'
          ? 'يرجى كتابة رسالة لا تقل عن ١٠ أحرف'
          : 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler: writes to Firestore contactMessages collection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct write to Firestore collection `contactMessages` (05)
      await inquiriesApi.submitContactMessage({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject,
        message: message.trim(),
      });

      setIsSuccess(true);
      addToast({
        type: 'success',
        title: locale === 'ar' ? 'تم استلام الرسالة' : 'Inquiry Received',
        message:
          locale === 'ar'
            ? 'سيتواصل معكم كونسيرج DAHR خلال 24 ساعة.'
            : 'DAHR Concierge will respond to your inquiry within 24 hours.',
      });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      const errMsg =
        locale === 'ar'
          ? 'تعذر إرسال الرسالة حالياً. يرجى المحاولة لاحقاً أو مراسلتنا مباشرة عبر البريد.'
          : 'Unable to transmit your inquiry at this moment. Please try again or reach us directly via email.';
      setSubmitError(errMsg);
      addToast({
        type: 'error',
        title: locale === 'ar' ? 'فشل الإرسال' : 'Transmission Failed',
        message: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setSubject('bespoke-inquiry');
    setMessage('');
    setErrors({});
    setIsSuccess(false);
    setSubmitError(null);
  };

  return (
    <div
      id="contact-page"
      className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 sm:gap-16 pb-24 text-start animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. HEADER SECTION                                                         */}
      {/* ========================================================================= */}
      <header className="flex flex-col gap-4 max-w-3xl border-b border-[#E4DED3] pb-8 text-start">
        <div className="flex items-center gap-2 text-xs font-mono text-[#A98860] uppercase tracking-[0.2em]">
          <span>{locale === 'ar' ? 'الكونسيرج الخاص' : 'PRIVATE CONCIERGE SALON'}</span>
          <span>•</span>
          <span>{locale === 'ar' ? 'الرياض وغراس' : 'RIYADH & GRASSE'}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl text-[#1C1A17] font-normal leading-[1.15] tracking-tight">
          {locale === 'ar' ? 'تواصل مع دار DAHR' : 'Contact Concierge'}
        </h1>

        <p className="text-base sm:text-lg text-[#554F47] font-body font-light leading-relaxed">
          {locale === 'ar'
            ? 'فريق الكونسيرج متاح لترتيب الجلسات الاستشارية الشمية الخاصة، ومتابعة الطلبات والشحن المناخي المبرد، وخدمات الإهداء الراقية للمجموعات المحدودة.'
            : 'Our concierge salon assists with private fragrance consultations, climate-controlled shipping inquiries, bespoke compounding, and curated VIP gifting.'}
        </p>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN 2-COLUMN LAYOUT: INFO & FORM                                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN: DIRECT CONTACT INFO & SALONS (5 COLS) */}
        <aside
          aria-label={locale === 'ar' ? 'بيانات التواصل المباشر' : 'Direct Contact Channels'}
          className="lg:col-span-5 flex flex-col gap-8 text-start"
        >
          {/* Direct Email Channels */}
          <div className="flex flex-col gap-3 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
              {locale === 'ar' ? 'المراسلات المباشرة' : 'DIRECT CHANNELS'}
            </span>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-start gap-3.5">
                <Mail className="w-4 h-4 text-[#A98860] shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono uppercase text-[#7A736A] tracking-wider">
                    {locale === 'ar' ? 'الكونسيرج والعناية بالعملاء' : 'Client Concierge'}
                  </span>
                  <a
                    href="mailto:concierge@dahr.luxury"
                    className="font-mono text-sm text-[#1C1A17] hover:text-[#A98860] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860]"
                  >
                    concierge@dahr.luxury
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-[#E4DED3]/60">
                <Mail className="w-4 h-4 text-[#7A736A] shrink-0 mt-1" />
                <div className="flex flex-col">
                  <span className="text-xs font-mono uppercase text-[#7A736A] tracking-wider">
                    {locale === 'ar' ? 'الشراكات والإعلام' : 'Press & Partnerships'}
                  </span>
                  <a
                    href="mailto:press@dahr.luxury"
                    className="font-mono text-sm text-[#1C1A17] hover:text-[#A98860] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A98860]"
                  >
                    press@dahr.luxury
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Atelier & Laboratory Coordinates */}
          <div className="flex flex-col gap-3 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
              {locale === 'ar' ? 'مواقع الصالونات والمختبرات' : 'ATELIER & LABORATORY LOCATIONS'}
            </span>

            <div className="flex flex-col gap-4 pt-2 font-body text-xs sm:text-sm text-[#554F47]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-[#A98860] shrink-0 mt-1" />
                <div className="flex flex-col gap-0.5">
                  <strong className="text-[#1C1A17] font-medium font-serif text-sm sm:text-base">
                    {locale === 'ar' ? 'صالون الحي الدبلوماسي — الرياض' : 'Diplomatic Quarter Salon — Riyadh'}
                  </strong>
                  <p className="text-[#7A736A] leading-relaxed">
                    {locale === 'ar'
                      ? 'طريق السفارات، صالون DAHR للاستشارات الخاصة، الرياض، المملكة العربية السعودية.'
                      : 'Embassy Boulevard, Private Consultation Suite, Riyadh, Kingdom of Saudi Arabia.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 pt-3 border-t border-[#E4DED3]/60">
                <MapPin className="w-4 h-4 text-[#7A736A] shrink-0 mt-1" />
                <div className="flex flex-col gap-0.5">
                  <strong className="text-[#1C1A17] font-medium font-serif text-sm sm:text-base">
                    {locale === 'ar' ? 'مختبر الصياغة الشمية — غراس' : 'Formulation Laboratory — Grasse'}
                  </strong>
                  <p className="text-[#7A736A] leading-relaxed">
                    {locale === 'ar'
                      ? 'طريق بلانش دي كاز، غراس، مقاطعة الألب البحرية، فرنسا.'
                      : 'Route Blanche de Grasse, Alpes-Maritimes, France.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Salon Consultation Hours & Social */}
          <div className="flex flex-col gap-3 p-6 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
              {locale === 'ar' ? 'ساعات العمل والخدمة' : 'SERVICE HOURS & SOCIAL'}
            </span>

            <div className="flex flex-col gap-3 text-xs font-mono text-[#7A736A] pt-1">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#A98860] shrink-0" />
                <span>
                  {locale === 'ar'
                    ? 'الأحد – الخميس: 10:00 صباحاً – 6:00 مساءً (توقيت مكة)'
                    : 'Sunday – Thursday: 10:00 – 18:00 (AST)'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#E4DED3]/60 flex items-center gap-4 text-xs font-mono uppercase">
                <span className="text-[#1C1A17]">{locale === 'ar' ? 'الأرشيف:' : 'Archive:'}</span>
                <a
                  href="#instagram"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#A98860] hover:text-[#1C1A17] transition-colors"
                >
                  Instagram @dahr.perfumery
                </a>
                <span className="opacity-30">/</span>
                <a
                  href="#pinterest"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#A98860] hover:text-[#1C1A17] transition-colors"
                >
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: INTERACTIVE ACCESSIBLE CONTACT FORM (7 COLS) */}
        <section
          aria-label={locale === 'ar' ? 'نموذج إرسال استفسار' : 'Inquiry Transmission Form'}
          className="lg:col-span-7 p-6 sm:p-10 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] shadow-2xs text-start"
        >
          {isSuccess ? (
            /* Quiet Calm Success Feedback State */
            <div
              id="contact-success-state"
              className="py-10 flex flex-col items-center text-center gap-5 animate-in fade-in duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#F5F1EA] border border-[#A98860] flex items-center justify-center text-[#A98860]">
                <Check className="w-6 h-6" />
              </div>

              <div className="flex flex-col gap-2 max-w-md">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                  {locale === 'ar' ? 'تم استلام الاستفسار' : 'TRANSMISSION CONFIRMED'}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17]">
                  {locale === 'ar' ? 'شكراً لتواصلكم مع دار DAHR' : 'Your Message Has Been Received'}
                </h2>
                <p className="text-sm text-[#554F47] font-body leading-relaxed mt-1">
                  {locale === 'ar'
                    ? 'تم تسجيل استفساركم بنجاح في سجلات الكونسيرج. سيتواصل معكم أحد خبراء العطور لدينا خلال ٢٤ ساعة عمل عبر البريد الإلكتروني.'
                    : 'Your inquiry has been logged in our atelier records. A DAHR olfactive specialist will respond within 24 business hours.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                <Button variant="secondary" size="md" onClick={handleResetForm}>
                  {locale === 'ar' ? 'إرسال استفسار آخر' : 'Send Another Inquiry'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    onRouteChange('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
                >
                  {locale === 'ar' ? 'استعراض كتالوج العطور' : 'Explore Fragrance Catalog'}
                </Button>
              </div>
            </div>
          ) : (
            /* Active Form State */
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="border-b border-[#E4DED3] pb-4 flex flex-col gap-1">
                <h2 className="font-serif text-xl sm:text-2xl text-[#1C1A17] font-normal">
                  {locale === 'ar' ? 'إرسال رسالة إلى الكونسيرج' : 'Send an Atelier Inquiry'}
                </h2>
                <p className="text-xs text-[#7A736A] font-body">
                  {locale === 'ar'
                    ? 'الحقول المعلمة بعلامة (*) حقول مطلوبة لضمان دقة التواصل.'
                    : 'Fields marked with an asterisk (*) are required for prompt dispatch.'}
                </p>
              </div>

              {/* Server / Firestore Transmission Error Banner */}
              {submitError && (
                <div
                  role="alert"
                  className="p-4 bg-[#FBEBE8] border border-[#8C3B2E]/30 rounded-[2px] flex items-start gap-3 text-start"
                >
                  <AlertCircle className="w-4 h-4 text-[#8C3B2E] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#8C3B2E] font-medium leading-relaxed">
                    {submitError}
                  </p>
                </div>
              )}

              {/* Name Field */}
              <Input
                id="contact-form-name"
                name="name"
                label={locale === 'ar' ? 'الاسم الكريم' : 'Full Name'}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder={locale === 'ar' ? 'سلطان بن فهد' : 'Julian Vance'}
                required
                error={errors.name}
                disabled={isSubmitting}
                autoComplete="name"
              />

              {/* Email Field */}
              <Input
                id="contact-form-email"
                name="email"
                type="email"
                label={locale === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="client@dahr.luxury"
                required
                error={errors.email}
                disabled={isSubmitting}
                autoComplete="email"
              />

              {/* Subject Select */}
              <Select
                id="contact-form-subject"
                name="subject"
                label={locale === 'ar' ? 'موضوع الاستشارة' : 'Inquiry Subject'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSubmitting}
                options={[
                  {
                    value: 'bespoke-inquiry',
                    label:
                      locale === 'ar'
                        ? 'استشارة عطرية مخصصة وجلسة خاصة'
                        : 'Bespoke Fragrance Consultation & Private Session',
                  },
                  {
                    value: 'order-shipping',
                    label:
                      locale === 'ar'
                        ? 'استفسار عن طلب والشحن المناخي المبرد'
                        : 'Order Status & Climate-Controlled Shipping',
                  },
                  {
                    value: 'corporate-gifting',
                    label:
                      locale === 'ar'
                        ? 'خدمات الإهداء الراقية للمؤسسات وكبار الشخصيات'
                        : 'Corporate & VIP Bespoke Gifting',
                  },
                  {
                    value: 'press-atelier',
                    label:
                      locale === 'ar'
                        ? 'الاستفسارات الصحفية والمعارض'
                        : 'Press, Editorial & Exhibition Inquiries',
                  },
                ]}
              />

              {/* Message Field */}
              <div className="flex flex-col gap-1.5 font-body text-start">
                <label
                  htmlFor="contact-form-message"
                  className="text-[12px] sm:text-[13px] uppercase tracking-[0.08em] [dir=rtl]:tracking-normal [dir=rtl]:normal-case text-[#7A736A] font-medium flex items-center justify-between"
                >
                  <span>
                    {locale === 'ar' ? 'تفاصيل الرسالة' : 'Inquiry Details'}
                    <span className="text-[#8C3B2E] ms-1">*</span>
                  </span>
                </label>

                <textarea
                  id="contact-form-message"
                  name="message"
                  rows={5}
                  value={message}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-form-message-error' : undefined}
                  placeholder={
                    locale === 'ar'
                      ? 'شاركونا تفضيلاتكم الشمية، أو تفاصيل المناسبة، أو أي استفسارات خاصة...'
                      : 'Share your olfactive preferences, custom engraving requests, or consultation dates...'
                  }
                  className={`
                    w-full bg-[#FAF7F2] text-[#1C1A17] placeholder:text-[#7A736A]/50
                    border rounded-[2px] text-[14px] sm:text-[15px] p-3.5 transition-colors duration-150
                    focus:outline-none focus:border-[#1C1A17] focus:bg-[#FFFFFF]
                    disabled:bg-[#F5F1EA] disabled:text-[#7A736A]/40 disabled:border-[#E4DED3]/60 disabled:cursor-not-allowed
                    ${errors.message ? 'border-[#8C3B2E] focus:border-[#8C3B2E]' : 'border-[#E4DED3] hover:border-[#1C1A17]/40'}
                  `}
                />

                {errors.message && (
                  <p id="contact-form-message-error" className="text-[12px] text-[#8C3B2E] font-medium mt-0.5">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  id="contact-form-submit-btn"
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isSubmitting
                    ? locale === 'ar'
                      ? 'جاري إرسال الرسالة...'
                      : 'Transmitting Inquiry...'
                    : locale === 'ar'
                    ? 'إرسال الرسالة إلى الكونسيرج'
                    : 'Transmit to Concierge'}
                </Button>
              </div>

              <p className="text-[11px] font-mono text-[#7A736A] text-center">
                {locale === 'ar'
                  ? 'يتم التعامل مع كافة المراسلات بسرية تامة وفق سياسة الخصوصية لدار DAHR.'
                  : 'All communications are governed by DAHR Private Client Data Protection protocols.'}
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
