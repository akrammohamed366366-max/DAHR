import { BilingualText } from '../types/backend';

export interface LegalSection {
  id: string;
  heading: BilingualText;
  paragraphs: BilingualText[];
}

export interface LegalDocument {
  id: string;
  routeId: 'privacy' | 'terms' | 'shipping-returns';
  category: BilingualText;
  title: BilingualText;
  excerpt: BilingualText;
  lastUpdated: string;
  effectiveDate: string;
  sections: LegalSection[];
  disclaimer: BilingualText;
}

export const LEGAL_DOCUMENTS: Record<'privacy' | 'terms' | 'shipping-returns', LegalDocument> = {
  privacy: {
    id: 'legal-privacy-policy',
    routeId: 'privacy',
    category: {
      en: 'LEGAL PROTOCOL • DATA PROTECTION',
      ar: 'البروتوكول القانوني • حماية البيانات الشخصية',
    },
    title: {
      en: 'Privacy & Personal Data Protection Policy',
      ar: 'سياسة الخصوصية وحماية البيانات الشخصية',
    },
    excerpt: {
      en: 'How the house of DAHR collects, curates, protects, and governs client personal information, olfactive preferences, and transaction records across the Kingdom of Saudi Arabia and international jurisdictions.',
      ar: 'بيان يوضح كيفية جمع وحفظ وإدارة البيانات الشخصية والتفضيلات الشمية وسجلات المعاملات الخاصة بعملاء دار DAHR في المملكة العربية السعودية والأسواق الدولية.',
    },
    lastUpdated: 'August 2026',
    effectiveDate: 'August 15, 2026',
    disclaimer: {
      en: 'STARTING TEMPLATE FOR LEGAL REVIEW — This document is provided as a reference draft outlining the operational privacy practices of DAHR. It must undergo formal review by qualified legal counsel in the relevant operating jurisdictions before commercial execution.',
      ar: 'نموذج مبدئي للمراجعة القانونية — تم إعداد هذه الوثيقة كمسودة تشغيلية توضح ممارسات الخصوصية لدى DAHR، ويجب إخضاعها للمراجعة النظامية من قِبل مستشار قانوني معتمد قبل الاعتماد التجاري الملزم.',
    },
    sections: [
      {
        id: 'collection-principles',
        heading: {
          en: '1. Principles of Personal Data Collection',
          ar: '١. مبادئ جمع البيانات الشخصية',
        },
        paragraphs: [
          {
            en: 'DAHR adheres strictly to the highest standards of data governance in compliance with the Saudi Personal Data Protection Law (PDPL) promulgated by Royal Decree No. (M/19) and applicable international data privacy standards including GDPR.',
            ar: 'تلتزم دار DAHR بأعلى معايير حوكمة وحماية البيانات وفقاً لنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/١٩) في المملكة العربية السعودية ومعايير الحماية الدولية المعمول بها.',
          },
          {
            en: 'We collect only the minimal necessary information required to fulfill bespoke fragrance formulation inquiries, climate-controlled shipping logistics, private client accounts, and curated concierge communications. We do not sell, rent, or trade private client records under any circumstances.',
            ar: 'نقتصر في جمع البيانات على الحد الأدنى اللازم لتنفيذ طلبات العطور، وإدارة الشحن المناخي الآمن، وخدمات حسابات العملاء والكونسيرج الخاص. ولا نقوم تحت أي ظرف ببيع أو تأجير بيانات العملاء لأي جهة خارجية.',
          },
        ],
      },
      {
        id: 'data-categories',
        heading: {
          en: '2. Categories of Information We Curate',
          ar: '٢. فئات المعلومات التي نقوم بمعالجتها',
        },
        paragraphs: [
          {
            en: 'Contact and Identity Information: Full name, verified email address, phone number, and physical delivery coordinates provided during checkout or concierge consultation requests.',
            ar: 'بيانات الهوية والتواصل: الاسم الكامل، البريد الإلكتروني المؤكد، رقم الهاتف، وعنوان التسليم الدقيق المقدم أثناء إتمام الطلب أو طلب استشارة الكونسيرج.',
          },
          {
            en: 'Olfactive Preferences and Formulation Notes: Scent family affinities, private bespoke consultation archives, and bespoke flacon engraving inscriptions recorded to tailor personalized sampling experiences.',
            ar: 'التفضيلات الشمية وملاحظات الصياغة: الميول العائلية العطرية، وسجلات الاستشارات الخاصة، والنقوش المخصصة على الزجاجات لحفظ تجارب العينات المصممة خصيصاً لكل عميل.',
          },
          {
            en: 'Secure Transaction Records: Order identifiers, payment confirmation tokens (processed securely via PCI-DSS compliant gateways without storing raw card numbers), and dispatch tracking references.',
            ar: 'سجلات المعاملات المشفرة: معرفات الطلبات، ورموز التحقق من الدفع (المعالجة عبر بوابات مشفرة مطابقة لمعايير PCI-DSS دون تخزين أرقام البطاقات المصرفية لدينا)، وبيانات تتبع الشحنات.',
          },
        ],
      },
      {
        id: 'processing-purpose',
        heading: {
          en: '3. Purposes of Processing and Processing Grounds',
          ar: '٣. أغراض المعالجة والأسس النظامية',
        },
        paragraphs: [
          {
            en: 'We process personal information solely for the following legitimate purposes: fulfilling sales agreements, coordinating white-glove climate shipping, authenticating private account credentials, preventing fraudulent activity, and communicating critical order updates.',
            ar: 'تتم معالجة البيانات الشخصية حصرياً للأغراض النظامية التالية: إبرام وتنفيذ عقود البيع، وتنسيق الشحن المبرد، والتحقق من حسابات العملاء، ومنع عمليات الاحتيال، وإرسال تحديثات الطلبات.',
          },
          {
            en: 'Editorial Dispatch and Olfactive Chronicles: Subscribers who opt into our newsletter receive curated essays and limited edition notices. Consent can be withdrawn at any time via a single-click unsubscribe mechanism.',
            ar: 'النشرات التحريرية والمجلة الشمية: يتلقى المشتركون الذين أبدوا موافقتهم إشعارات الإصدارات المحدودة والمقالات التحريرية، مع إمكانية إلغاء الاشتراك في أي لحظة عبر رابط مباشر.',
          },
        ],
      },
      {
        id: 'data-retention-security',
        heading: {
          en: '4. Data Retention, Storage & Security Protocols',
          ar: '٤. مدة حفظ البيانات وبروتوكولات الأمان',
        },
        paragraphs: [
          {
            en: 'All client records are retained only for the duration necessary to satisfy commercial warranty, accounting, and regulatory compliance mandates in Saudi Arabia. Data stored within our secure cloud infrastructure is protected with multi-layered encryption at rest (AES-256) and in transit (TLS 1.3).',
            ar: 'يتم الاحتفاظ ببيانات العملاء للمدة الضرورية فقط لاستيفاء متطلبات الضمان والمحاسبة والاشتراطات التنظيمية في المملكة. وتُخزن البيانات في بيئة سحابية مشفرة ببروتوكولات (AES-256) و (TLS 1.3).',
          },
        ],
      },
      {
        id: 'client-rights',
        heading: {
          en: '5. Your Rights as a Data Subject',
          ar: '٥. حقوق العميل والتحكم بالبيانات',
        },
        paragraphs: [
          {
            en: 'Under applicable Saudi and international privacy regulations, you possess the right to access, rectify, restrict processing of, or request the complete erasure of your personal records, subject to statutory retention obligations. Requests may be submitted directly to our Data Protection Officer at privacy@dahr.luxury.',
            ar: 'يحق لك وفق الأنظمة المعمول بها طلب الاطلاع على بياناتك الشخصية، أو تصحيحها، أو تقييد معالجتها، أو طلب حذفها بالكامل مع مراعاة القيود النظامية. يمكن تقديم الطلبات لمسؤول حماية البيانات عبر البريد: privacy@dahr.luxury.',
          },
        ],
      },
    ],
  },

  terms: {
    id: 'legal-terms-of-service',
    routeId: 'terms',
    category: {
      en: 'LEGAL PROTOCOL • TERMS OF SERVICE',
      ar: 'البروتوكول القانوني • الشروط والأحكام العامة',
    },
    title: {
      en: 'Terms of Service & Atelier Protocols',
      ar: 'الشروط والأحكام العامة وبروتوكولات الدار',
    },
    excerpt: {
      en: 'The contractual terms, olfactive formulation standards, and intellectual property rights governing access to DAHR digital salons, physical ateliers, and commercial product acquisitions.',
      ar: 'الأحكام التعاقدية ومعايير الصياغة الشمية وحقوق الملكية الفكرية المنظمة للاستفادة من صالونات دار DAHR الرقمية والمادية وعمليات الشراء المباشرة.',
    },
    lastUpdated: 'August 2026',
    effectiveDate: 'August 15, 2026',
    disclaimer: {
      en: 'STARTING TEMPLATE FOR LEGAL REVIEW — These terms serve as an architectural baseline governing client engagements with DAHR. They must be validated by commercial counsel in accordance with applicable e-commerce regulations before binding application.',
      ar: 'نموذج مبدئي للمراجعة القانونية — تمثل هذه الشروط قاعدة انطلاق تنظيمية لتعاملات عملاء DAHR، ويجب اعتمادها وتدقيقها من مستشار قانوني مرخص وفق نظام التجارة الإلكترونية ولائحته التنفيذية.',
    },
    sections: [
      {
        id: 'acceptance-terms',
        heading: {
          en: '1. Acceptance of Terms & Digital Salon Access',
          ar: '١. قبول الشروط والوصول إلى الصالون الرقمي',
        },
        paragraphs: [
          {
            en: 'By accessing the DAHR digital storefront, placing orders, or engaging with our concierge services, you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and DAHR Perfumery LLC (operating in Riyadh, Kingdom of Saudi Arabia).',
            ar: 'يُعد دخولكم إلى المنصة الرقمية لدار DAHR، أو تقديم طلبات الشراء، أو التواصل مع الكونسيرج، موافقة صريحة على الالتزام بهذه الشروط والأحكام، والتي تشكل اتفاقاً قانونياً ملزماً مع دار DAHR للعطور (الرياض، المملكة العربية السعودية).',
          },
        ],
      },
      {
        id: 'formulations-batches',
        heading: {
          en: '2. High Perfumery Formulations & Artisanal Variations',
          ar: '٢. صياغة العطور الفاخرة والتباينات الحرفية الطبيعية',
        },
        paragraphs: [
          {
            en: 'All DAHR extraits de parfum (24%–40% pure olfactive concentration) are hand-compounded in small, numbered seasonal batches using wildcrafted natural botanicals, aged ouds, and pure amber resins.',
            ar: 'تصنع جميع خلاصات العطور النقية لدى DAHR (بتركيز ٢٤٪ إلى ٤٠٪) في دفعات موسمية محدودة ومرقمة باستخدام مواد طبيعية نادرة وخلاصات عود معتقة وراتنجات عنبرية أصيلة.',
          },
          {
            en: 'Due to the natural variation inherent in botanical crops (such as Taif Rose harvests or Royal Green Hojari frankincense tears), subtle variations in hue or harvest nuance may occur between batches. These natural variations do not represent defects but rather attest to the authenticity of pure raw materials.',
            ar: 'نظراً للطبيعة الحيوية للمحاصيل النباتية (كمواسم قطاف ورد الطائف أو دموع لبان الحوجري الأخضر)، قد يطرأ تباين طفيف في اللون أو الدرجة العطرية بين دفعة وأخرى، وهو ما يؤكد أصالة ونقاء المواد الخام المستخدمة.',
          },
        ],
      },
      {
        id: 'orders-pricing',
        heading: {
          en: '3. Order Placement, Pricing & Currency',
          ar: '٣. إبرام الطلبات والأسعار والعملات',
        },
        paragraphs: [
          {
            en: 'Prices are listed in Saudi Riyals (SAR) or US Dollars (USD) as selected, inclusive of all applicable Value Added Tax (VAT) in accordance with the regulations of the Zakat, Tax and Customs Authority (ZATCA) of Saudi Arabia.',
            ar: 'تُعرض الأسعار بالريال السعودي (SAR) أو الدولار الأمريكي (USD) بحسب الاختيار، شاملة ضريبة القيمة المضافة (VAT) المطبقة وفق لوائح هيئة الزكاة والضريبة والجمارك بالمملكة العربية السعودية.',
          },
          {
            en: 'DAHR reserves the right to decline or cancel any order in instances of suspected fraudulent transactions, unauthorized commercial resale, or inventory allocation limitations on rare signature editions.',
            ar: 'تحتفظ الدار بحق رفض أو إلغاء أي طلب في حالات الاشتباه في العمليات غير المصرح بها، أو محاولات إعادة البيع التجاري دون ترخيص، أو نفاذ الحصص المخصصة للإصدارات الاستثنائية المحدودة.',
          },
        ],
      },
      {
        id: 'intellectual-property',
        heading: {
          en: '4. Intellectual Property & Olfactive Formulations',
          ar: '٤. الملكية الفكرية وتصميم العبوات والهوية',
        },
        paragraphs: [
          {
            en: 'All content, including olfactive formula naming, bottle silhouette geometries, custom typography, editorial monographs, imagery, and soundscapes, are the exclusive intellectual property of DAHR and protected under international copyright and trademark laws.',
            ar: 'تعد جميع المحتويات والعلامات التجارية، بما في ذلك أسماء العطور، وتصاميم الزجاجات الكريستالية، والخطوط الطباعية، والمقالات التحريرية، والصور، ملكية فكرية حصرية لدار DAHR ومحمية بأنظمة الملكية الفكرية الدولية.',
          },
        ],
      },
      {
        id: 'governing-law',
        heading: {
          en: '5. Governing Law & Dispute Resolution',
          ar: '٥. النظام الحاكم والاختصاص القضائي',
        },
        paragraphs: [
          {
            en: 'These Terms of Service are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia. Any dispute arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Riyadh.',
            ar: 'تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، وتختص المحاكم المعنية في مدينة الرياض بالنظر في أي نزاع ينشأ عنها.',
          },
        ],
      },
    ],
  },

  'shipping-returns': {
    id: 'legal-shipping-returns',
    routeId: 'shipping-returns',
    category: {
      en: 'LOGISTICS & CLIENT SERVICE PROTOCOL',
      ar: 'بروتوكول الخدمات اللوجستية وعناية العملاء',
    },
    title: {
      en: 'Climate-Controlled Shipping & Returns Policy',
      ar: 'سياسة الشحن المناخي المتخصص والاسترجاع',
    },
    excerpt: {
      en: 'Protocols for temperature-controlled transit, protective packaging, complimentary GCC delivery, and our 14-day archival inspection guarantee for luxury perfumery.',
      ar: 'بروتوكولات الشحن المبرد، والتغليف الوقائي المزدوج، والتوصيل المميز في المملكة ودول الخليج، وضمان المعاينة لمدة ١٤ يوماً للعطور الفاخرة.',
    },
    lastUpdated: 'August 2026',
    effectiveDate: 'August 15, 2026',
    disclaimer: {
      en: 'STARTING TEMPLATE FOR LEGAL REVIEW — This shipping and return guideline outlines operational white-glove transport logistics. It is subject to merchant carrier agreements and local consumer protection regulations.',
      ar: 'نموذج مبدئي للمراجعة القانونية — توضح هذه السياسة الإجراءات التشغيلية لخدمات الشحن المبرد والاسترجاع، وتخضع لاتفاقيات النقل ولوائح حماية المستهلك المعمول بها.',
    },
    sections: [
      {
        id: 'climate-shipping',
        heading: {
          en: '1. Climate-Controlled Cold-Chain Transit',
          ar: '١. الشحن المناخي المبرد (سلسلة التبريد الفاخرة)',
        },
        paragraphs: [
          {
            en: 'High-concentration extraits de parfum (containing pure botanical absolutes and rare natural ouds) are sensitive to extreme temperature fluctuations. All DAHR domestic and international dispatches utilize temperature-regulated courier containers to preserve olfactory integrity from our atelier to your salon.',
            ar: 'تتأثر خلاصات العطور النقية ذات التركيز العالي بالتقلبات الحرارية الشديدة. لذلك تُشحن كافة طرود DAHR داخل مركبات وحافظات مبردة ومضبوطة حرارياً لضمان سلامة ونقاء الجزيئات العطرية حتى وصولها.',
          },
          {
            en: 'Domestic (Saudi Arabia): Complimentary next-day white-glove delivery across Riyadh, and 48-hour delivery across Jeddah, Dammam, Al-Khobar, and other major cities.',
            ar: 'داخل المملكة العربية السعودية: توصيل مجاني سريع خلال ٢٤ ساعة في الرياض، وخلال ٤٨ ساعة لجدة والدمام والخبر وكافة المناطق الرئيسية.',
          },
          {
            en: 'GCC & International: 2–4 business days via express climate airfreight (UAE, Kuwait, Qatar, Bahrain, Oman, and global destinations).',
            ar: 'دول الخليج والشحن الدولي: من ٢ إلى ٤ أيام عمل عبر الشحن الجوي المبرد السريع إلى الإمارات والكويت وقطر والبحرين وعمان والوجهات العالمية.',
          },
        ],
      },
      {
        id: 'packaging-presentation',
        heading: {
          en: '2. Protective Architectural Packaging',
          ar: '٢. التغليف الوقائي المعماري المزدوج',
        },
        paragraphs: [
          {
            en: 'Each flacon is cradled within a rigid, custom-molded foam cavity, encased in a heavy-weight textured box, and secured with a tamper-evident holographic seal to ensure pristine arrival condition.',
            ar: 'تستقر كل زجاجة عطر داخل قالب امتصاص صدمات مخصص، محاطة بعلبة فاخرة ذات ملمس محكم، ومختومة بختم أمان ثلاثي الأبعاد لضمان وصولها بحالة مثالية.',
          },
        ],
      },
      {
        id: 'return-policy',
        heading: {
          en: '3. 14-Day Return & Exchange Protocol',
          ar: '٣. بروتوكول الاسترجاع والاستبدال خلال ١٤ يوماً',
        },
        paragraphs: [
          {
            en: 'In accordance with consumer health regulations for personal cosmetics and fine perfumery, full-size bottles are eligible for return or exchange within 14 calendar days of delivery, provided the outer cellophane and holographic tamper seal remain entirely unbroken and intact.',
            ar: 'امتثالاً للاشتراطات الصحية للعطور الفاخرة، يحق للعميل طلب استرجاع أو استبدال الزجاجات الكاملة خلال ١٤ يوماً من تاريخ الاستلام، شريطة أن يكون الغلاف السولوفاني وختم الأمان بحالتهما الأصلية المغلقة تماماً.',
          },
          {
            en: 'Complimentary Sampling Included: Each full-size fragrance purchase is accompanied by a complimentary 2ml matching sample vial. We invite you to experience the fragrance using the sample before breaking the seal of the full-size presentation flacon.',
            ar: 'عينة تجربة مجانية مرفقة: يرافق كل زجاجة كاملة عينة تجريبية مجانية سعة ٢ مل من نفس العطر، نرجو تجربتها أولاً قبل فك ختم الزجاجة الرئيسية لضمان إمكانية الاسترجاع عند الرغبة.',
          },
        ],
      },
      {
        id: 'damaged-transit',
        heading: {
          en: '4. Damaged In-Transit Guarantee',
          ar: '٤. ضمان التعويض الفوري عن أضرار الشحن',
        },
        paragraphs: [
          {
            en: 'In the rare event that a package arrives with visible structural or flacon damage, contact our concierge immediately at concierge@dahr.luxury with a photograph of the damage. A priority complimentary replacement will be dispatched within 24 hours.',
            ar: 'في الحالات النادرة التي قد يتعرض فيها الطرد لأي تلف أثناء الشحن، يرجى التواصل فوراً مع الكونسيرج عبر concierge@dahr.luxury مع إرفاق صورة للتلف، وسيتم إرسال بديل فوري مجاناً خلال ٢٤ ساعة.',
          },
        ],
      },
    ],
  },
};
