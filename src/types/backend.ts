// ============================================================================
// DAHR BILINGUAL DATA MODELS & TYPES
// Strictly bilingual object shape { en: string; ar: string } for all user text
// ============================================================================

export interface BilingualText {
  en: string;
  ar: string;
}

// ----------------------------------------------------------------------------
// Scent Families
// ----------------------------------------------------------------------------
export type ScentFamily = 
  | 'Woody' 
  | 'Floral' 
  | 'Oriental' 
  | 'Fresh' 
  | 'Amber' 
  | 'Musk';

export interface NotesPyramid {
  top: BilingualText;
  heart: BilingualText;
  base: BilingualText;
}

export interface ProductSizeVariant {
  size: string; // e.g. "50ml", "100ml", "10ml Discovery"
  price: number; // in USD base
  stock: number;
}

export interface ProductFlags {
  isNew?: boolean;
  isSignature?: boolean;
  isFeatured?: boolean;
}

export type ProductStatus = 'draft' | 'active';

export interface Product {
  id: string;
  name: BilingualText;
  shortDescriptor: BilingualText;
  longDescription: BilingualText;
  scentFamily: ScentFamily;
  notes: NotesPyramid;
  sizes: ProductSizeVariant[];
  images: string[];
  flags: ProductFlags;
  searchKeywords?: string[];
  status: ProductStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ----------------------------------------------------------------------------
// Journal Articles
// ----------------------------------------------------------------------------
export type ArticleStatus = 'draft' | 'published';

export interface JournalArticle {
  id: string;
  title: BilingualText;
  excerpt: BilingualText;
  body: BilingualText;
  heroImage: string;
  status: ArticleStatus;
  publishedAt: string; // ISO 8601
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------------------------------------------
// Orders
// ----------------------------------------------------------------------------
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string; // ISO 8601
  notes?: string;
  updatedBy?: string;
}

export interface OrderCustomer {
  uid: string | null; // null for guest checkout
  name: string;
  email: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    country: string;
    postalCode?: string;
  };
}

export interface OrderItem {
  productId: string;
  name: BilingualText;
  size: string;
  qty: number;
  price: number;
  image?: string;
  concentration?: BilingualText;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  totalAmount?: number;
  shippingFee?: number;
  status: OrderStatus;
  createdAt: string; // ISO 8601
  updatedAt?: string;
  internalNotes?: string;
  statusHistory?: OrderStatusHistoryEntry[];
}

// ----------------------------------------------------------------------------
// Admin & Users
// ----------------------------------------------------------------------------
export type AdminRole = 'fullAdmin' | 'staff';
export type AdminUserStatus = 'active' | 'deactivated';

export interface AdminUser {
  uid: string;
  email: string;
  role: AdminRole;
  displayName: string;
  status?: AdminUserStatus | string;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

export interface UserAddress {
  recipientName?: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  address?: UserAddress;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ----------------------------------------------------------------------------
// Wishlists & Carts
// ----------------------------------------------------------------------------
export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
  updatedAt: string;
}

export interface CartItemRecord {
  productId: string;
  size: string;
  quantity: number;
  addedAt: string;
  nameEn?: string;
  nameAr?: string;
  concentrationEn?: string;
  concentrationAr?: string;
  volumeEn?: string;
  volumeAr?: string;
  price?: number;
  image?: string;
}

export interface CartRecord {
  userId: string;
  items: CartItemRecord[];
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Site Settings (Contact & Branding)
// ----------------------------------------------------------------------------
export interface ContactSettings {
  facebookPage?: string;
  facebookGroup?: string;
  instagram?: string;
  whatsappNumber?: string;
  whatsappGroup?: string;
  telegramChannel?: string;
  telegramGroup?: string;
  updatedAt?: string;
}

export interface BrandingSettings {
  logoImageUrl?: string;
  siteName: BilingualText;
  updatedAt?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string; // ISO 8601
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  subscribedAt: string; // ISO 8601
  locale: 'en' | 'ar';
}
