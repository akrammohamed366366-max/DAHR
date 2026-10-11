import { Product, JournalArticle } from '../types/backend';
import { generateProductSearchKeywords } from '../utils/searchKeywords';

const RAW_SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-oud-al-waqt',
    name: {
      en: 'Oud Al-Waqt (Time & Agarwood)',
      ar: 'عود الوقت',
    },
    shortDescriptor: {
      en: 'Rare Cambodian Wild Oud & Smoked Birch Extrait',
      ar: 'خلاصة عود كمبودي بري معتّق مع بتولا مدخنة',
    },
    longDescription: {
      en: 'An architectural study of time and density. Distilled from wild 30-year aged Cambodian agarwood resin, tempered with dry Siberian birch smoke, and suspended in grey ambergris.',
      ar: 'دراسة معمارية في كثافة الزمن وشذى الأخشاب. مقطر من راتنج العود الكمبودي البري المعتق لأكثر من 30 عاماً، وممزوج بدخان خشب البتولا والعنبر الرمادي الطبيعي.',
    },
    scentFamily: 'Woody',
    notes: {
      top: {
        en: 'Wild Cambodian Oud, Saffron Stigmas',
        ar: 'عود كمبودي بري، مياسم الزعفران النقي',
      },
      heart: {
        en: 'Smoked Birch Bark, Atlas Cedar, Dark Rose',
        ar: 'لحاء البتولا المدخن، خشب أرز الأطلس، ورد داكن',
      },
      base: {
        en: 'Grey Ambergris, Aged Leather, Resinous Labdanum',
        ar: 'عنبر خام رمادي، جلود معتقة، راتنج اللادن',
      },
    },
    sizes: [
      { size: '50ml', price: 260, stock: 24 },
      { size: '100ml', price: 340, stock: 18 },
    ],
    images: ['/assets/products/oud_al_waqt_hero.jpg'],
    flags: {
      isNew: true,
      isSignature: true,
      isFeatured: true,
    },
    status: 'active',
    createdAt: '2026-08-01T08:00:00.000Z',
    updatedAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'prod-taif-dawn',
    name: {
      en: 'Taif Dawn Rose',
      ar: 'ورد الطائف فجراً',
    },
    shortDescriptor: {
      en: 'Solar Highland Rose Petals & Pink Peppercorn',
      ar: 'بتلات ورد الهدا الجبلي مع الفلفل الوردي والمسك الأبيض',
    },
    longDescription: {
      en: 'Captured in the misty highlands of Al Hada at 5:00 AM before the desert heat awakens. A bright, dewy, photorealistic 30-petal rose laced with pink peppercorn and sheer white musk.',
      ar: 'قُطفت بتلاته عند الخامسة فجراً في مرتفعات الهدا بالطائف قبل أن يلامسها ضياء الشمس الحار. ورد جبلي ندي ثلاثيني البتلات مع رشة فلفل وردي ومسك نقي.',
    },
    scentFamily: 'Floral',
    notes: {
      top: {
        en: 'Highland Taif Rose, Sparkling Pink Peppercorn',
        ar: 'ورد طائفي جبلي، فلفل وردي متلألئ',
      },
      heart: {
        en: 'Centifolia Rose, Hedione, Morning Greenery',
        ar: 'ورد سنتيفوليا غراسي، هيديون، خضرة صباحية',
      },
      base: {
        en: 'White Musk, Crisp Cedarwood, Amber Crystal',
        ar: 'مسك أبيض نظيف، خشب الأرز النقي، بلورات العنبر',
      },
    },
    sizes: [
      { size: '50ml', price: 210, stock: 35 },
      { size: '100ml', price: 280, stock: 22 },
    ],
    images: ['/assets/products/taif_dawn_hero.jpg'],
    flags: {
      isNew: false,
      isSignature: true,
      isFeatured: true,
    },
    status: 'active',
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-22T11:00:00.000Z',
  },
  {
    id: 'prod-santalum-asir',
    name: {
      en: 'Santalum Asir',
      ar: 'صندل عسير',
    },
    shortDescriptor: {
      en: 'Velvet Mysore Sandalwood & Mountain Juniper',
      ar: 'خشب صندل مايسور مخملي مع عرعر جبال عسير',
    },
    longDescription: {
      en: 'A tribute to the juniper-capped summits of the Asir range. Creamy, buttery Mysore sandalwood interwoven with wild mountain juniper needles, green cardamom, and golden frankincense resin.',
      ar: 'تحية لقمم جبال عسير المغطاة بأشجار العرعر العتيقة. خشب صندل مايسور كريمي دافئ يتداخل مع إبر العرعر الأخضر، حب الهال الأخضر، واللبان الذهبي.',
    },
    scentFamily: 'Woody',
    notes: {
      top: {
        en: 'Green Cardamom, Wild Juniper Berries',
        ar: 'حب الهال الأخضر، توت العرعر البري',
      },
      heart: {
        en: 'Mysore Sandalwood, Papyrus, Hojari Frankincense',
        ar: 'خشب صندل مايسور، بردي، لبان حوجري عماني',
      },
      base: {
        en: 'Virginian Cedar, Cashmeran, Tonka Bean',
        ar: 'أرز فرجينيا، كشميران ناعم، حبوب التونكا',
      },
    },
    sizes: [
      { size: '50ml', price: 240, stock: 15 },
      { size: '100ml', price: 320, stock: 12 },
    ],
    images: ['/assets/products/santalum_asir_hero.jpg'],
    flags: {
      isNew: false,
      isSignature: false,
      isFeatured: true,
    },
    status: 'active',
    createdAt: '2026-08-03T10:00:00.000Z',
    updatedAt: '2026-08-25T14:00:00.000Z',
  },
  {
    id: 'prod-ambra-nocturne',
    name: {
      en: 'Ambra Nocturne',
      ar: 'عنبر الليل',
    },
    shortDescriptor: {
      en: 'Aged Grey Ambergris & Golden Labdanum Extrait (40%)',
      ar: 'خلاصة عنبر خام رمادي مع لادن بلسمي بتركيز 40%',
    },
    longDescription: {
      en: 'A nocturnal meditation on mineral ocean warmth and golden amber resin. Concentrated at an uncompromising 40% extrait de parfum, delivering a lingering sillage of salted skin, vanilla bean, and antique balsam.',
      ar: 'تأمل ليلي في دفء العنبر البحري النادر والتراكيب الراتنجية الذهبية. صيغ بتركيز استثنائي 40% خلاصة عطرية نقية ليمنح فوحاناً أسطورياً من الفانيليا والبلسم العتيق.',
    },
    scentFamily: 'Amber',
    notes: {
      top: {
        en: 'Bergamot Zest, Sea Salt, Bitter Orange',
        ar: 'بشر البرغموت الإيطالي، ملح بحري، برتقال مر',
      },
      heart: {
        en: 'Golden Amber Resin, Myrrh, Cistus Flower',
        ar: 'راتنج العنبر الذهبي، المر، زهر القستوس',
      },
      base: {
        en: 'Grey Ambergris, Bourbon Vanilla, Benzoin Siam',
        ar: 'عنبر رمادي طبيعي، فانيليا بوربون، بنزوين سيام',
      },
    },
    sizes: [
      { size: '50ml', price: 310, stock: 10 },
      { size: '100ml', price: 390, stock: 8 },
    ],
    images: ['/assets/products/ambra_nocturne_hero.jpg'],
    flags: {
      isNew: true,
      isSignature: true,
      isFeatured: true,
    },
    status: 'active',
    createdAt: '2026-08-04T11:00:00.000Z',
    updatedAt: '2026-08-26T16:00:00.000Z',
  },
  {
    id: 'prod-hojari-incense',
    name: {
      en: 'Hojari Sovereign',
      ar: 'لبان الحوجري السامي',
    },
    shortDescriptor: {
      en: 'Royal Green Hojari Frankincense & Black Pepper',
      ar: 'لبان حوجري ملكي أخضر مع فلفل أسود وزعفران',
    },
    longDescription: {
      en: 'Sourced exclusively from the limestone cliffs of Dhofar. Royal green Hojari frankincense tears distilled into a mineral, citrus-inflected smoke that radiates serene authority.',
      ar: 'حُصد حصرياً من جروف ظفار الكلسية. دموع اللبان الحوجري الأخضر الملكي مقطرة إلى بخور نقي متبل بالحمضيات والبهارات الباردة التي تشع هيبة وسكينة.',
    },
    scentFamily: 'Oriental',
    notes: {
      top: {
        en: 'Green Frankincense Tears, Crushed Black Pepper',
        ar: 'دموع اللبان الأخضر، فلفل أسود مدقوق',
      },
      heart: {
        en: 'Elemi Resin, Somalian Opoponax, Nutmeg',
        ar: 'راتنج الإيليمي، جاوي صومالي، جوزة الطيب',
      },
      base: {
        en: 'Cedarwood, Smoky Vetiver, Pure Amber',
        ar: 'خشب الأرز، نجيل الهند الدخاني، عنبر نقي',
      },
    },
    sizes: [
      { size: '50ml', price: 230, stock: 19 },
      { size: '100ml', price: 310, stock: 14 },
    ],
    images: ['/assets/products/hojari_sovereign_hero.jpg'],
    flags: {
      isNew: false,
      isSignature: false,
      isFeatured: true,
    },
    status: 'active',
    createdAt: '2026-08-05T12:00:00.000Z',
    updatedAt: '2026-08-27T09:00:00.000Z',
  },
  {
    id: 'prod-musk-al-qamar',
    name: {
      en: 'Musk Al-Qamar (Lunar Silk)',
      ar: 'مسك القمر',
    },
    shortDescriptor: {
      en: 'White Crystalline Musk, Orris Butter & Ambrette',
      ar: 'مسك بلوري نقي مع زبدة السوسن الإيطالي وبذور العنبر',
    },
    longDescription: {
      en: 'A skin-close, second-skin veil of absolute purity. Florentine orris butter and botanical ambrette seeds blend into a silky cocoon of white crystalline musk and cashmere wood.',
      ar: 'وشاح جلدي حميم من النقاء المطلق. تمتزج زبدة زهرة السوسن الفلورنسي مع بذور الأمبريت النباتية في شرنقة حريرية من المسك البلوري وأخشاب الكشمير.',
    },
    scentFamily: 'Musk',
    notes: {
      top: {
        en: 'Ambrette Seed, White Angelica Root',
        ar: 'بذور الأمبريت، جذور حشيشة الملاك البيضاء',
      },
      heart: {
        en: 'Florentine Orris Butter, Silk Flower, Heliotrope',
        ar: 'زبدة السوسن الفلورنسي، زهر الحرير، رقيب الشمس',
      },
      base: {
        en: 'White Crystalline Musk, Cashmere Wood, Benzoin',
        ar: 'مسك بلوري ناصع، خشب الكشمير، بنزوين ناعم',
      },
    },
    sizes: [
      { size: '50ml', price: 250, stock: 20 },
      { size: '100ml', price: 330, stock: 16 },
    ],
    images: ['/assets/products/musk_al_qamar_hero.jpg'],
    flags: {
      isNew: true,
      isSignature: false,
      isFeatured: false,
    },
    status: 'active',
    createdAt: '2026-08-06T13:00:00.000Z',
    updatedAt: '2026-08-27T10:00:00.000Z',
  },
  {
    id: 'prod-citrus-rub-al-khali',
    name: {
      en: 'Oasis Mirage',
      ar: 'سراب الواحة',
    },
    shortDescriptor: {
      en: 'Wild Desert Citrus, Green Petitgrain & Neroli',
      ar: 'حمضيات برية منعشة مع بتيت غران وزهر البرتقال النيرولي',
    },
    longDescription: {
      en: 'The startling freshness of a secluded desert spring. Cold-pressed green mandarin and sunlit Tunisian neroli rested on a bed of dry vetiver roots and mineral white cedar.',
      ar: 'انتعاش مفاجئ كينبوع ماء في واحة صحراوية منعزلة. مندرين أخضر معصور على البارد وزهر البرتقال التونسي المشرق مستقران على قاعدة من نجيل الهند والأرز الأبيض.',
    },
    scentFamily: 'Fresh',
    notes: {
      top: {
        en: 'Cold-Pressed Green Mandarin, Calabrian Bergamot',
        ar: 'مندرين أخضر معصور على البارد، برغموت كالابريا',
      },
      heart: {
        en: 'Tunisian Neroli, Bitter Orange Petitgrain, Mint',
        ar: 'نيرولي تونسي، بتيت غران البرتقال المر، نعناع بري',
      },
      base: {
        en: 'Haitian Vetiver, White Amber, Light Cedar',
        ar: 'نجيل الهند الهايتي، عنبر أبيض، أرز خفيف',
      },
    },
    sizes: [
      { size: '50ml', price: 195, stock: 30 },
      { size: '100ml', price: 270, stock: 25 },
    ],
    images: ['/assets/products/oasis_mirage_hero.jpg'],
    flags: {
      isNew: false,
      isSignature: false,
      isFeatured: false,
    },
    status: 'active',
    createdAt: '2026-08-07T14:00:00.000Z',
    updatedAt: '2026-08-28T11:00:00.000Z',
  },
];

export const SEED_PRODUCTS: Product[] = RAW_SEED_PRODUCTS.map((prod) => ({
  ...prod,
  searchKeywords: generateProductSearchKeywords(prod),
}));

export const SEED_JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'article-taif-dawn-harvest',
    title: {
      en: 'The Dawn Harvest of Taif: 30-Petal Roses in the Mist',
      ar: 'قطاف الفجر في الطائف: أسرار الورد الثلاثيني بين ضباب الهدا',
    },
    excerpt: {
      en: 'A pilgrimage to the Al Hada escarpment at 5:00 AM, where ancestral copper stills distill fleeting aromatic volatiles before the Arabian sun rises.',
      ar: 'رحلة إلى منحدرات الهدا الجبلية عند الخامسة فجراً، حيث تُقطف البتلات الندية وتقطر في قدور النحاس العتيقة قبل بزوغ شمس الجزيرة.',
    },
    body: {
      en: `High in the Sarawat mountain range, perched over 2,000 meters above sea level, the rose valleys of Taif operate on an ancient calendar. For roughly thirty days in late winter and early spring, before the searing desert sun breaches the horizon, harvesters move quietly between thorny terraces.

Each flower of the Rosa damascena trigintipetala—the legendary 30-petal Taif rose—must be hand-plucked while bathed in dew. Once the morning sun touches the petals, the light volatile esters that give Taif rose its unmistakable peppery, crisp freshness evaporate into the thin mountain air.

In the DAHR formulation laboratory, this exquisite essential oil is never heat-stressed. We pair the immediate highland distillation directly with cold-macerated extraits, preserving the complete living spectrum of the flower.`,
      ar: `في أعالي جبال السروات، على ارتفاع يتجاوز ألفي متر عن سطح البحر، تخضع بساتين الطائف لتقويم شمسي متوارث منذ قرون. ولمدة ثلاثين يوماً فقط بين أواخر الشتاء ومطالع الربيع، وقبل أن تشرق شمس الصحراء اللاهبة، يتحرك المزارعون بصمت بين المدرجات الجبلية.

كل زهرة من ورد الطائف الثلاثيني الشهير تُقطف باليد وهي مبللة بندى الفجر. فبمجرد أن تلامس أشعة الشمس البتلات، تبدأ الإسترات العطرية الخفيفة التي تمنح ورد الطائف نكهته الفلفلية المنعشة بالتبخر في هواء الجبل الرقيق.

في مختبرات دار DAHR، نحرص على عدم تعريض هذا الزيت النادر لأي حرارة مفرطة، حيث ندمج ناتج التقطير الفوري مع خلاصات معتقة على البارد لنحفظ الطيف الحي الكامل للوردة كما هي في بستانها.`,
    },
    heroImage: '/assets/journal/taif_harvest.jpg',
    status: 'published',
    publishedAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'article-cambodian-oud-aging',
    title: {
      en: 'Decade-Aged Agarwood: The Chemistry of Patience',
      ar: 'تعتيق العود الكمبودي: كيمياء الصبر والزمن في أخشاب الأرز',
    },
    excerpt: {
      en: 'How ten years in temperature-controlled Lebanese cedar barrels transforms wild resin from sharp animalic intensity to smooth velvet smoke.',
      ar: 'كيف يحول التعتيق لمدة عشر سنوات في براميل خشب الأرز الراتنج البري الحاد إلى دخان مخملي دافئ وفخم.',
    },
    body: {
      en: `Raw, wild agarwood oil immediately post-hydrodistillation is vibrant, loud, and frequently untamed. It possesses high notes of barnyard phenolic compounds and sharp medicinal terpenoids that can overwhelm the human olfactory palate.

Patience is the sole catalyst of luxury. By conditioning wild Cambodian resin in seasoned barrels crafted from Lebanese cedarwood for a minimum of 120 months, natural polymerization takes place. 

The lighter monoterpenes gradually oxidize and soften, while heavier sesquiterpenes harmonize with the natural cedrene notes of the wood. The result is Oud Al-Waqt: an extrait with zero harshness, delivering only serene, dark, resinous leather and noble smoke.`,
      ar: `إن دهن العود البري الصافي فور تقطيره يكون حاداً وصاخباً ومليئاً بالمركبات العضوية البرية التي قد تبدو قاسية على حاسة الشم.

إن الصبر هو العنصر الجوهري الوحيد في صناعة الفخامة الحقيقية. من خلال تعتيق راتنج العود الكمبودي في براميل مصنوعة من خشب أرز لبنان المعتق لما لا يقل عن 120 شهراً، تحدث عمليات أكسدة وتناغم كيميائي طبيعي.

تتلاشى الحدة النفاذة تدريجياً لتبرز الجزيئات الثقيلة التي تتمازج مع خشب الأرز، مانحةً عطر "عود الوقت" سمته الفريدة: فوحان ناعم كالمخمل يخلو من أي فجاجة، مفعم بالجلد والراتنج والدخان النبيل.`,
    },
    heroImage: '/assets/journal/oud_aging.jpg',
    status: 'published',
    publishedAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'article-green-hojari-frankincense',
    title: {
      en: 'The Green Tears of Dhofar: Sourcing Royal Hojari Resin',
      ar: 'دموع ظفار الخضراء: حكاية استخراج اللبان الحوجري الملكي',
    },
    excerpt: {
      en: 'Exploring the arid limestone valleys of southern Oman where the rarest pale green Boswellia sacra resin crystals are harvested by hand.',
      ar: 'استكشاف وديان صلالة وظفار الكلسية حيث تُجمع دموع شجرة اللبان المقدسة ذات اللون الأخضر النادر يدوياً.',
    },
    body: {
      en: `Not all frankincense is created equal. In the desert rain-shadow of the Dhofar mountain plateau, the Boswellia sacra trees struggle against extreme drought and intense heat. This ecological stress produces the highest concentration of boswellic acids and volatile alpha-pinene.

The highest grade, known as Royal Hojari, appears as translucent, pale celadon-green tears. Unlike standard incense that turns bitter upon burning, Hojari carries natural facets of lime zest, eucalyptus, pine, and crystalline white smoke.

In our bespoke compositions, Hojari frankincense acts as an olfactive elevator, lifting heavy oud and amber foundations into high-frequency celestial clarity.`,
      ar: `ليس كل اللبان سواء. ففي الوديان الصحراوية الواقعة خلف جبال ظفار في سلطنة عُمان، تصارع أشجار "بوسويليا ساكرا" الجفاف والحرارة الشديدة، وهذا الإجهاد البيئي هو ما يدفع الشجرة لإفراز أنقى الراتنجات المشبعة بأحماض اللبان والألفا-باينين.

تُعرف الدرجة الأسمى باسم "اللبان الحوجري الأخضر الملكي"، وتبدو دموعه كبلورات زمردية شفافة. وخلافاً للبان التجاري العادي، يمتاز الحوجري بنكهات طبيعية من قشر الليمون الأخضر، الصنوبر، والأوكالبتوس مع بخور أبيض نقي كالبلور.

في تراكيب DAHR، يعمل اللبان الحوجري كجسر شذي يرفع نوتات العود والعنبر الثقيلة نحو فضاءات من النقاء والصفاء الروحي.`,
    },
    heroImage: '/assets/journal/hojari_frankincense.jpg',
    status: 'published',
    publishedAt: '2026-08-22T11:30:00.000Z',
  },
  {
    id: 'article-architecture-of-sillage',
    title: {
      en: 'The Architecture of Sillage: Formulating at 40% Concentration',
      ar: 'معمارية الفوحان: أسرار الصياغة بتركيز 40% خلاصة عطرية نقية',
    },
    excerpt: {
      en: 'Why modern commercial perfumery dilutes essence to 12%, and how DAHR preserves the integrity of pure Extrait de Parfum.',
      ar: 'لماذا تلجأ العطور التجارية إلى التخفيف بنسبة 12%، وكيف تحافظ دار DAHR على النقاء المطلق بتركيزات الـ Extrait.',
    },
    body: {
      en: `Most commercial luxury fragrances today are formulated as Eau de Toilette (8-12%) or standard Eau de Parfum (15-18%), using synthetic fixatives to simulate longevity while cutting the volume of genuine botanical oils.

DAHR rejects the paradigm of dilution. By formulating between 24% and 40% pure aromatic compounds (Extrait de Parfum), we allow the natural evaporation curve of heavy raw materials—such as aged ambergris, wild orris butter, and Cambodian agarwood—to unfold organically over 18 to 24 hours.

The result is not an aggressive or headache-inducing projection, but rather an intimate, luxurious aura—an olfactive architecture that stays with the wearer through dusk and dawn.`,
      ar: `تُصاغ معظم العطور التجارية المعاصرة بنسب تخفيف تتراوح بين 8% و18% (Eau de Parfum)، مع الاعتماد على المثبتات الصناعية لتعويض نقص الزيوت الطبيعية الأصلية.

ترفض دار DAHR مبدأ التخفيف التجاري. فمن خلال صياغة عطورنا بتركيزات تتراوح بين 24% وتصل إلى 40% خلاصة عطرية نقية (Extrait de Parfum)، نتيح للمواد الخام الثقيلة كالعنبر الطبيعي، زبدة السوسن، والعود الكمبودي أن تتنفس وتتطور بتدرج طبيعي على مدار 18 إلى 24 ساعة.

والنتيجة ليست فوحاناً مزعجاً أو حاداً، بل هالة شذية حميمة فائقة الرقي والهدوء ترافق صاحبها من الغسق إلى مطلع الفجر.`,
    },
    heroImage: '/assets/journal/architecture_sillage.jpg',
    status: 'published',
    publishedAt: '2026-08-25T14:00:00.000Z',
  },
];
