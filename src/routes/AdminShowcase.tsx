import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Sliders,
  Bell,
  Trash2,
  Edit,
  Search,
  Plus,
  ArrowUpDown,
  CheckCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useI18n } from '../i18n/context';
import { DataTable } from '../components/admin/DataTable';
import { StatusPill } from '../components/admin/StatusPill';
import { RoleBadge } from '../components/admin/RoleBadge';
import { SidebarNavItem } from '../components/admin/SidebarNavItem';
import { FormFieldGroup } from '../components/admin/FormFieldGroup';
import { ConfirmationDialog } from '../components/admin/ConfirmationDialog';
import { Input } from '../components/storefront/Input';
import { Select } from '../components/storefront/Select';
import { Button } from '../components/storefront/Button';
import { useToast } from '../components/storefront/Toast';
import { FullAdminAuthGate } from '../components/admin/FullAdminAuthGate';
import { AdminStatus, AdminRole, ColumnDef } from '../types';

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  status: AdminStatus;
  userRole: AdminRole;
  createdAt: string;
}

const SAMPLE_ORDERS: OrderRow[] = [
  {
    id: 'ord-101',
    orderNumber: 'DHR-2026-0891',
    customerName: 'Fatima Al-Kuwari',
    customerEmail: 'fatima.k@luxury.qa',
    productName: 'Oud Al-Waqt (100ml)',
    amount: 320,
    status: 'paid',
    userRole: 'manager',
    createdAt: '2026-08-28 14:22',
  },
  {
    id: 'ord-102',
    orderNumber: 'DHR-2026-0892',
    customerName: 'Alexander Vance',
    customerEmail: 'vance@atelier-arch.com',
    productName: 'Misk Al-Layl (100ml)',
    amount: 290,
    status: 'fulfilled',
    userRole: 'admin',
    createdAt: '2026-08-28 15:40',
  },
  {
    id: 'ord-103',
    orderNumber: 'DHR-2026-0893',
    customerName: 'Tariq Mansoor',
    customerEmail: 't.mansoor@dubaicrest.ae',
    productName: 'Ward Al-Hajar (50ml)',
    amount: 210,
    status: 'pending',
    userRole: 'editor',
    createdAt: '2026-08-28 18:05',
  },
  {
    id: 'ord-104',
    orderNumber: 'DHR-2026-0894',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@geneve.ch',
    productName: 'Discovery Sample Set',
    amount: 45,
    status: 'low_stock',
    userRole: 'support',
    createdAt: '2026-08-29 09:12',
  },
  {
    id: 'ord-105',
    orderNumber: 'DHR-2026-0895',
    customerName: 'Sultan Bin Rashid',
    customerEmail: 'sultan.r@al-dahr.sa',
    productName: 'Oud Al-Waqt (100ml)',
    amount: 320,
    status: 'paid',
    userRole: 'manager',
    createdAt: '2026-08-29 11:30',
  },
  {
    id: 'ord-106',
    orderNumber: 'DHR-2026-0896',
    customerName: 'Camille Dupont',
    customerEmail: 'c.dupont@parfum-paris.fr',
    productName: 'Misk Al-Layl (100ml)',
    amount: 290,
    status: 'draft',
    userRole: 'editor',
    createdAt: '2026-08-29 12:15',
  },
  {
    id: 'ord-107',
    orderNumber: 'DHR-2026-0897',
    customerName: 'Marcus Sterling',
    customerEmail: 'm.sterling@mayfair.co.uk',
    productName: 'Ward Al-Hajar (50ml)',
    amount: 210,
    status: 'cancelled',
    userRole: 'support',
    createdAt: '2026-08-29 13:45',
  },
];

export const AdminShowcase: React.FC = () => {
  const { locale, direction, t } = useI18n();
  const { addToast } = useToast();

  const [activeNav, setActiveNav] = useState<string>('orders');
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [targetDeleteRow, setTargetDeleteRow] = useState<OrderRow | null>(null);

  // Form Field Interactive states
  const [formData, setFormData] = useState({
    sku: 'DHR-EXT-001',
    batchNo: 'BATCH-2026-08',
    stockCount: '48',
    status: 'paid',
    notes: 'Batch aged 6 months. High concentration formula.',
  });

  const filteredOrders = SAMPLE_ORDERS.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<OrderRow>[] = [
    {
      key: 'orderNumber',
      header: 'ORDER #',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-medium text-[#1C1A17]">
          {row.orderNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'CUSTOMER',
      sortable: true,
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[#1C1A17]">{row.customerName}</span>
          <span className="text-[11px] text-[#7A736A] font-mono">{row.customerEmail}</span>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'FRAGRANCE ITEM',
      sortable: true,
      render: (row) => (
        <span className="text-[12px] font-body text-[#1C1A17]">
          {row.productName}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'TOTAL',
      sortable: true,
      align: 'right',
      render: (row) => (
        <span className="font-mono font-medium text-[#1C1A17]">
          ${row.amount}.00
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: 'userRole',
      header: 'AUDIT ROLE',
      sortable: true,
      render: (row) => <RoleBadge role={row.userRole} />,
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Edit Order"
            onClick={() =>
              addToast({
                type: 'info',
                title: 'Order Edit Mode',
                message: `Editing ${row.orderNumber} for ${row.customerName}`,
              })
            }
            className="p-1 text-[#7A736A] hover:text-[#1C1A17] hover:bg-[#E4DED3]/40 rounded-[2px] cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Delete Record"
            onClick={() => {
              setTargetDeleteRow(row);
              setIsConfirmOpen(true);
            }}
            className="p-1 text-[#7A736A] hover:text-[#8C3B2E] hover:bg-[#8C3B2E]/10 rounded-[2px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <FullAdminAuthGate
      title="Admin Component Showcase"
      subtitle="Access Restricted to Full Administrators"
    >
      <div className="w-full flex flex-col gap-8 pb-16 text-start">
      {/* Header Banner */}
      <header className="flex flex-col gap-2 pb-6 border-b border-[#E4DED3]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#1C1A17] text-[#FAF7F2] rounded-[2px]">
            ADMIN TOOLKIT
          </span>
          <span className="text-[11px] font-mono text-[#7A736A]">
            Dense 24–48px System Rhythm / Tool Chrome
          </span>
        </div>

        <h1 className="font-display text-[28px] sm:text-[36px] text-[#1C1A17] font-normal">
          {t('adminShowcase.title')}
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#7A736A] font-body max-w-3xl leading-relaxed">
          {t('adminShowcase.subtitle')}
        </p>
      </header>

      {/* Main Admin Split Layout: Fixed Sidebar + Fluid Content Area */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Fixed-width Admin Sidebar Demo */}
        <aside className="lg:col-span-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] p-4 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#E4DED3] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A98860]" />
              <span className="font-serif font-bold tracking-[0.18em] text-[13px] text-[#1C1A17]">
                DAHR / ADMIN
              </span>
            </div>
            <RoleBadge role="admin" />
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            <SidebarNavItem
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Overview Dashboard"
              isActive={activeNav === 'dashboard'}
              onClick={() => setActiveNav('dashboard')}
            />
            <SidebarNavItem
              icon={<ShoppingCart className="w-4 h-4" />}
              label="Orders & Allocation"
              badge={SAMPLE_ORDERS.length}
              isActive={activeNav === 'orders'}
              onClick={() => setActiveNav('orders')}
            />
            <SidebarNavItem
              icon={<Package className="w-4 h-4" />}
              label="Fragrance Inventory"
              badge="3 Batches"
              isActive={activeNav === 'inventory'}
              onClick={() => setActiveNav('inventory')}
            />
            <SidebarNavItem
              icon={<Users className="w-4 h-4" />}
              label="VIP Client Roster"
              isActive={activeNav === 'clients'}
              onClick={() => setActiveNav('clients')}
            />
            <SidebarNavItem
              icon={<Sliders className="w-4 h-4" />}
              label="Platform Settings"
              isActive={activeNav === 'settings'}
              onClick={() => setActiveNav('settings')}
            />
          </nav>

          {/* System Status Footnote */}
          <div className="mt-auto pt-4 border-t border-[#E4DED3] text-[11px] font-mono text-[#7A736A] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span>DB STATUS:</span>
              <span className="text-[#4B5D46] font-medium">CONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>LOCALE:</span>
              <span>{locale.toUpperCase()} ({direction.toUpperCase()})</span>
            </div>
          </div>
        </aside>

        {/* Fluid Content Area */}
        <main className="lg:col-span-9 flex flex-col gap-6">
          {/* Section 01: DataTable with Filters & Sorting */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DED3] pb-3">
              <div className="flex flex-col">
                <h2 className="text-[16px] sm:text-[18px] font-medium text-[#1C1A17] font-body flex items-center gap-2">
                  <span>{t('adminShowcase.dataTableSection')}</span>
                  {selectedIds.length > 0 && (
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-[#1C1A17] text-[#FAF7F2] rounded-[2px]">
                      {selectedIds.length} Selected
                    </span>
                  )}
                </h2>
                <span className="text-[12px] text-[#7A736A]">
                  Click headers to sort ascending / descending. Supports pagination and batch selection.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    addToast({
                      type: 'info',
                      title: 'Data Export Initiated',
                      message: `Exporting ${filteredOrders.length} records to CSV format.`,
                    })
                  }
                >
                  {t('actions.export')}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() =>
                    addToast({
                      type: 'success',
                      title: 'New Order Form Opened',
                      message: 'Ready to draft new fragrance order.',
                    })
                  }
                >
                  New Order
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="p-3 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search order #, customer, fragrance..."
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-1.5 text-[13px]"
                />
              </div>

              <div className="w-44">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 text-[13px]"
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'fulfilled', label: 'Fulfilled' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'low_stock', label: 'Low Stock' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </div>
            </div>

            {/* DataTable Component */}
            <DataTable
              data={filteredOrders}
              columns={columns}
              keyField="id"
              defaultSortKey="createdAt"
              defaultSortDirection="desc"
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              pageSizeOptions={[3, 5, 10]}
              initialPageSize={5}
            />
          </section>

          {/* Section 02 & 03: Status Pills & Role Badges & Form Field Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Pills & Role Badges Reference Box */}
            <div className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-4">
              <div className="border-b border-[#E4DED3] pb-2">
                <h3 className="text-[14px] font-medium text-[#1C1A17] font-body">
                  {t('adminShowcase.statusPillsSection')}
                </h3>
                <p className="text-[11px] text-[#7A736A]">
                  Semantic status pills using palette tokens (#4B5D46, #A9772F, #8C3B2E, #7A736A).
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill status="paid" />
                <StatusPill status="fulfilled" />
                <StatusPill status="pending" />
                <StatusPill status="low_stock" />
                <StatusPill status="draft" />
                <StatusPill status="cancelled" />
                <StatusPill status="archived" />
              </div>

              <div className="border-t border-[#E4DED3] pt-3 flex flex-col gap-2">
                <h4 className="text-[12px] font-medium text-[#1C1A17]">
                  {t('adminShowcase.roleBadgesSection')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role="admin" />
                  <RoleBadge role="manager" />
                  <RoleBadge role="editor" />
                  <RoleBadge role="support" />
                </div>
              </div>
            </div>

            {/* Form Field Group Component Demo */}
            <div className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col gap-4">
              <div className="border-b border-[#E4DED3] pb-2">
                <h3 className="text-[14px] font-medium text-[#1C1A17] font-body">
                  {t('adminShowcase.formFieldSection')}
                </h3>
                <p className="text-[11px] text-[#7A736A]">
                  Compact form wrapper with labels, required indicators, and helper texts.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <FormFieldGroup
                  label="SKU Identifier"
                  required
                  helperText="Unique master product catalog reference."
                >
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="py-1.5 text-[13px]"
                  />
                </FormFieldGroup>

                <div className="grid grid-cols-2 gap-3">
                  <FormFieldGroup label="Batch Number" required>
                    <Input
                      value={formData.batchNo}
                      onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                      className="py-1.5 text-[13px]"
                    />
                  </FormFieldGroup>

                  <FormFieldGroup label="Inventory Units" required>
                    <Input
                      type="number"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      className="py-1.5 text-[13px]"
                    />
                  </FormFieldGroup>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() =>
                      addToast({
                        type: 'success',
                        title: 'Inventory Updated',
                        message: `SKU ${formData.sku} updated with ${formData.stockCount} units.`,
                      })
                    }
                  >
                    Save Batch
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 04: Confirmation Dialog Trigger */}
          <section className="p-5 bg-[#FAF7F2] border border-[#E4DED3] rounded-[2px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-[14px] font-medium text-[#1C1A17] font-body">
                {t('adminShowcase.confirmationSection')}
              </h3>
              <p className="text-[12px] text-[#7A736A]">
                Destructive and critical action confirmation modal dialogs.
              </p>
            </div>

            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#8C3B2E]" />}
              onClick={() => {
                setTargetDeleteRow(SAMPLE_ORDERS[0]);
                setIsConfirmOpen(true);
              }}
            >
              {t('adminShowcase.triggerConfirmBtn')}
            </Button>
          </section>
        </main>
      </div>

      {/* Confirmation Dialog Component Instance */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        title="Delete Order Record"
        description={
          targetDeleteRow
            ? `Are you sure you wish to permanently delete order ${targetDeleteRow.orderNumber} for ${targetDeleteRow.customerName}? This action cannot be undone.`
            : 'Are you sure you wish to delete this record?'
        }
        confirmLabel="Delete Record"
        cancelLabel="Keep Record"
        isDestructive
        onConfirm={() => {
          setIsConfirmOpen(false);
          addToast({
            type: 'error',
            title: 'Record Deleted',
            message: `Order ${targetDeleteRow?.orderNumber} has been removed from ledger.`,
          });
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
    </FullAdminAuthGate>
  );
};
