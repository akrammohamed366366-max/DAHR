import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
  Send,
  Save,
  Copy,
  Check,
  Calendar,
  DollarSign,
  FileText,
  History,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '../../../i18n/context';
import { Order, OrderStatus, OrderItem, OrderStatusHistoryEntry } from '../../../types/backend';
import { formatPrice } from '../../../i18n/formatters';
import { StatusPill } from '../StatusPill';
import { AdminStatus } from '../../../types';

export interface OrderDetailViewProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (newStatus: OrderStatus, note?: string) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
  isUpdating?: boolean;
}

const STATUS_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  order,
  onClose,
  onStatusChange,
  onSaveNotes,
  isUpdating = false,
}) => {
  const { locale, direction } = useI18n();
  const isRTL = direction === 'rtl';

  // Local state
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaveSuccess, setNotesSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  // Sync internal notes if order prop updates
  React.useEffect(() => {
    setInternalNotes(order.internalNotes || '');
    setSelectedStatus(order.status);
  }, [order.id, order.status, order.internalNotes]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === order.status && !statusNote) return;
    await onStatusChange(selectedStatus, statusNote.trim() || undefined);
    setStatusNote('');
    setShowStatusConfirm(false);
  };

  const handleInternalNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    try {
      await onSaveNotes(internalNotes);
      setNotesSaveSuccess(true);
      setTimeout(() => setNotesSaveSuccess(false), 2500);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    if (status === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  const currentStepIndex = getStatusStepIndex(order.status);

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return locale === 'ar' ? 'قيد الانتظار' : 'Pending Verification';
      case 'processing':
        return locale === 'ar' ? 'قيد التجهيز والتغليف' : 'Processing & Packaging';
      case 'shipped':
        return locale === 'ar' ? 'تم الشحن مع الناقل' : 'Dispatched with Courier';
      case 'delivered':
        return locale === 'ar' ? 'تم التسليم بنجاح' : 'Delivered to Recipient';
      case 'cancelled':
        return locale === 'ar' ? 'ملغي / مسترجع' : 'Cancelled / Void';
    }
  };

  return (
    <div
      id={`order-detail-${order.id}`}
      className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] shadow-sm overflow-hidden flex flex-col"
    >
      {/* Top Header Bar */}
      <div className="bg-[#1C1A17] text-[#FAF7F2] p-4 sm:p-5 flex items-center justify-between border-b border-[#2E2B26]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'ar' ? 'العودة للقائمة' : 'Back to orders list'}
            className="p-1.5 text-[#9B9488] hover:text-[#FAF7F2] hover:bg-[#2A2723] rounded-[2px] transition-colors cursor-pointer"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A98860]">
                {locale === 'ar' ? 'تفاصيل الطلبية الفاخرة' : 'Atelier Order Record'}
              </span>
              <span className="px-1.5 py-0.2 bg-[#4B5D46]/20 text-[#A8C3A0] text-[9px] font-mono font-bold rounded-[2px]">
                fullAdmin
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-serif text-[#FAF7F2] mt-0.5 flex items-center gap-2">
              <span>#{order.id}</span>
              <button
                type="button"
                onClick={() => handleCopy(order.id, 'orderId')}
                aria-label="Copy order ID"
                className="text-[#9B9488] hover:text-[#FAF7F2] transition-colors p-1"
                title={locale === 'ar' ? 'نسخ رقم الطلب' : 'Copy Order ID'}
              >
                {copiedField === 'orderId' ? (
                  <Check className="w-3.5 h-3.5 text-[#4B5D46]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill
            status={order.status as AdminStatus}
            label={getStatusLabel(order.status)}
            className="text-xs"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'ar' ? 'إغلاق' : 'Close detail view'}
            className="hidden sm:inline-flex p-1.5 text-[#9B9488] hover:text-[#FAF7F2] hover:bg-[#2A2723] rounded-[2px] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
        {/* ========================================================================= */}
        {/* 1. FULFILLMENT STATUS PIPELINE & CONTROLS                                 */}
        {/* ========================================================================= */}
        <section
          id="fulfillment-status-section"
          className="bg-[#F5F1EA] border border-[#E4DED3] p-4 sm:p-5 rounded-[2px]"
          aria-labelledby="fulfillment-pipeline-heading"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#E4DED3] pb-3">
            <div>
              <h3 id="fulfillment-pipeline-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1A17] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#A98860]" />
                {locale === 'ar' ? 'مسار التنفيذ وحالة الشحن' : 'Fulfillment Status Pipeline'}
              </h3>
              <p className="text-[11px] font-mono text-[#7A736A] mt-0.5">
                {locale === 'ar'
                  ? 'قم بتحديث مسار الطلب لإشعار العميل وتسجيل التغيير في السجل المالي.'
                  : 'Manage progress through packaging, dispatch, and final courier delivery.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#7A736A]">
              <Clock className="w-3.5 h-3.5 text-[#7A736A]" />
              <span>
                {locale === 'ar' ? 'تاريخ الإنشاء:' : 'Placed:'}{' '}
                <strong className="text-[#1C1A17]">{new Date(order.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}</strong>
              </span>
            </div>
          </div>

          {/* Stepper Visualization */}
          {order.status === 'cancelled' ? (
            <div className="p-3 bg-[#8C3B2E]/10 border border-[#8C3B2E]/30 rounded-[2px] flex items-center gap-3 text-xs font-mono text-[#8C3B2E] mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold">
                  {locale === 'ar' ? 'هذا الطلب ملغي.' : 'This order has been cancelled.'}
                </span>
                <p className="text-[11px] text-[#8C3B2E]/80 mt-0.5">
                  {locale === 'ar'
                    ? 'يمكنك إعادة تفعيل الطلب بتحديد إحدى الحالات التالية وحفظ التغيير أدناه.'
                    : 'You can reactivate this order by selecting a new fulfillment status below.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = order.status === step;
                return (
                  <div
                    key={step}
                    className={`
                      p-2.5 rounded-[2px] border flex flex-col gap-1 transition-all
                      ${
                        isCurrent
                          ? 'bg-[#1C1A17] text-[#FAF7F2] border-[#1C1A17] shadow-sm'
                          : isPassed
                          ? 'bg-[#FAF7F2] text-[#4B5D46] border-[#4B5D46]/40'
                          : 'bg-[#FAF7F2]/60 text-[#7A736A] border-[#E4DED3]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider">
                      <span>0{idx + 1}</span>
                      {isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-[#A98860] animate-pulse" />
                      ) : isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4B5D46]" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#E4DED3]" />
                      )}
                    </div>
                    <span className="font-mono font-medium text-xs truncate">
                      {getStatusLabel(step)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Status Form */}
          <form onSubmit={handleStatusSubmit} className="flex flex-col gap-3 bg-[#FAF7F2] p-3.5 border border-[#E4DED3] rounded-[2px]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label
                  htmlFor="status-select"
                  className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#7A736A] mb-1"
                >
                  {locale === 'ar' ? 'تغيير الحالة إلى:' : 'Transition Order Status:'}
                </label>
                <select
                  id="status-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  disabled={isUpdating}
                  className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] focus:outline-none focus:border-[#A98860] cursor-pointer"
                >
                  <option value="pending">
                    {locale === 'ar' ? 'Pending (قيد الانتظار)' : 'Pending (Awaiting Packaging)'}
                  </option>
                  <option value="processing">
                    {locale === 'ar' ? 'Processing (قيد التجهيز والتعبئة)' : 'Processing (Flacon Bottled & Packaged)'}
                  </option>
                  <option value="shipped">
                    {locale === 'ar' ? 'Shipped (تم تسليم الشحنة للناقل)' : 'Shipped (Dispatched with Courier)'}
                  </option>
                  <option value="delivered">
                    {locale === 'ar' ? 'Delivered (تم تسليم العطر للعميل)' : 'Delivered (Safely Received)'}
                  </option>
                  <option value="cancelled">
                    {locale === 'ar' ? 'Cancelled (إلغاء الطلب)' : 'Cancelled (Void / Order Cancelled)'}
                  </option>
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="status-note-input"
                  className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#7A736A] mb-1"
                >
                  {locale === 'ar' ? 'ملاحظة التغيير (اختياري):' : 'Status Transition Note (Optional):'}
                </label>
                <input
                  id="status-note-input"
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={
                    locale === 'ar'
                      ? 'مثال: رقم التتبع DHL-892345...'
                      : 'e.g., Courier tracking # DHL-892345...'
                  }
                  disabled={isUpdating}
                  className="w-full h-9 px-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
                />
              </div>

              <div className="self-end sm:self-auto sm:mt-5">
                <button
                  type="submit"
                  disabled={isUpdating || (selectedStatus === order.status && !statusNote.trim())}
                  className="h-9 px-4 bg-[#1C1A17] hover:bg-[#2E2B26] disabled:opacity-50 text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? (locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ الحالة' : 'Apply Status')}</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* 2-Column Split for Order Items & Customer Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================================= */}
          {/* 2. ORDER ITEMS & FINANCIAL LEDGER (LEFT 7 COLS)                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Items Breakdown Table */}
            <section
              id="order-items-breakdown"
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] overflow-hidden"
              aria-labelledby="items-breakdown-heading"
            >
              <div className="p-4 bg-[#F5F1EA] border-b border-[#E4DED3] flex items-center justify-between">
                <h3 id="items-breakdown-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1A17] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#4B5D46]" />
                  {locale === 'ar' ? 'محتويات الطلبية والعطور' : 'Ordered Flacons & Items'}
                </h3>
                <span className="text-xs font-mono text-[#7A736A]">
                  {order.items?.length || 0} {locale === 'ar' ? 'صنف' : 'item(s)'}
                </span>
              </div>

              <div className="divide-y divide-[#E4DED3]">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: OrderItem, idx: number) => {
                    const itemTotal = (item.price || 0) * (item.qty || 1);
                    return (
                      <div
                        key={`${item.productId}-${idx}`}
                        className="p-4 flex items-start justify-between gap-4 hover:bg-[#F5F1EA]/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Flacon Icon / Thumbnail representation */}
                          <div className="w-12 h-12 bg-[#1C1A17] text-[#A98860] border border-[#2E2B26] rounded-[2px] flex items-center justify-center font-serif text-sm font-bold shrink-0">
                            {item.name?.en ? item.name.en.charAt(0) : 'D'}
                          </div>
                          <div>
                            <h4 className="text-sm font-serif font-medium text-[#1C1A17]">
                              {locale === 'ar'
                                ? item.name?.ar || item.name?.en
                                : item.name?.en || item.name?.ar}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono text-[#7A736A]">
                              <span className="px-1.5 py-0.2 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px]">
                                {item.size}
                              </span>
                              <span>•</span>
                              <span>
                                {formatPrice(item.price, locale, { currency: 'USD' })} × {item.qty}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-end font-mono">
                          <span className="text-sm font-bold text-[#1C1A17] block">
                            {formatPrice(itemTotal, locale, { currency: 'USD' })}
                          </span>
                          <span className="text-[10px] text-[#7A736A]">
                            {item.qty} {locale === 'ar' ? 'وحدة' : 'unit(s)'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs font-mono text-[#7A736A]">
                    {locale === 'ar' ? 'لا توجد عناصر مسجلة في هذا الطلب.' : 'No line items recorded for this order.'}
                  </div>
                )}
              </div>

              {/* Financial Ledger Subtotal & Total */}
              <div className="p-4 bg-[#F5F1EA] border-t border-[#E4DED3] flex flex-col gap-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#7A736A]">
                  <span>{locale === 'ar' ? 'المجموع الفرعي للمنتجات:' : 'Items Subtotal:'}</span>
                  <span>{formatPrice(order.subtotal, locale, { currency: 'USD' })}</span>
                </div>
                <div className="flex items-center justify-between text-[#7A736A]">
                  <span>{locale === 'ar' ? 'الشحن السريع الفاخر:' : 'VIP Express Courier:'}</span>
                  <span className="text-[#4B5D46] font-medium">
                    {locale === 'ar' ? 'مجاني (0.00$)' : 'Complimentary ($0.00)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#7A736A]">
                  <span>{locale === 'ar' ? 'الرسوم الجمركية والضرائب:' : 'Taxes & Import Duties:'}</span>
                  <span>{locale === 'ar' ? 'مشمولة' : 'Included in price'}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#E4DED3] text-sm font-bold text-[#1C1A17]">
                  <span className="font-serif">{locale === 'ar' ? 'الإجمالي النهائي:' : 'Total Ledger Amount:'}</span>
                  <span className="text-base text-[#1C1A17]">
                    {formatPrice(order.totalAmount || order.subtotal, locale, { currency: 'USD' })}
                  </span>
                </div>
              </div>
            </section>

            {/* Internal Notes Editor */}
            <section
              id="internal-notes-section"
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-4 sm:p-5"
              aria-labelledby="internal-notes-heading"
            >
              <div className="flex items-center justify-between mb-3 border-b border-[#E4DED3] pb-2">
                <h3 id="internal-notes-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1A17] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#A98860]" />
                  {locale === 'ar' ? 'ملاحظات الكونسيرج الداخلية' : 'Internal Concierge Notes'}
                </h3>
                <span className="text-[10px] font-mono text-[#7A736A]">
                  {locale === 'ar' ? 'خاصة بالإدارة فقط' : 'Atelier private only'}
                </span>
              </div>

              <form onSubmit={handleInternalNotesSubmit} className="flex flex-col gap-3">
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={3}
                  placeholder={
                    locale === 'ar'
                      ? 'أدخل أي ملاحظات خاصة بالعميل، طلبات التغليف الفاخر، أو تفاصيل الاتصال...'
                      : 'Record VIP packaging requests, concierge communication logs, or bespoke delivery preferences...'
                  }
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] text-xs font-mono text-[#1C1A17] placeholder-[#7A736A] focus:outline-none focus:border-[#A98860]"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#4B5D46]">
                    {notesSaveSuccess && (
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {locale === 'ar' ? 'تم حفظ الملاحظات بنجاح!' : 'Notes saved to Firestore!'}
                      </span>
                    )}
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingNotes || internalNotes === (order.internalNotes || '')}
                    className="py-1.5 px-3 bg-[#1C1A17] hover:bg-[#2E2B26] disabled:opacity-50 text-[#FAF7F2] text-xs font-mono uppercase tracking-wider rounded-[2px] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? (locale === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ الملاحظات' : 'Save Notes')}</span>
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* ========================================================================= */}
          {/* 3. CUSTOMER INFO & AUDIT LOG (RIGHT 5 COLS)                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Customer & Shipping Details */}
            <section
              id="customer-info-section"
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-4 sm:p-5 flex flex-col gap-4"
              aria-labelledby="customer-info-heading"
            >
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
                <h3 id="customer-info-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1A17] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#A98860]" />
                  {locale === 'ar' ? 'بيانات العميل والشحن' : 'Customer & Shipping'}
                </h3>
                {order.customer?.uid ? (
                  <span className="px-1.5 py-0.2 bg-[#4B5D46]/10 text-[#4B5D46] text-[10px] font-mono font-medium rounded-[2px]">
                    {locale === 'ar' ? 'عميل مسجل' : 'Registered Member'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 bg-[#7A736A]/10 text-[#7A736A] text-[10px] font-mono font-medium rounded-[2px]">
                    {locale === 'ar' ? 'زائر كونسيرج' : 'Guest Checkout'}
                  </span>
                )}
              </div>

              {/* Recipient Name */}
              <div className="flex flex-col gap-1 text-xs font-mono">
                <span className="text-[10px] uppercase tracking-wider text-[#7A736A]">
                  {locale === 'ar' ? 'اسم المستلم:' : 'Recipient Name:'}
                </span>
                <span className="text-sm font-serif font-bold text-[#1C1A17]">
                  {order.customer?.name || (locale === 'ar' ? 'عميل غير مسمى' : 'Anonymous Client')}
                </span>
              </div>

              {/* Contact Email & Phone */}
              <div className="flex flex-col gap-2 text-xs font-mono pt-2 border-t border-[#E4DED3]">
                {order.customer?.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1C1A17] truncate">
                      <Mail className="w-3.5 h-3.5 text-[#7A736A] shrink-0" />
                      <a
                        href={`mailto:${order.customer.email}`}
                        className="hover:text-[#A98860] hover:underline truncate"
                      >
                        {order.customer.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.customer.email, 'email')}
                      className="p-1 text-[#7A736A] hover:text-[#1C1A17]"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? (
                        <Check className="w-3 h-3 text-[#4B5D46]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {order.customer?.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#1C1A17]">
                      <Phone className="w-3.5 h-3.5 text-[#7A736A] shrink-0" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="hover:text-[#A98860] hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(order.customer.phone || '', 'phone')}
                      className="p-1 text-[#7A736A] hover:text-[#1C1A17]"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-3 h-3 text-[#4B5D46]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="flex flex-col gap-1 text-xs font-mono pt-2 border-t border-[#E4DED3]">
                <span className="text-[10px] uppercase tracking-wider text-[#7A736A] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#7A736A]" />
                  {locale === 'ar' ? 'عنوان التسليم:' : 'Delivery Address:'}
                </span>
                <div className="bg-[#F5F1EA] p-3 rounded-[2px] border border-[#E4DED3] text-[#1C1A17] flex flex-col gap-0.5">
                  <span>{order.customer?.address?.line1 || 'No street address'}</span>
                  {order.customer?.address?.line2 && (
                    <span>{order.customer.address.line2}</span>
                  )}
                  <span className="font-bold">
                    {order.customer?.address?.city}, {order.customer?.address?.country}{' '}
                    {order.customer?.address?.postalCode && `(${order.customer.address.postalCode})`}
                  </span>
                </div>
              </div>
            </section>

            {/* Status History & Audit Log */}
            <section
              id="status-history-section"
              className="bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-4 sm:p-5 flex flex-col gap-3"
              aria-labelledby="audit-history-heading"
            >
              <div className="flex items-center justify-between border-b border-[#E4DED3] pb-2">
                <h3 id="audit-history-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1A17] flex items-center gap-2">
                  <History className="w-4 h-4 text-[#4B5D46]" />
                  {locale === 'ar' ? 'سجل تتبع الحالات' : 'Status Transition Log'}
                </h3>
                <span className="text-[10px] font-mono text-[#7A736A]">
                  {order.statusHistory?.length || 1} {locale === 'ar' ? 'تسجيل' : 'entries'}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pe-1">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory
                    .slice()
                    .reverse()
                    .map((entry: OrderStatusHistoryEntry, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <StatusPill
                            status={entry.status as AdminStatus}
                            label={getStatusLabel(entry.status)}
                            className="text-[10px] py-0 px-2"
                          />
                          <span className="text-[10px] text-[#7A736A]">
                            {new Date(entry.timestamp).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-[11px] text-[#1C1A17] bg-[#FAF7F2] p-1.5 rounded-[2px] border border-[#E4DED3] mt-1">
                            {entry.notes}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[9px] text-[#7A736A] mt-0.5">
                          <span>{locale === 'ar' ? 'المسؤول:' : 'Agent:'} {entry.updatedBy || 'fullAdmin'}</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-2.5 bg-[#F5F1EA] border border-[#E4DED3] rounded-[2px] text-xs font-mono flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill
                        status={order.status as AdminStatus}
                        label={getStatusLabel(order.status)}
                        className="text-[10px] py-0 px-2"
                      />
                      <span className="text-[10px] text-[#7A736A]">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7A736A]">
                      {locale === 'ar' ? 'تم إنشاء الطلب لأول مرة' : 'Initial order creation'}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
