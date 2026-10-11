import React from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Sparkles,
  Droplets,
  Layers,
  Award,
  Wind,
  ShieldCheck,
  PackageCheck,
  Flame,
} from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { RouteId } from '../../types';
import { Button } from '../storefront/Button';
import { Badge } from '../storefront/Badge';
import { DirectionalArrowRight } from '../ui/DirectionalIcon';
import { editorialRevealVariants } from '../../utils/motion';

// Visual Assets
import heroVisualPath from '../../assets/images/hero_editorial_visual_1788041813228.jpg';
import brandStoryImg from '../../assets/images/brand_story_editorial_1788042561323.jpg';
import signatureFlaconImg from '../../assets/images/signature_oud_flacon_1788117377896.jpg';
import journalOudImg from '../../assets/images/journal_oud_aging_1788119740344.jpg';
import journalTaifImg from '../../assets/images/journal_taif_harvest_1788119728547.jpg';
import journalFrankincenseImg from '../../assets/images/journal_amber_frankincense_1788119758960.jpg';

export interface AboutBrandStoryProps {
  onRouteChange: (route: RouteId) => void;
}

export const AboutBrandStory: React.FC<AboutBrandStoryProps> = ({ onRouteChange }) => {
  const { locale, t } = useI18n();

  return (
    <div
      id="about-brand-story-page"
      className="w-full bg-[#F5F1EA] text-[#1C1A17] text-start flex flex-col gap-20 sm:gap-28 lg:gap-36 pb-24 animate-in fade-in duration-300"
    >
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HERO: THE CONVERGENCE OF TWO OLFACTIVE WORLDS                */}
      {/* ========================================================================= */}
      <section
        id="about-hero-section"
        aria-label={locale === 'ar' ? 'مقدمة فلسفة دار دهر' : 'The House of DAHR Introduction'}
        className="relative w-full min-h-[520px] sm:min-h-[600px] lg:min-h-[680px] flex items-end overflow-hidden border-b border-[#E4DED3] bg-[#141311]"
      >
        {/* Cinematic Background Image with Editorial Scrim */}
        <div className="absolute inset-0 z-0 select-none">
          <img
            src={heroVisualPath}
            alt={
              locale === 'ar'
                ? 'قارورة عطر دار دهر وسط صخور الحجر الجيري الصحراوي'
                : 'Architectural DAHR perfume flacon resting against sculpted desert limestone'
            }
            className="w-full h-full object-cover object-center opacity-75 sm:opacity-80 scale-[1.01]"
            referrerPolicy="no-referrer"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141311] via-[#141311]/50 to-transparent" />
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 pb-12 sm:pb-16 lg:pb-20 flex flex-col gap-6 text-start">
          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] text-[#D4C3A3] font-medium">
              {locale === 'ar' ? 'فلسفة الدار • التأسيس والنشأة' : 'THE HOUSE PHILOSOPHY • RIYADH & GRASSE'}
            </span>
            <span className="w-8 h-px bg-[#D4C3A3]/40" />
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FAF7F2] font-normal leading-[1.15] max-w-4xl tracking-tight">
            {locale === 'ar'
              ? 'صياغة معمارية للروائح النادرة بين هدوء الصحراء ومقطرات غراس'
              : 'The Architecture of Scent Born Between Desert Solitude and French Alembics'}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg font-body text-[#D4C3A3]/90 max-w-2xl leading-relaxed">
            {locale === 'ar'
              ? 'تأسست دار DAHR كحوار أزلي بين عمق التراث العطري في شبه الجزيرة العربية والدقة الكيميائية لأرقى معامل التقطير الفرنسية. نعيد تعريف العطر كحضور نحتي وبصمة خالدة تلامس الروح.'
              : 'DAHR exists as an enduring dialogue between the sacred olfactive rituals of the Arabian Peninsula and the uncompromising craft of Grasse haute-parfumerie. Formulated with extreme extrait density to linger as liquid architecture.'}
          </p>

          {/* Editorial Three-Pillar Badge Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#D4C3A3]/20 max-w-3xl">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4C3A3]/70">
                {locale === 'ar' ? 'تركيز نقي' : 'CONCENTRATION'}
              </span>
              <span className="font-serif text-base sm:text-lg text-[#FAF7F2]">
                {locale === 'ar' ? '24% – 40% خلاصة عطرية' : '24% – 40% Pure Extraits'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4C3A3]/70">
                {locale === 'ar' ? 'المكونات النادرة' : 'RAW BOTANICALS'}
              </span>
              <span className="font-serif text-base sm:text-lg text-[#FAF7F2]">
                {locale === 'ar' ? 'عود معتق وورد الطائف النقي' : 'Wild Agarwood & Taif Rose'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4C3A3]/70">
                {locale === 'ar' ? 'فترة التعتيق' : 'SLOW MACERATION'}
              </span>
              <span className="font-serif text-base sm:text-lg text-[#FAF7F2]">
                {locale === 'ar' ? '12 أسبوعاً في زجاج معتم' : '12 Weeks in Dark Vessels'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. NARRATIVE CHAPTER I: THE DIALOGUE OF TWO LANDS (ASYMMETRIC 2-COLUMN)   */}
      {/* ========================================================================= */}
      <section
        id="about-origins"
        aria-label={locale === 'ar' ? 'أصول الدار وفلسفة التكوين' : 'Origins and Olfactive Lineage'}
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16"
      >
        <motion.div
          variants={editorialRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* Left: Large Editorial Atelier Image */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            <div className="relative aspect-[4/5] bg-[#EBE5DB] border border-[#E4DED3] rounded-[2px] overflow-hidden shadow-xs">
              <img
                src={brandStoryImg}
                alt={
                  locale === 'ar'
                    ? 'صانع العطور في محترف دار دهر يفحص خلاصات خشب العود وزيوت التقطير'
                    : 'Master perfumer at DAHR atelier inspecting aged agarwood infusions and botanical extracts'
                }
                className="w-full h-full object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-4 start-4">
                <span className="px-2.5 py-1 bg-[#141311]/80 text-[#FAF7F2] text-[10px] font-mono uppercase tracking-widest rounded-[2px] backdrop-blur-xs">
                  ATELIER DE PARFUM • RIYADH
                </span>
              </div>
            </div>
            <p className="text-xs font-mono text-[#7A736A] italic ps-1">
              {locale === 'ar'
                ? 'فحص الزيوت العطرية الخام ووزن النوتات الأساسية في محترف الدار.'
                : 'Macerating botanical essences and weighing resinous heart notes at the Riyadh studio.'}
            </p>
          </div>

          {/* Right: Rich Long-Form Narrative */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-start">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                {locale === 'ar' ? 'الفصل الأول • الجذور' : 'CHAPTER I • THE LINEAGE'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1C1A17] font-normal leading-tight">
                {locale === 'ar'
                  ? 'حيث يلتقي سخاء الضيافة الشرقية بالصمت المعماري الحديث'
                  : 'Where Desert Hospitality Meets the Restraint of Modern Architecture'}
              </h2>
            </div>

            <div className="space-y-4 text-sm sm:text-base font-body text-[#554F47] leading-relaxed">
              <p>
                {locale === 'ar'
                  ? 'في الثقافة العربية الأصيلة، لم يكن العطر يوماً مجرد لمسة تجميلية عابرة، بل طقساً مقدساً للترحيب، وسبيكة حية تجمع بين المكان والذكرى. من هذا الإرث العريق، وُلدت دار DAHR لتصوغ لغة عطرية غير مسبوقة: عطور تحتفظ بعمق العود والبخور التاريخي، وتتوشح بنقاء الخطوط المعمارية المعاصرة.'
                  : 'In ancestral Arabian heritage, fragrance has never been a fleeting cosmetic afterthought. It is a sacred invocation of hospitality, an invisible architecture that defines the memory of space. From this heritage, DAHR was founded to articulate a new vocabulary: fragrances that honor the ancient gravity of wild agarwood and incense, framed by contemporary Scandinavian and Najdi restraint.'}
              </p>
              <p>
                {locale === 'ar'
                  ? 'نرفض تماماً أساليب الإنتاج التجاري السريع والمثبتات الكيميائية الزائفة. يتم اختيار كل مادة خام من موطنها البري الأصلي، وتُقطر بالبخار في درجات حرارة منخفضة للحفاظ على النقاء الحيوي للزيوت الطبيعية، ثم تُترك لتتفاعل في هدوء داخل أوعية معتمة لمدة لا تقل عن ثلاثة أشهر.'
                  : 'We deliberately reject industrial shortcuts, mass-market formulas, and synthetic volume boosters. Every botanical harvest is secured directly from private distillers, steam-extracted under low atmospheric pressure to preserve the living integrity of the oils, and allowed to mature undisturbed in darkened glass demijohns.'}
              </p>
            </div>

            {/* Inset Quote Line */}
            <div className="p-4 sm:p-5 border-s-2 border-[#A98860] bg-[#FAF7F2] rounded-e-[2px]">
              <p className="font-serif text-base sm:text-lg text-[#1C1A17] italic leading-snug">
                {locale === 'ar'
                  ? '«نحن لا نبيع روائح عابرة.. نحن نوثق زمناً ومكاناً في قارورة زجاجية صامتة.»'
                  : '“We do not bottle transient scents; we preserve an atmosphere, a memory, and a quiet presence.”'}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MATERIAL ANTHOLOGY: RAW BOTANICAL PURITY (3-PART EDITORIAL GRID)        */}
      {/* ========================================================================= */}
      <section
        id="about-materials"
        aria-label={locale === 'ar' ? 'المواد الطبيعية النادرة' : 'Rare Botanical Ingredients'}
        className="w-full bg-[#FAF7F2] border-y border-[#E4DED3] py-16 sm:py-24"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex flex-col gap-12 sm:gap-16">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#E4DED3]">
            <div className="flex flex-col gap-2 text-start">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                {locale === 'ar' ? 'الفصل الثاني • المواد الخام' : 'CHAPTER II • THE BOTANICAL ANTHOLOGY'}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1A17] font-normal">
                {locale === 'ar' ? 'نقاء المكونات الطبيعية النادرة' : 'Harvested with Reverence for the Land'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-body text-[#7A736A] max-w-md text-start">
              {locale === 'ar'
                ? 'ثلاثة عناصر أساسية تشكل الهوية الشمية لدار DAHR، مستخرجة بطرق أخلاقية تحافظ على استدامة الموارد الطبيعية.'
                : 'Three foundational pillars anchor the DAHR olfactive vault, sustainably harvested in harmony with seasonal harvests.'}
            </p>
          </div>

          {/* 3 Editorial Material Cards (Distinct visual cards with authentic story) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Card 1: Wild Agarwood */}
            <div className="flex flex-col gap-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] p-5 sm:p-6 transition-all hover:border-[#A98860]">
              <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-[#EBE5DB]">
                <img
                  src={journalOudImg}
                  alt={
                    locale === 'ar'
                      ? 'قطع خشب العود الكمبودي والآسامي المعتق في أوعية التعتيق'
                      : 'Wild Cambodian and Assamese agarwood chips undergoing aging in artisanal vessels'
                  }
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute bottom-2 start-2 px-2 py-0.5 bg-[#141311]/80 text-[#FAF7F2] text-[9px] font-mono uppercase tracking-widest rounded-[2px]">
                  ORIGIN: KOH KONG & ASSAM
                </span>
              </div>
              <div className="flex flex-col gap-2 text-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
                  {locale === 'ar' ? 'القلب الخشبي' : 'THE RESINOUS HEART'}
                </span>
                <h3 className="font-serif text-xl text-[#1C1A17]">
                  {locale === 'ar' ? 'خشب العود البري المعتق' : 'Aged Wild Agarwood (Oud)'}
                </h3>
                <p className="text-xs sm:text-[13px] font-body text-[#554F47] leading-relaxed">
                  {locale === 'ar'
                    ? 'يُستخلص من أشجار الأغار القديمة في الغابات المحمية بكمبوديا وآسام، حيث يتم تعتيق الزيوت في براميل نحاسية مظلمة لسنوات طويلة لإنتاج نوتات جلدية ودخانية عميقة دون أي حدة صناعية.'
                    : 'Sourced from protected old-growth Aquilaria groves in Cambodia and Assam. The raw resin is aged for years in sealed copper casks, developing rich leather, smoked wood, and warm balsamic depth.'}
                </p>
                <div className="pt-3 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#7A736A]">
                  <span>{locale === 'ar' ? 'طريقة الاستخلاص' : 'Extraction'}</span>
                  <span className="text-[#1C1A17]">{locale === 'ar' ? 'تقطير بخاري منخفض الضغط' : 'Low-Pressure Steam'}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Taif Mountain Rose */}
            <div className="flex flex-col gap-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] p-5 sm:p-6 transition-all hover:border-[#A98860]">
              <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-[#EBE5DB]">
                <img
                  src={journalTaifImg}
                  alt={
                    locale === 'ar'
                      ? 'مزارع ورد الطائف الجبلي عند الفجر خلال موسم القطف السنوي'
                      : 'High-altitude Taif Mountain rose harvest in morning mountain mist'
                  }
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute bottom-2 start-2 px-2 py-0.5 bg-[#141311]/80 text-[#FAF7F2] text-[9px] font-mono uppercase tracking-widest rounded-[2px]">
                  ORIGIN: SARAWAT MOUNTAINS, TAIF
                </span>
              </div>
              <div className="flex flex-col gap-2 text-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
                  {locale === 'ar' ? 'الروح الزهرية' : 'THE FLORAL SOUL'}
                </span>
                <h3 className="font-serif text-xl text-[#1C1A17]">
                  {locale === 'ar' ? 'ورد الطائف الجبلي النادر' : 'Mountain Taif Damask Rose'}
                </h3>
                <p className="text-xs sm:text-[13px] font-body text-[#554F47] leading-relaxed">
                  {locale === 'ar'
                    ? 'يُقطف يدوياً مع أولى ساعات الفجر على ارتفاع 2,000 متر فوق سطح البحر قبل أن تتبخر قطرات الندى بفعل الشمس. يمنح العطور انتعاشاً زهرياً نبيلاً ممتزجاً بنفحات عسلية وتوابل خفيفة.'
                    : 'Hand-plucked at dawn at 2,000 meters above sea level in the Sarawat range before direct sunlight warms the petals. Yields an intensely noble, honeyed floral essence with crisp green undertones.'}
                </p>
                <div className="pt-3 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#7A736A]">
                  <span>{locale === 'ar' ? 'موسم الحصاد' : 'Harvest Window'}</span>
                  <span className="text-[#1C1A17]">{locale === 'ar' ? 'مارس وأبريل فقط' : 'Annual March–April'}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Royal Hojari Frankincense */}
            <div className="flex flex-col gap-4 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] p-5 sm:p-6 transition-all hover:border-[#A98860]">
              <div className="relative aspect-[4/3] rounded-[2px] overflow-hidden bg-[#EBE5DB]">
                <img
                  src={journalFrankincenseImg}
                  alt={
                    locale === 'ar'
                      ? 'دموع راتنج اللبان الحوجري الملكي الفاخر والعنبر الرمادي الطبيعي'
                      : 'Royal green Hojari frankincense resin tears and raw natural ambergris'
                  }
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <span className="absolute bottom-2 start-2 px-2 py-0.5 bg-[#141311]/80 text-[#FAF7F2] text-[9px] font-mono uppercase tracking-widest rounded-[2px]">
                  ORIGIN: DHOFAR PLATEAU
                </span>
              </div>
              <div className="flex flex-col gap-2 text-start">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#A98860]">
                  {locale === 'ar' ? 'الراتنج المقدس' : 'THE SACRED RESIN'}
                </span>
                <h3 className="font-serif text-xl text-[#1C1A17]">
                  {locale === 'ar' ? 'اللبان الحوجري الملكي' : 'Royal Green Hojari Frankincense'}
                </h3>
                <p className="text-xs sm:text-[13px] font-body text-[#554F47] leading-relaxed">
                  {locale === 'ar'
                    ? 'حبات راتنجية فضية مخضرة تُجمع من أشجار البوسويليا القديمة في أودية ظفار الجافة. تطلق عند تقطيرها إشراقاً حمضياً معدنياً يرفع من هيبة العطر وثباته الزمني.'
                    : 'Rare silver-green tears harvested from wild Boswellia sacra trees on limestone desert bluffs. When gently steam-distilled, it releases a crystalline citrus-mineral smoke that elevates sillage.'}
                </p>
                <div className="pt-3 border-t border-[#E4DED3] flex items-center justify-between text-[11px] font-mono text-[#7A736A]">
                  <span>{locale === 'ar' ? 'درجة النقاوة' : 'Grading'}</span>
                  <span className="text-[#1C1A17]">{locale === 'ar' ? 'نقاء حوجري من الدرجة الأولى' : 'Grade 1 Silver-Green'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MASTER PERFUMER's MANIFESTO (TYPOGRAPHIC PULL-QUOTE SECTION)           */}
      {/* ========================================================================= */}
      <section
        id="about-manifesto"
        aria-label={locale === 'ar' ? 'بيان صانعي العطور' : 'Perfumer Manifesto'}
        className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-16 text-center"
      >
        <div className="p-8 sm:p-14 lg:p-20 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] relative overflow-hidden flex flex-col items-center gap-8 shadow-xs">
          {/* Subtle Decorative Emblem */}
          <div className="w-12 h-12 rounded-full border border-[#A98860]/40 flex items-center justify-center text-[#A98860]">
            <Sparkles className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-4 max-w-3xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#A98860]">
              {locale === 'ar' ? 'ميثاق الدار • بيان العطار' : 'HOUSE CREED • THE PERFUMER’S MANIFESTO'}
            </span>
            <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl text-[#1C1A17] leading-snug font-normal">
              {locale === 'ar'
                ? '«نحن لا نصنع العطور لإبهار الثواني العشر الأولى على شريط ورقي.. بل نصوغها للساعة الثانية عشرة على دفء البشرة، حين تتلاشى النوتات الخفيفة ويبقى الجوهر الخالد للخشب النقي.»'
                : '“We do not compose fragrances for the first ten seconds on a testing strip. We compose for the twelfth hour on warm skin, when the top volatile notes have dissolved and only the true soul of raw wood endures.”'}
            </blockquote>
          </div>

          <div className="flex flex-col items-center gap-1 pt-4 border-t border-[#E4DED3] w-48">
            <span className="font-serif text-sm text-[#1C1A17] font-medium">
              {locale === 'ar' ? 'محترف العطور الرئيسي' : 'Master Perfumer Atelier'}
            </span>
            <span className="text-[11px] font-mono text-[#7A736A]">
              DAHR • RIYADH & GRASSE
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THE FLACON: PHYSICAL ARCHITECTURE OF RESTRAINT (2-COLUMN VISUAL)       */}
      {/* ========================================================================= */}
      <section
        id="about-flacon"
        aria-label={locale === 'ar' ? 'تصميم القارورة والحرفية الزجاجية' : 'The Flacon Craftsmanship'}
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Text & Anatomy Specs */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-start order-2 lg:order-1">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
                {locale === 'ar' ? 'الفصل الثالث • القارورة' : 'CHAPTER III • THE VESSEL'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1C1A17] font-normal leading-tight">
                {locale === 'ar'
                  ? 'قارورة زجاجية صامتة مستوحاة من عمارة الطين والأحجار'
                  : 'An Architectural Vessel Molded in Heavy Crystal Glass'}
              </h2>
            </div>

            <p className="text-sm sm:text-base font-body text-[#554F47] leading-relaxed">
              {locale === 'ar'
                ? 'لم تكن القارورة لدينا مجرد وعاء، بل كتلة نحتية تحاكي بساطة العمارة النجدية وتوازن النسب الكلاسيكية. صُممت كل زجاجة بوزن ثقيل في قاعدتها لحماية السائل العطري الثمين من تقلبات الضوء والحرارة، ومزودة بغطاء معدني مصمت يمنح إحساساً ملموساً بالفخامة الهادئة.'
                : 'The DAHR flacon was conceived as a piece of functional sculpture, echoing the earthen massing of Najdi architecture and the crystalline purity of French glassmakers. The ultra-heavy base shields the living extrait from thermal swings, crowned by a machined solid metal cap that seals with tactile precision.'}
            </p>

            {/* Vessel Specifications Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E4DED3]">
              <div className="p-4 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98860]">
                  {locale === 'ar' ? 'الزجاج والوزن' : 'GLASS MASS'}
                </span>
                <span className="font-serif text-sm text-[#1C1A17]">
                  {locale === 'ar' ? 'زجاج بلوري سميك عالي النقاء' : 'High-Density French Crystal'}
                </span>
                <span className="text-[11px] font-body text-[#7A736A]">
                  {locale === 'ar' ? 'حماية فائقة من الأشعة فوق البنفسجية' : 'UV-filtering protective density'}
                </span>
              </div>

              <div className="p-4 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A98860]">
                  {locale === 'ar' ? 'الغطاء والختم' : 'CLOSURE'}
                </span>
                <span className="font-serif text-sm text-[#1C1A17]">
                  {locale === 'ar' ? 'معدن مصمت بختم محكم' : 'Hand-Machined Solid Alloy'}
                </span>
                <span className="text-[11px] font-body text-[#7A736A]">
                  {locale === 'ar' ? 'إغلاق ميكانيكي يحفظ الزيوت المتطايرة' : 'Airtight volatile preservation'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Studio Product Image */}
          <div className="lg:col-span-6 flex flex-col gap-3 order-1 lg:order-2">
            <div className="relative aspect-[4/5] bg-[#EBE5DB] border border-[#E4DED3] rounded-[2px] overflow-hidden shadow-xs flex items-center justify-center p-8">
              <img
                src={signatureFlaconImg}
                alt={
                  locale === 'ar'
                    ? 'القارورة الزجاجية المميزة لعطر دار دهر بتصميمها المعماري وغطائها المعدني'
                    : 'DAHR signature architectural fragrance flacon with heavy fluted glass and solid cap'
                }
                className="w-full h-full object-contain drop-shadow-md select-none hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </div>
            <p className="text-xs font-mono text-[#7A736A] italic ps-1">
              {locale === 'ar'
                ? 'قارورة عطر دار DAHR (100 مل) بتركيز خلاصة عطرية نقية 32%.'
                : 'DAHR signature 100ml flacon formulated at 32% pure Extrait de Parfum concentration.'}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CRAFTSMANSHIP COMMITMENTS (4-POINT BALANCED GRID)                       */}
      {/* ========================================================================= */}
      <section
        id="about-commitments"
        aria-label={locale === 'ar' ? 'معايير الحرفية والجودة' : 'Standards of Craftsmanship'}
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16"
      >
        <div className="p-8 sm:p-12 lg:p-16 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-10">
          <div className="flex flex-col gap-2 text-start max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A98860]">
              {locale === 'ar' ? 'المعايير الخمسة' : 'UNCOMPROMISING PRINCIPLES'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1A17]">
              {locale === 'ar' ? 'ركائز الجودة والنزاهة في دار DAHR' : 'The Four Pillars of Our Craft'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2.5 text-start">
              <ShieldCheck className="w-5 h-5 text-[#A98860]" />
              <h3 className="font-serif text-base text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'خالٍ من الملونات الصناعية' : 'Zero Artificial Dyes'}
              </h3>
              <p className="text-xs font-body text-[#7A736A] leading-relaxed">
                {locale === 'ar'
                  ? 'كل لون يظهر في القارورة هو نتاج طبيعي خالص لزيوت خشب العود وراتنج اللبان وبتلات الورد.'
                  : 'Every amber, golden, or verdant hue is the unadulterated result of aged botanical resins.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-start">
              <Droplets className="w-5 h-5 text-[#A98860]" />
              <h3 className="font-serif text-base text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'تعتيق بارد لمدة 12 أسبوعاً' : '12-Week Maceration'}
              </h3>
              <p className="text-xs font-body text-[#7A736A] leading-relaxed">
                {locale === 'ar'
                  ? 'فترة نضج صامتة تسمح للزيوت الثقيلة بالاندماج مع النوتات الزهرية دون أي تسخين مصطنع.'
                  : 'A patient cold-aging period allowing volatile florals to bond organically with heavy woods.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-start">
              <Layers className="w-5 h-5 text-[#A98860]" />
              <h3 className="font-serif text-base text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'دفعات سنوية مرقمة' : 'Limited Seasonal Batches'}
              </h3>
              <p className="text-xs font-body text-[#7A736A] leading-relaxed">
                {locale === 'ar'
                  ? 'إنتاج محدود لا يتجاوز 500 قارورة في كل موسم قطاف لضمان ثبات الجودة الحرفية.'
                  : 'Bottled in numbered small runs of 500 flacons per seasonal harvest to preserve purity.'}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 text-start">
              <PackageCheck className="w-5 h-5 text-[#A98860]" />
              <h3 className="font-serif text-base text-[#1C1A17] font-medium">
                {locale === 'ar' ? 'عينة تجربة مجانية مرفقة' : 'Test Vial Included'}
              </h3>
              <p className="text-xs font-body text-[#7A736A] leading-relaxed">
                {locale === 'ar'
                  ? 'عينة 2 مل لاختبار العطر على البشرة قبل فتح ختم القارورة الكبرى مع ضمان إرجاع كامل.'
                  : 'A 2ml sample vial is included with every flacon to test on skin prior to breaking the main seal.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. QUIET, SERENE CTA BACK INTO SHOP                                       */}
      {/* ========================================================================= */}
      <section
        id="about-cta"
        aria-label={locale === 'ar' ? 'دعوة لاستكشاف العطور' : 'Explore the Olfactive Creations'}
        className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16"
      >
        <div className="p-10 sm:p-16 lg:p-20 bg-[#141311] text-[#FAF7F2] rounded-[2px] flex flex-col items-center text-center gap-6 border border-[#2B2724]">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D4C3A3]">
            {locale === 'ar' ? 'مكتبة العطور الشمية' : 'THE OLFACTIVE ARCHIVE'}
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FAF7F2] font-normal max-w-2xl leading-tight">
            {locale === 'ar'
              ? 'اختبر الحضور العطري لدار DAHR على بشرتك'
              : 'Experience the Architectural Presence of DAHR on Skin'}
          </h2>

          <p className="text-sm sm:text-base font-body text-[#D4C3A3]/80 max-w-xl leading-relaxed">
            {locale === 'ar'
              ? 'استكشف العائلات العطرية الست، من دفء أخشاب العود المعتقة إلى نضارة البساتين الشرقية.'
              : 'Discover our complete catalog of extrait flacons across the six olfactive families.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onRouteChange('shop');
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              rightIcon={<DirectionalArrowRight className="w-4 h-4" />}
              className="!bg-[#A98860] hover:!bg-[#967750] !text-[#141311] font-medium px-8"
            >
              {locale === 'ar' ? 'استكشاف تشكيلة العطور' : 'Explore the Fragrance Shop'}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                onRouteChange('collections');
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="!border-[#D4C3A3]/40 !text-[#FAF7F2] hover:!bg-[#FAF7F2]/10 px-8"
            >
              {locale === 'ar' ? 'استعراض السلاسل الحصرية' : 'Curated Series'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
