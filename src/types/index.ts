import React from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

export type RouteId = 
  | 'home' 
  | 'shop' 
  | 'product-detail'
  | 'collections' 
  | 'about' 
  | 'journal' 
  | 'contact' 
  | 'account'
  | 'privacy'
  | 'terms'
  | 'shipping-returns'
  | 'showcase-storefront' 
  | 'showcase-admin'
  | 'diagnostics'
  | 'admin'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-journal'
  | 'admin-users'
  | 'admin-settings';

export interface LocaleConfig {
  code: Locale;
  label: string;
  nativeLabel: string;
  direction: Direction;
}

export interface NavigationItem {
  id: RouteId;
  labelKey: string;
  path: string;
  subItems?: { id: string; labelEn: string; labelAr: string; descEn: string; descAr: string }[];
}

// Storefront Component Types
export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface AccordionItemData {
  id: string;
  title: string;
  content: string | React.ReactNode;
  subtitle?: string;
}

export type BadgeVariant = 'default' | 'accent' | 'neutral' | 'outline';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ProductData {
  id: string;
  brand: 'DAHR';
  nameEn: string;
  nameAr: string;
  olfactiveFamilyEn: string;
  olfactiveFamilyAr: string;
  concentrationEn: string;
  concentrationAr: string;
  volumeEn: string;
  volumeAr: string;
  price: number;
  currencyEn: string;
  currencyAr: string;
  topNotesEn?: string;
  topNotesAr?: string;
  isNew?: boolean;
  isLimited?: boolean;
  inStock?: boolean;
}

// Admin Component Types
export type AdminStatus =
  | 'paid'
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'fulfilled'
  | 'draft'
  | 'archived'
  | 'low_stock'
  | 'cancelled';
export type AdminRole = 'admin' | 'manager' | 'editor' | 'support';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

export interface TranslationSchema {
  [key: string]: any;
  brand: {
    name: string;
    tagline: string;
    essence: string;
  };
  header: {
    tagline: string;
    storefrontComponents: string;
    adminComponents: string;
    showcase: string;
    search: string;
    account: string;
    cart: string;
    menu: string;
    closeMenu: string;
    searchAria: string;
    accountAria: string;
    cartAria: string;
    openNavigation: string;
    closeNavigation: string;
    collectionsMenu: string;
  };
  nav: {
    home: string;
    shop: string;
    collections: string;
    about: string;
    journal: string;
    contact: string;
    storefrontShowcase: string;
    adminShowcase: string;
    viewAllCollections: string;
  };
  utilities: {
    searchTitle: string;
    searchPlaceholder: string;
    recentSearches: string;
    popularNotes: string;
    cartTitle: string;
    emptyCartTitle: string;
    emptyCartSubtitle: string;
    continueShopping: string;
    subtotal: string;
    checkout: string;
    complimentaryShipping: string;
    accountTitle: string;
    accountSubtitle: string;
    signIn: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    vipConcierge: string;
    conciergeDesc: string;
    consultationBooking: string;
  };
  sidebar: {
    directoryStructure: string;
    projectSpecs: string;
    stackLabel: string;
    stackValue: string;
    dirLabel: string;
    dirValue: string;
    copyLabel: string;
    copyValue: string;
  };
  shell: {
    statusTag: string;
    currentLocale: string;
    direction: string;
    viewportLabel: string;
    localeLabel: string;
    foundationPrompt: string;
    heroHeadline: string;
    blankShellMessage: string;
    routes: string;
    routingCardTitle: string;
    directionCardTitle: string;
    componentsCardTitle: string;
    componentsCardValue: string;
  };
  storefrontShowcase: {
    title: string;
    subtitle: string;
    bilingualAuditSection: string;
    bilingualAuditSubtitle: string;
    iconMirroringSection: string;
    iconMirroringSubtitle: string;
    formattingLabSection: string;
    formattingLabSubtitle: string;
    focusOrderSection: string;
    focusOrderSubtitle: string;
    buttonsSection: string;
    inputsSection: string;
    stepperSection: string;
    productsSection: string;
    breadcrumbsSection: string;
    tabsSection: string;
    accordionSection: string;
    badgesSection: string;
    toastSection: string;
    modalSection: string;
    openModalBtn: string;
    triggerToastSuccess: string;
    triggerToastError: string;
    triggerToastWarning: string;
    sideBySideNote: string;
  };
  adminShowcase: {
    title: string;
    subtitle: string;
    dataTableSection: string;
    statusPillsSection: string;
    roleBadgesSection: string;
    formFieldSection: string;
    confirmationSection: string;
    sidebarNavSection: string;
    triggerConfirmBtn: string;
  };
  actions: {
    switchLocale: string;
    ltrEn: string;
    rtlAr: string;
    addToBag: string;
    quickView: string;
    saveChanges: string;
    cancel: string;
    delete: string;
    confirm: string;
    filter: string;
    export: string;
    search: string;
  };
  footer: {
    brandEssence: string;
    support: string;
    conciergeEmail: string;
    privacyPolicy: string;
    termsOfService: string;
    shippingReturns: string;
    allRightsReserved: string;
    navigationHeading: string;
    supportHeading: string;
    legalHeading: string;
    socialHeading: string;
    instagram: string;
    pinterest: string;
    journal: string;
  };
}
