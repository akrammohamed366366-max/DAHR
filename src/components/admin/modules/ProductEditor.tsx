import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Layers,
  AlertCircle,
  HelpCircle,
  Star,
  Flame,
  Clock,
  Link,
} from 'lucide-react';
import { Product, ScentFamily, ProductSizeVariant, ProductStatus } from '../../../types/backend';
import { FormFieldGroup } from '../FormFieldGroup';
import { MissingLanguageModal, MissingFieldItem, getLanguageFieldStatus } from '../MissingLanguageModal';
import { generateProductSearchKeywords } from '../../../utils/searchKeywords';
import { uploadProductImage } from '../../../utils/storageUpload';
import { useI18n } from '../../../i18n/context';

export interface ProductEditorProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  id?: string;
}

const SCENT_FAMILIES: { value: ScentFamily; labelEn: string; labelAr: string }[] = [
  { value: 'Woody', labelEn: 'Woody (الأخشاب العطرية)', labelAr: 'خشبية (الأخشاب العطرية)' },
  { value: 'Floral', labelEn: 'Floral (الأزهار النقية)', labelAr: 'زهرية (الأزهار النقية)' },
  { value: 'Oriental', labelEn: 'Oriental (الشرقية الفاخرة)', labelAr: 'شرقية (الشرقية الفاخرة)' },
  { value: 'Fresh', labelEn: 'Fresh (الحمضيات والانتعاش)', labelAr: 'منعشة (الحمضيات والانتعاش)' },
  { value: 'Amber', labelEn: 'Amber (العنبرية والبلسم)', labelAr: 'عنبرية (العنبرية والبلسم)' },
  { value: 'Musk', labelEn: 'Musk (المسك النقي)', labelAr: 'مسكية (المسك النقي)' },
];

const PRESET_ATELIER_IMAGES = [
  { name: 'Oud Al-Waqt Bottle', url: '/assets/products/oud_al_waqt_hero.jpg' },
  { name: 'Taif Dawn Rose', url: '/assets/products/taif_dawn_hero.jpg' },
  { name: 'Amber Sultani Flacon', url: '/assets/products/amber_sultani_hero.jpg' },
  { name: 'Musk Al-Layl Noir', url: '/assets/products/musk_al_layl_hero.jpg' },
  { name: 'Pure Extrait Laboratory', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Smoked Glass Flacon', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Ambergris & Wood Still', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop' },
];

export const ProductEditor: React.FC<ProductEditorProps> = ({
  isOpen,
  product,
  onClose,
  onSave,
  id = 'product-editor-modal',
}) => {
  const { locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Product>({
    id: '',
    name: { en: '', ar: '' },
    shortDescriptor: { en: '', ar: '' },
    longDescription: { en: '', ar: '' },
    scentFamily: 'Woody',
    notes: {
      top: { en: '', ar: '' },
      heart: { en: '', ar: '' },
      base: { en: '', ar: '' },
    },
    sizes: [
      { size: '50ml', price: 240, stock: 20 },
      { size: '100ml', price: 340, stock: 15 },
    ],
    images: [],
    flags: {
      isNew: false,
      isSignature: false,
      isFeatured: false,
    },
    status: 'active',
    searchKeywords: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'inventory' | 'media'>('details');
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [activeMissingFields, setActiveMissingFields] = useState<MissingFieldItem[]>([]);

  // Initialize or reset form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        name: { en: product.name?.en || '', ar: product.name?.ar || '' },
        shortDescriptor: { en: product.shortDescriptor?.en || '', ar: product.shortDescriptor?.ar || '' },
        longDescription: { en: product.longDescription?.en || '', ar: product.longDescription?.ar || '' },
        scentFamily: product.scentFamily || 'Woody',
        notes: {
          top: { en: product.notes?.top?.en || '', ar: product.notes?.top?.ar || '' },
          heart: { en: product.notes?.heart?.en || '', ar: product.notes?.heart?.ar || '' },
          base: { en: product.notes?.base?.en || '', ar: product.notes?.base?.ar || '' },
        },
        sizes: product.sizes && product.sizes.length > 0 ? product.sizes : [{ size: '100ml', price: 280, stock: 10 }],
        images: product.images && product.images.length > 0 ? product.images : [],
        flags: {
          isNew: !!product.flags?.isNew,
          isSignature: !!product.flags?.isSignature,
          isFeatured: !!product.flags?.isFeatured,
        },
        status: product.status || 'active',
        searchKeywords: product.searchKeywords || [],
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      setFormData({
        id: newId,
        name: { en: '', ar: '' },
        shortDescriptor: { en: '', ar: '' },
        longDescription: { en: '', ar: '' },
        scentFamily: 'Woody',
        notes: {
          top: { en: '', ar: '' },
          heart: { en: '', ar: '' },
          base: { en: '', ar: '' },
        },
        sizes: [
          { size: '50ml', price: 240, stock: 25 },
          { size: '100ml', price: 340, stock: 15 },
        ],
        images: ['/assets/products/oud_al_waqt_hero.jpg'],
        flags: {
          isNew: true,
          isSignature: false,
          isFeatured: false,
        },
        status: 'active',
        searchKeywords: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    setErrors({});
    setActiveTab('details');
  }, [product, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  // Validation
  const validateForm = (): { isValid: boolean; newErrors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.en.trim()) {
      newErrors['name.en'] = 'English fragrance name is required.';
    }
    if (!formData.name.ar.trim()) {
      newErrors['name.ar'] = 'Arabic fragrance name is required (الاسم العربي مطلوب).';
    }

    if (!formData.shortDescriptor.en.trim()) {
      newErrors['shortDescriptor.en'] = 'English short descriptor is required.';
    }
    if (!formData.shortDescriptor.ar.trim()) {
      newErrors['shortDescriptor.ar'] = 'Arabic short descriptor is required (الوصف الموجز مطلوب).';
    }

    if (!formData.longDescription.en.trim()) {
      newErrors['longDescription.en'] = 'English narrative story is required.';
    }
    if (!formData.longDescription.ar.trim()) {
      newErrors['longDescription.ar'] = 'Arabic narrative story is required (الوصف التفصيلي مطلوب).';
    }

    // Individual bilingual validation for olfactive pyramid notes
    if (!formData.notes.top.en.trim()) {
      newErrors['notes.top.en'] = 'English top notes are required.';
    }
    if (!formData.notes.top.ar.trim()) {
      newErrors['notes.top.ar'] = 'Arabic top notes are required (الافتتاحية العطرية بالعربية مطلوبة).';
    }

    if (!formData.notes.heart.en.trim()) {
      newErrors['notes.heart.en'] = 'English heart notes are required.';
    }
    if (!formData.notes.heart.ar.trim()) {
      newErrors['notes.heart.ar'] = 'Arabic heart notes are required (قلب العطر بالعربية مطلوب).';
    }

    if (!formData.notes.base.en.trim()) {
      newErrors['notes.base.en'] = 'English base notes are required.';
    }
    if (!formData.notes.base.ar.trim()) {
      newErrors['notes.base.ar'] = 'Arabic base notes are required (قاعدة العطر بالعربية مطلوبة).';
    }

    if (!formData.sizes || formData.sizes.length === 0) {
      newErrors['sizes'] = 'At least one bottle size variant is required.';
    } else {
      formData.sizes.forEach((s, idx) => {
        if (!s.size.trim()) {
          newErrors[`size_${idx}_name`] = 'Size label is required (e.g. 50ml).';
        }
        if (s.price <= 0 || isNaN(s.price)) {
          newErrors[`size_${idx}_price`] = 'Price must be greater than $0.';
        }
        if (s.stock < 0 || isNaN(s.stock)) {
          newErrors[`size_${idx}_stock`] = 'Stock cannot be negative.';
        }
      });
    }

    if (!formData.images || formData.images.length === 0) {
      newErrors['images'] = 'At least one product photograph is required.';
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, newErrors };
  };

  // Inspects missing bilingual fields with their corresponding partner status
  const getMissingLanguageFields = (): MissingFieldItem[] => {
    const missing: MissingFieldItem[] = [];

    // Tab 1: Identity & Narrative
    if (!formData.name.en.trim()) {
      missing.push({
        id: 'input-name-en',
        fieldLabel: locale === 'ar' ? 'اسم العطر (الإنجليزية)' : 'Fragrance Name (English)',
        language: 'en',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.name.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.name.ar.trim()) {
      missing.push({
        id: 'input-name-ar',
        fieldLabel: locale === 'ar' ? 'اسم العطر (العربية)' : 'Fragrance Name (Arabic)',
        language: 'ar',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.name.en.trim() ? 'pending' : 'required',
      });
    }

    if (!formData.shortDescriptor.en.trim()) {
      missing.push({
        id: 'input-shortDescriptor-en',
        fieldLabel: locale === 'ar' ? 'الوصف الموجز (الإنجليزية)' : 'Short Descriptor (English)',
        language: 'en',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.shortDescriptor.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.shortDescriptor.ar.trim()) {
      missing.push({
        id: 'input-shortDescriptor-ar',
        fieldLabel: locale === 'ar' ? 'الوصف الموجز (العربية)' : 'Short Descriptor (Arabic)',
        language: 'ar',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.shortDescriptor.en.trim() ? 'pending' : 'required',
      });
    }

    if (!formData.longDescription.en.trim()) {
      missing.push({
        id: 'input-longDescription-en',
        fieldLabel: locale === 'ar' ? 'القصة العطرية والوصف (الإنجليزية)' : 'Narrative Olfactive Story (English)',
        language: 'en',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.longDescription.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.longDescription.ar.trim()) {
      missing.push({
        id: 'input-longDescription-ar',
        fieldLabel: locale === 'ar' ? 'القصة العطرية والوصف (العربية)' : 'Narrative Olfactive Story (Arabic)',
        language: 'ar',
        tabId: 'details',
        tabLabel: locale === 'ar' ? '1. البيانات والقصة العطرية' : '1. Identity & Narrative',
        status: formData.longDescription.en.trim() ? 'pending' : 'required',
      });
    }

    // Tab 2: Olfactive Notes
    if (!formData.notes.top.en.trim()) {
      missing.push({
        id: 'input-notes-top-en',
        fieldLabel: locale === 'ar' ? 'افتتاحية العطر (الإنجليزية)' : 'Top Notes (English)',
        language: 'en',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.top.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.notes.top.ar.trim()) {
      missing.push({
        id: 'input-notes-top-ar',
        fieldLabel: locale === 'ar' ? 'افتتاحية العطر (العربية)' : 'Top Notes (Arabic)',
        language: 'ar',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.top.en.trim() ? 'pending' : 'required',
      });
    }

    if (!formData.notes.heart.en.trim()) {
      missing.push({
        id: 'input-notes-heart-en',
        fieldLabel: locale === 'ar' ? 'قلب العطر (الإنجليزية)' : 'Heart Notes (English)',
        language: 'en',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.heart.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.notes.heart.ar.trim()) {
      missing.push({
        id: 'input-notes-heart-ar',
        fieldLabel: locale === 'ar' ? 'قلب العطر (العربية)' : 'Heart Notes (Arabic)',
        language: 'ar',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.heart.en.trim() ? 'pending' : 'required',
      });
    }

    if (!formData.notes.base.en.trim()) {
      missing.push({
        id: 'input-notes-base-en',
        fieldLabel: locale === 'ar' ? 'قاعدة العطر (الإنجليزية)' : 'Base Notes (English)',
        language: 'en',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.base.ar.trim() ? 'pending' : 'required',
      });
    }
    if (!formData.notes.base.ar.trim()) {
      missing.push({
        id: 'input-notes-base-ar',
        fieldLabel: locale === 'ar' ? 'قاعدة العطر (العربية)' : 'Base Notes (Arabic)',
        language: 'ar',
        tabId: 'notes',
        tabLabel: locale === 'ar' ? '2. الهرم العطري' : '2. Olfactive Notes',
        status: formData.notes.base.en.trim() ? 'pending' : 'required',
      });
    }

    return missing;
  };

  const handleNavigateToMissingField = (item: MissingFieldItem) => {
    setMissingModalOpen(false);
    if (item.tabId) {
      setActiveTab(item.tabId as any);
    }
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingLanguageFields = getMissingLanguageFields();

    // If one or more language fields are empty, trigger the modal confirmation immediately
    if (missingLanguageFields.length > 0) {
      setActiveMissingFields(missingLanguageFields);
      setMissingModalOpen(true);
      validateForm(); // Apply inline validation error states across form
      return;
    }

    const { isValid, newErrors: validationErrors } = validateForm();
    if (!isValid) {
      // Auto-switch to tab with first error using freshly computed errors object
      if (
        validationErrors['name.en'] ||
        validationErrors['name.ar'] ||
        validationErrors['shortDescriptor.en'] ||
        validationErrors['shortDescriptor.ar'] ||
        validationErrors['longDescription.en'] ||
        validationErrors['longDescription.ar']
      ) {
        setActiveTab('details');
      } else if (
        validationErrors['notes.top.en'] ||
        validationErrors['notes.top.ar'] ||
        validationErrors['notes.heart.en'] ||
        validationErrors['notes.heart.ar'] ||
        validationErrors['notes.base.en'] ||
        validationErrors['notes.base.ar']
      ) {
        setActiveTab('notes');
      } else if (Object.keys(validationErrors).some((k) => k.startsWith('size_') || k === 'sizes')) {
        setActiveTab('inventory');
      } else if (validationErrors['images']) {
        setActiveTab('media');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate updated search keywords automatically
      const generatedKeywords = generateProductSearchKeywords(formData);
      const payload: Product = {
        ...formData,
        searchKeywords: generatedKeywords,
        updatedAt: new Date().toISOString(),
      };
      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving product in editor:', err);
      setErrors({ submit: err.message || 'Failed to save product to Firestore.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Size Variant Handlers
  const handleAddSize = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: '30ml', price: 180, stock: 10 }],
    }));
  };

  const handleRemoveSize = (index: number) => {
    if (formData.sizes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleSizeChange = (index: number, field: keyof ProductSizeVariant, value: any) => {
    setFormData((prev) => {
      const nextSizes = [...prev.sizes];
      nextSizes[index] = {
        ...nextSizes[index],
        [field]: field === 'price' || field === 'stock' ? Number(value) : value,
      };
      return { ...prev, sizes: nextSizes };
    });
  };

  // Image Handlers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);
    setErrors((prev) => ({ ...prev, images: '' }));

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadProductImage(formData.id || 'new-product', file);
        uploadedUrls.push(url);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        images: 'Image upload encountered an error. Please verify the file or use a direct URL.',
      }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, customImageUrl.trim()],
    }));
    setCustomImageUrl('');
  };

  const handleSelectPresetImage = (url: string) => {
    if (formData.images.includes(url)) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...formData.images];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newImages.length) return;

    const temp = newImages[index];
    newImages[index] = newImages[targetIdx];
    newImages[targetIdx] = temp;

    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-heading`}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1A17]/60 backdrop-blur-[2px] transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Main Modal Shell */}
      <div
        className="
          relative w-full max-w-4xl max-h-[92vh] bg-[#FAF7F2] border border-[#E4DED3]
          rounded-[2px] shadow-2xl flex flex-col z-10 overflow-hidden text-start
          animate-in fade-in zoom-in-95 duration-150
        "
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DED3] bg-[#F5F1EA]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#A98860]/10 border border-[#A98860]/20 flex items-center justify-center text-[#A98860]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A736A]">
                {product ? (locale === 'ar' ? 'تعديل تركيبة العطر' : 'Edit Formulation') : (locale === 'ar' ? 'إضافة عطر جديد' : 'New Extrait Formulation')}
              </span>
              <h2 id={`${id}-heading`} className="text-[17px] font-serif text-[#1C1A17]">
                {formData.name.en || (locale === 'ar' ? 'عطر دار الجديد' : 'Untitled DAHR Fragrance')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bilingual Completion Badge */}
            {(() => {
              const enCount = [
                formData.name.en,
                formData.shortDescriptor.en,
                formData.longDescription.en,
                formData.notes.top.en,
                formData.notes.heart.en,
                formData.notes.base.en,
              ].filter((s) => s.trim().length > 0).length;

              const arCount = [
                formData.name.ar,
                formData.shortDescriptor.ar,
                formData.longDescription.ar,
                formData.notes.top.ar,
                formData.notes.heart.ar,
                formData.notes.base.ar,
              ].filter((s) => s.trim().length > 0).length;

              const isComplete = enCount === 6 && arCount === 6;

              return (
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-[10px] font-mono select-none ${
                    isComplete
                      ? 'bg-[#4B5D46]/10 border-[#4B5D46]/30 text-[#4B5D46]'
                      : 'bg-[#A98860]/10 border-[#A98860]/30 text-[#A98860]'
                  }`}
                  title={
                    locale === 'ar'
                      ? `حالة اللغتين: الإنجليزية (${enCount}/6) | العربية (${arCount}/6)`
                      : `Bilingual Completeness: EN (${enCount}/6) | AR (${arCount}/6)`
                  }
                >
                  <span className="font-medium">{locale === 'ar' ? 'اللغات:' : 'Bilingual:'}</span>
                  <span className={enCount === 6 ? 'font-bold' : 'opacity-80'}>EN {enCount}/6</span>
                  <span className="opacity-40">•</span>
                  <span className={arCount === 6 ? 'font-bold' : 'opacity-80'}>AR {arCount}/6</span>
                </div>
              );
            })()}

            {/* Status Selector in Header */}
            <div className="flex items-center bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: 'active' }))}
                className={`px-2.5 py-1 rounded-[1px] transition-colors ${
                  formData.status === 'active'
                    ? 'bg-[#4B5D46] text-white font-medium shadow-xs'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'نشط (معروض)' : 'Active (Public)'}
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: 'draft' }))}
                className={`px-2.5 py-1 rounded-[1px] transition-colors ${
                  formData.status === 'draft'
                    ? 'bg-[#7A736A] text-white font-medium shadow-xs'
                    : 'text-[#7A736A] hover:text-[#1C1A17]'
                }`}
              >
                {locale === 'ar' ? 'مسودة' : 'Draft (Private)'}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3]/60 rounded-[2px] transition-colors cursor-pointer"
              aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#E4DED3] bg-[#FAF7F2] px-6 gap-2 text-xs font-mono overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'details'
                ? 'border-[#A98860] text-[#1C1A17]'
                : 'border-transparent text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>1. {locale === 'ar' ? 'البيانات والقصة العطرية' : 'Identity & Narrative'}</span>
            {(errors['name.en'] || errors['name.ar'] || errors['shortDescriptor.en'] || errors['shortDescriptor.ar'] || errors['longDescription.en'] || errors['longDescription.ar']) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'notes'
                ? 'border-[#A98860] text-[#1C1A17]'
                : 'border-transparent text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>2. {locale === 'ar' ? 'الهرم العطري (النوتات)' : 'Olfactive Notes'}</span>
            {(errors['notes.top.en'] || errors['notes.top.ar'] || errors['notes.heart.en'] || errors['notes.heart.ar'] || errors['notes.base.en'] || errors['notes.base.ar']) && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'inventory'
                ? 'border-[#A98860] text-[#1C1A17]'
                : 'border-transparent text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>3. {locale === 'ar' ? 'الأحجام والأسعار والمخزون' : 'Sizes & Stock'}</span>
            {Object.keys(errors).some((k) => k.startsWith('size_') || k === 'sizes') && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'media'
                ? 'border-[#A98860] text-[#1C1A17]'
                : 'border-transparent text-[#7A736A] hover:text-[#1C1A17]'
            }`}
          >
            <span>4. {locale === 'ar' ? 'معرض الصور والاستوديو' : 'Imagery & Assets'}</span>
            {errors['images'] && <span className="w-1.5 h-1.5 rounded-full bg-[#8C3B2E]" />}
          </button>
        </div>

        {/* Global Error Notice */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#8C3B2E]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: IDENTITY & NARRATIVE */}
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in-50 duration-100">
              {/* Product SKU and Scent Family */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormFieldGroup label="Internal ID / SKU" helperText="Permanent Firestore ID">
                  <input
                    type="text"
                    disabled
                    value={formData.id}
                    className="w-full h-9 px-3 bg-[#E4DED3]/40 border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#7A736A]"
                  />
                </FormFieldGroup>

                <FormFieldGroup
                  label="Scent Family / العائلة العطرية"
                  required
                  helperText="Primary classification on storefront filter"
                >
                  <select
                    value={formData.scentFamily}
                    onChange={(e) => setFormData((p) => ({ ...p, scentFamily: e.target.value as ScentFamily }))}
                    className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  >
                    {SCENT_FAMILIES.map((fam) => (
                      <option key={fam.value} value={fam.value}>
                        {fam.labelEn}
                      </option>
                    ))}
                  </select>
                </FormFieldGroup>

                {/* Flags Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#1C1A17] font-body">
                    Merchandising Flags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-mono text-[#1C1A17] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flags.isNew}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, flags: { ...p.flags, isNew: e.target.checked } }))
                        }
                        className="rounded-[2px] border-[#E4DED3] text-[#A98860] focus:ring-0"
                      />
                      <span>New</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-mono text-[#1C1A17] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flags.isSignature}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, flags: { ...p.flags, isSignature: e.target.checked } }))
                        }
                        className="rounded-[2px] border-[#E4DED3] text-[#A98860] focus:ring-0"
                      />
                      <span>Signature</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs font-mono text-[#1C1A17] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.flags.isFeatured}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, flags: { ...p.flags, isFeatured: e.target.checked } }))
                        }
                        className="rounded-[2px] border-[#E4DED3] text-[#A98860] focus:ring-0"
                      />
                      <span>Featured</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bilingual Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px]">
                <FormFieldGroup
                  label="Fragrance Name [English]"
                  htmlFor="input-name-en"
                  required
                  statusBadge={getLanguageFieldStatus(formData.name.en, formData.name.ar)}
                  errorText={errors['name.en']}
                  helperText="e.g. Oud Al-Waqt (Time & Agarwood)"
                >
                  <input
                    id="input-name-en"
                    type="text"
                    dir="ltr"
                    value={formData.name.en}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: { ...p.name, en: e.target.value } }));
                      if (errors['name.en']) setErrors((p) => ({ ...p, 'name.en': '' }));
                    }}
                    placeholder="e.g. Taif Dawn Rose"
                    className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  />
                </FormFieldGroup>

                <FormFieldGroup
                  label="اسم العطر [العربية]"
                  htmlFor="input-name-ar"
                  required
                  statusBadge={getLanguageFieldStatus(formData.name.ar, formData.name.en)}
                  errorText={errors['name.ar']}
                  helperText="مثال: عود الوقت أو ورد الطائف فجراً"
                >
                  <input
                    id="input-name-ar"
                    type="text"
                    dir="rtl"
                    value={formData.name.ar}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, name: { ...p.name, ar: e.target.value } }));
                      if (errors['name.ar']) setErrors((p) => ({ ...p, 'name.ar': '' }));
                    }}
                    placeholder="مثال: عود الوقت"
                    className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  />
                </FormFieldGroup>
              </div>

              {/* Bilingual Short Descriptors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px]">
                <FormFieldGroup
                  label="Short Descriptor [English]"
                  htmlFor="input-shortDescriptor-en"
                  required
                  statusBadge={getLanguageFieldStatus(formData.shortDescriptor.en, formData.shortDescriptor.ar)}
                  errorText={errors['shortDescriptor.en']}
                  helperText="One-sentence essence (e.g. Rare Cambodian Wild Oud & Smoked Birch Extrait)"
                >
                  <input
                    id="input-shortDescriptor-en"
                    type="text"
                    dir="ltr"
                    value={formData.shortDescriptor.en}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, shortDescriptor: { ...p.shortDescriptor, en: e.target.value } }));
                      if (errors['shortDescriptor.en']) setErrors((p) => ({ ...p, 'shortDescriptor.en': '' }));
                    }}
                    placeholder="e.g. Rare Cambodian Wild Oud & Smoked Birch Extrait"
                    className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  />
                </FormFieldGroup>

                <FormFieldGroup
                  label="الوصف الموجز [العربية]"
                  htmlFor="input-shortDescriptor-ar"
                  required
                  statusBadge={getLanguageFieldStatus(formData.shortDescriptor.ar, formData.shortDescriptor.en)}
                  errorText={errors['shortDescriptor.ar']}
                  helperText="عبارة الإيجاز العطرية (مثال: خلاصة عود كمبودي بري معتّق مع بتولا مدخنة)"
                >
                  <input
                    id="input-shortDescriptor-ar"
                    type="text"
                    dir="rtl"
                    value={formData.shortDescriptor.ar}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, shortDescriptor: { ...p.shortDescriptor, ar: e.target.value } }));
                      if (errors['shortDescriptor.ar']) setErrors((p) => ({ ...p, 'shortDescriptor.ar': '' }));
                    }}
                    placeholder="مثال: خلاصة عود كمبودي بري معتّق مع بتولا مدخنة"
                    className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  />
                </FormFieldGroup>
              </div>

              {/* Bilingual Long Story / Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px]">
                <FormFieldGroup
                  label="Narrative Olfactive Story [English]"
                  htmlFor="input-longDescription-en"
                  required
                  statusBadge={getLanguageFieldStatus(formData.longDescription.en, formData.longDescription.ar)}
                  errorText={errors['longDescription.en']}
                  helperText="Architectural background, distillation craft, and mood"
                >
                  <textarea
                    id="input-longDescription-en"
                    rows={4}
                    dir="ltr"
                    value={formData.longDescription.en}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, longDescription: { ...p.longDescription, en: e.target.value } }));
                      if (errors['longDescription.en']) setErrors((p) => ({ ...p, 'longDescription.en': '' }));
                    }}
                    placeholder="An architectural study of time and density. Distilled from wild 30-year aged Cambodian agarwood resin..."
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860] leading-relaxed"
                  />
                </FormFieldGroup>

                <FormFieldGroup
                  label="القصة والوصف التفصيلي [العربية]"
                  htmlFor="input-longDescription-ar"
                  required
                  statusBadge={getLanguageFieldStatus(formData.longDescription.ar, formData.longDescription.en)}
                  errorText={errors['longDescription.ar']}
                  helperText="تفاصيل تقطير الزيوت، المعمار العطري، والإحساس الفاخر"
                >
                  <textarea
                    id="input-longDescription-ar"
                    rows={4}
                    dir="rtl"
                    value={formData.longDescription.ar}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, longDescription: { ...p.longDescription, ar: e.target.value } }));
                      if (errors['longDescription.ar']) setErrors((p) => ({ ...p, 'longDescription.ar': '' }));
                    }}
                    placeholder="دراسة معمارية في كثافة الزمن وشذى الأخشاب. مقطر من راتنج العود الكمبودي البري المعتق..."
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860] leading-relaxed"
                  />
                </FormFieldGroup>
              </div>
            </div>
          )}

          {/* TAB 2: NOTES PYRAMID */}
          {activeTab === 'notes' && (
            <div className="space-y-6 animate-in fade-in-50 duration-100">
              <div className="p-3 bg-[#A98860]/10 border border-[#A98860]/20 rounded-[2px] text-xs font-mono text-[#1C1A17] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#A98860]" />
                <span>
                  {locale === 'ar'
                    ? 'حدد مكونات الهرم العطري بدقة بكلتا اللغتين الإنجليزية والعربية لعرضها في بطاقة العطر وتغذية محرك البحث.'
                    : 'Specify the three-tiered olfactive pyramid in both English and Arabic for customer discovery and search indexing.'}
                </span>
              </div>

              {/* Top Notes */}
              <div className="p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E4DED3] pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#A98860]" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1C1A17]">
                    1. Top Notes (الافتتاحية العطرية)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldGroup
                    label="Top Notes [English]"
                    htmlFor="input-notes-top-en"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.top.en, formData.notes.top.ar)}
                    errorText={errors['notes.top.en']}
                  >
                    <input
                      id="input-notes-top-en"
                      type="text"
                      dir="ltr"
                      value={formData.notes.top.en}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, top: { ...p.notes.top, en: e.target.value } } }));
                        if (errors['notes.top.en']) setErrors((p) => ({ ...p, 'notes.top.en': '' }));
                      }}
                      placeholder="e.g. Wild Cambodian Oud, Saffron Stigmas"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>

                  <FormFieldGroup
                    label="الافتتاحية العطرية [العربية]"
                    htmlFor="input-notes-top-ar"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.top.ar, formData.notes.top.en)}
                    errorText={errors['notes.top.ar']}
                  >
                    <input
                      id="input-notes-top-ar"
                      type="text"
                      dir="rtl"
                      value={formData.notes.top.ar}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, top: { ...p.notes.top, ar: e.target.value } } }));
                        if (errors['notes.top.ar']) setErrors((p) => ({ ...p, 'notes.top.ar': '' }));
                      }}
                      placeholder="مثال: عود كمبودي بري، مياسم الزعفران النقي"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>
                </div>
              </div>

              {/* Heart Notes */}
              <div className="p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E4DED3] pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#A98860]" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1C1A17]">
                    2. Heart Notes (قلب العطر)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldGroup
                    label="Heart Notes [English]"
                    htmlFor="input-notes-heart-en"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.heart.en, formData.notes.heart.ar)}
                    errorText={errors['notes.heart.en']}
                  >
                    <input
                      id="input-notes-heart-en"
                      type="text"
                      dir="ltr"
                      value={formData.notes.heart.en}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, heart: { ...p.notes.heart, en: e.target.value } } }));
                        if (errors['notes.heart.en']) setErrors((p) => ({ ...p, 'notes.heart.en': '' }));
                      }}
                      placeholder="e.g. Smoked Birch Bark, Atlas Cedar, Dark Rose"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>

                  <FormFieldGroup
                    label="قلب العطر [العربية]"
                    htmlFor="input-notes-heart-ar"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.heart.ar, formData.notes.heart.en)}
                    errorText={errors['notes.heart.ar']}
                  >
                    <input
                      id="input-notes-heart-ar"
                      type="text"
                      dir="rtl"
                      value={formData.notes.heart.ar}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, heart: { ...p.notes.heart, ar: e.target.value } } }));
                        if (errors['notes.heart.ar']) setErrors((p) => ({ ...p, 'notes.heart.ar': '' }));
                      }}
                      placeholder="مثال: لحاء البتولا المدخن، خشب أرز الأطلس، ورد داكن"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>
                </div>
              </div>

              {/* Base Notes */}
              <div className="p-4 bg-[#F5F1EA]/50 border border-[#E4DED3] rounded-[2px] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#E4DED3] pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#A98860]" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1C1A17]">
                    3. Base Notes (قاعدة العطر وثباته)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormFieldGroup
                    label="Base Notes [English]"
                    htmlFor="input-notes-base-en"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.base.en, formData.notes.base.ar)}
                    errorText={errors['notes.base.en']}
                  >
                    <input
                      id="input-notes-base-en"
                      type="text"
                      dir="ltr"
                      value={formData.notes.base.en}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, base: { ...p.notes.base, en: e.target.value } } }));
                        if (errors['notes.base.en']) setErrors((p) => ({ ...p, 'notes.base.en': '' }));
                      }}
                      placeholder="e.g. Grey Ambergris, Aged Leather, Resinous Labdanum"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>

                  <FormFieldGroup
                    label="قاعدة العطر [العربية]"
                    htmlFor="input-notes-base-ar"
                    required
                    statusBadge={getLanguageFieldStatus(formData.notes.base.ar, formData.notes.base.en)}
                    errorText={errors['notes.base.ar']}
                  >
                    <input
                      id="input-notes-base-ar"
                      type="text"
                      dir="rtl"
                      value={formData.notes.base.ar}
                      onChange={(e) => {
                        setFormData((p) => ({ ...p, notes: { ...p.notes, base: { ...p.notes.base, ar: e.target.value } } }));
                        if (errors['notes.base.ar']) setErrors((p) => ({ ...p, 'notes.base.ar': '' }));
                      }}
                      placeholder="مثال: عنبر خام رمادي، جلود معتقة، راتنج اللادن"
                      className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                    />
                  </FormFieldGroup>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIZES, PRICING & INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in-50 duration-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1C1A17]">
                    {locale === 'ar' ? 'الأحجام والتسعير والمخزون' : 'Bottle Size Variants & Pricing ($ USD)'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#7A736A] mt-0.5">
                    {locale === 'ar'
                      ? 'حدد سعة القارورة، السعر الأساسي بالدولار، وعدد الوحدات المتوفرة في المخزن.'
                      : 'Configure volumes, USD base prices, and stock units for each flacon.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{locale === 'ar' ? 'إضافة سعة' : '+ Add Size'}</span>
                </button>
              </div>

              {errors['sizes'] && (
                <p className="text-xs font-mono text-[#8C3B2E]">{errors['sizes']}</p>
              )}

              <div className="space-y-3">
                {formData.sizes.map((variant, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#F5F1EA]/60 border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row sm:items-center gap-3"
                  >
                    {/* Size Label */}
                    <div className="flex-1">
                      <label className="text-[10px] font-mono uppercase text-[#7A736A] block mb-1">
                        Size Label (e.g. 50ml / 100ml)
                      </label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                        placeholder="50ml"
                        className="w-full h-8 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                      />
                      {errors[`size_${index}_name`] && (
                        <span className="text-[10px] text-[#8C3B2E] font-mono">
                          {errors[`size_${index}_name`]}
                        </span>
                      )}
                    </div>

                    {/* Price in USD */}
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] font-mono uppercase text-[#7A736A] block mb-1">
                        Price ($ USD)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={variant.price}
                        onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                        className="w-full h-8 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                      />
                      {errors[`size_${index}_price`] && (
                        <span className="text-[10px] text-[#8C3B2E] font-mono">
                          {errors[`size_${index}_price`]}
                        </span>
                      )}
                    </div>

                    {/* Stock Count */}
                    <div className="w-full sm:w-28">
                      <label className="text-[10px] font-mono uppercase text-[#7A736A] block mb-1">
                        Stock (Units)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stock}
                        onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                        className="w-full h-8 px-2.5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                      />
                      {errors[`size_${index}_stock`] && (
                        <span className="text-[10px] text-[#8C3B2E] font-mono">
                          {errors[`size_${index}_stock`]}
                        </span>
                      )}
                    </div>

                    {/* Remove Action */}
                    <div className="sm:pt-5 flex items-center">
                      <button
                        type="button"
                        disabled={formData.sizes.length <= 1}
                        onClick={() => handleRemoveSize(index)}
                        className="p-1.5 text-[#7A736A] hover:text-[#8C3B2E] disabled:opacity-30 rounded-[2px] transition-colors cursor-pointer"
                        title="Remove size variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IMAGERY & ASSETS */}
          {activeTab === 'media' && (
            <div className="space-y-6 animate-in fade-in-50 duration-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#1C1A17]">
                    {locale === 'ar' ? 'معرض صور العطر' : 'Fragrance Flacon Photography'}
                  </h3>
                  <p className="text-[11px] font-mono text-[#7A736A] mt-0.5">
                    {locale === 'ar'
                      ? 'ارفع صوراً إلى مسار Firebase Storage الخاص بالعطر، أو أدخل رابطاً مباشراً، أو اختر من صور الأتيليه الجاهزة.'
                      : 'Upload flacon photos to Firebase Storage (/products/{id}/), enter a direct URL, or select atelier assets.'}
                  </p>
                </div>
              </div>

              {errors['images'] && (
                <p className="text-xs font-mono text-[#8C3B2E]">{errors['images']}</p>
              )}

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileUpload(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-[#E4DED3] hover:border-[#A98860] bg-[#F5F1EA]/40 p-6 rounded-[2px] text-center cursor-pointer transition-colors"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#A98860]/10 flex items-center justify-center text-[#A98860]">
                    {isUploadingImage ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-[#1C1A17]">
                    {isUploadingImage ? (
                      <span>{locale === 'ar' ? 'جارٍ رفع الصورة إلى Firebase Storage...' : 'Uploading image to Firebase Storage...'}</span>
                    ) : (
                      <span>
                        <span className="font-bold underline text-[#A98860]">
                          {locale === 'ar' ? 'انقر للرفع' : 'Click to browse'}
                        </span>{' '}
                        {locale === 'ar' ? 'أو اسحب ملفات الصور هنا' : 'or drag & drop flacon images here'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#7A736A]">
                    PNG, JPG, WebP up to 10MB (Stored under /products/{formData.id || 'id'}/)
                  </span>
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="p-3 bg-[#F5F1EA]/60 border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full relative">
                  <Link className="w-3.5 h-3.5 text-[#7A736A] absolute start-3 top-2.5" />
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://... or /assets/products/filename.jpg"
                    className="w-full h-8 ps-8 pe-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  disabled={!customImageUrl.trim()}
                  className="w-full sm:w-auto px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#E4DED3] disabled:opacity-40 text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono transition-colors cursor-pointer"
                >
                  {locale === 'ar' ? 'إضافة الرابط' : '+ Add Image URL'}
                </button>
              </div>

              {/* Preset Sample Gallery */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'أو اختر من صور الأتيليه المقترحة:' : 'Or pick from curated studio presets:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_ATELIER_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetImage(preset.url)}
                      className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#E4DED3] border border-[#E4DED3] rounded-[2px] text-[11px] font-mono text-[#1C1A17] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3 text-[#A98860]" />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Uploaded Images List with Reorder and Delete */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'الصور المرفقة (الصورة الأولى هي الصورة الرئيسية):' : 'Attached Photos (First image is primary hero):'}
                </span>

                {formData.images.length === 0 ? (
                  <div className="p-6 text-center text-xs font-mono text-[#7A736A] bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px]">
                    {locale === 'ar' ? 'لم يتم إرفاق صور بعد. يرجى رفع صورة أو اختيار واحدة من المقترحات.' : 'No photos attached yet. Please upload or choose a preset.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group border border-[#E4DED3] rounded-[2px] overflow-hidden bg-[#FAF7F2] flex flex-col"
                      >
                        <div className="aspect-square w-full bg-[#E4DED3]/30 overflow-hidden relative">
                          <img
                            src={imgUrl}
                            alt={`Product preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // fallback to generic placeholder on load error
                              (e.target as HTMLImageElement).src = '/assets/products/oud_al_waqt_hero.jpg';
                            }}
                          />
                          {index === 0 && (
                            <span className="absolute top-1.5 start-1.5 px-1.5 py-0.5 bg-[#1C1A17] text-white text-[9px] font-mono rounded-[1px] tracking-wider uppercase">
                              Primary Hero
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="p-1.5 bg-[#F5F1EA] border-t border-[#E4DED3] flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveImage(index, 'left')}
                              className="p-1 text-[#7A736A] hover:text-[#1C1A17] disabled:opacity-20 cursor-pointer"
                              title="Move left / promote"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={index === formData.images.length - 1}
                              onClick={() => handleMoveImage(index, 'right')}
                              className="p-1 text-[#7A736A] hover:text-[#1C1A17] disabled:opacity-20 cursor-pointer"
                              title="Move right / demote"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 text-[#7A736A] hover:text-[#8C3B2E] cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-[#E4DED3] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2]">
            <div className="text-[11px] font-mono text-[#7A736A]">
              {product ? (
                <span>
                  {locale === 'ar' ? 'تعديل السجل الحالي' : 'Editing document ID'}: <strong className="text-[#1C1A17]">{formData.id}</strong>
                </span>
              ) : (
                <span>
                  {locale === 'ar' ? 'سيتم إنشاء مستند جديد في مجموعة products' : 'New document will be created in products collection'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-[#FAF7F2] hover:bg-[#E4DED3] text-[#1C1A17] border border-[#E4DED3] rounded-[2px] text-xs font-mono transition-colors cursor-pointer"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2 bg-[#1C1A17] hover:bg-[#A98860] text-white rounded-[2px] text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === 'ar' ? 'جارٍ الحفظ في Firestore...' : 'Saving to Firestore...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{product ? (locale === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (locale === 'ar' ? 'إنشاء العطر' : 'Create Fragrance')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Missing Bilingual Fields Alert Modal */}
      <MissingLanguageModal
        isOpen={missingModalOpen}
        onClose={() => setMissingModalOpen(false)}
        missingFields={activeMissingFields}
        onNavigateToField={handleNavigateToMissingField}
      />
    </div>
  );
};
