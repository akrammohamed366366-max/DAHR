/**
 * DAHR Bilingual Design System - Icon Mirroring Rules & Specification
 * 
 * CORE PRINCIPLE:
 * In right-to-left (RTL) scripts like Arabic, visual reading flow flows from right to left.
 * However, only icons with semantic spatial/directional meaning (flow of time, navigation forward/back)
 * should flip. Real-world objects and symmetrical symbols must remain unflipped.
 */

export interface IconRuleDefinition {
  name: string;
  category: 'directional' | 'non-directional';
  shouldFlipInRtl: boolean;
  rationale: string;
  examples: string[];
}

export const ICON_MIRRORING_RULES: Record<string, IconRuleDefinition> = {
  // DIRECTIONAL ICONS (MUST FLIP IN RTL)
  navigationArrows: {
    name: 'Navigation Arrows & Chevrons',
    category: 'directional',
    shouldFlipInRtl: true,
    rationale: 'Indicates progression along the reading axis. Next is Left in RTL; Previous is Right in RTL.',
    examples: ['ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronLeft', 'MoveRight', 'MoveLeft'],
  },
  hierarchicalPointers: {
    name: 'Breadcrumb Separators & Deep Links',
    category: 'directional',
    shouldFlipInRtl: true,
    rationale: 'Breadcrumbs descend deeper into the hierarchy along the reading direction.',
    examples: ['ChevronRight (breadcrumbs)', 'ArrowUpRight (external link)'],
  },
  flowAndHistory: {
    name: 'Flow & Temporal State',
    category: 'directional',
    shouldFlipInRtl: true,
    rationale: 'Represents temporal motion backwards into history or forwards into the future.',
    examples: ['Undo', 'Redo', 'Reply', 'Forward'],
  },

  // NON-DIRECTIONAL ICONS (MUST NOT FLIP IN RTL)
  commerceObjects: {
    name: 'Commerce & Bag Objects',
    category: 'non-directional',
    shouldFlipInRtl: false,
    rationale: 'Represents physical objects with real-world orientation. Flipping creates unnatural distortion.',
    examples: ['ShoppingBag', 'ShoppingCart', 'Package', 'Tag', 'CreditCard'],
  },
  searchAndDiscovery: {
    name: 'Search & Tools',
    category: 'non-directional',
    shouldFlipInRtl: false,
    rationale: 'Magnifying glass handle orientation is standardized worldwide (45-degree lower right).',
    examples: ['Search', 'Sliders', 'SlidersHorizontal', 'Filter'],
  },
  userAndIdentity: {
    name: 'User & Authentication',
    category: 'non-directional',
    shouldFlipInRtl: false,
    rationale: 'Universal symbolic figures have no directional axis.',
    examples: ['User', 'Users', 'Shield', 'ShieldCheck', 'Lock', 'Key'],
  },
  genericActions: {
    name: 'Universal Dialog & Item Controls',
    category: 'non-directional',
    shouldFlipInRtl: false,
    rationale: 'Symmetrical mathematical symbols (plus, minus, close X, checkmark).',
    examples: ['X (Close)', 'Plus', 'Minus', 'Check', 'CheckCircle', 'AlertCircle', 'Info'],
  },
  sentimentAndEngagement: {
    name: 'Sentiment & Bookmarks',
    category: 'non-directional',
    shouldFlipInRtl: false,
    rationale: 'Heart and bookmark icons are inherently symmetrical or object-based.',
    examples: ['Heart', 'Bookmark', 'Star', 'Share2'],
  },
};

/**
 * Utility helper to determine if an icon name should flip in RTL
 */
export function isDirectionalIcon(iconName: string): boolean {
  const directionalPatterns = [
    /arrow/i,
    /chevron/i,
    /caret/i,
    /next/i,
    /prev/i,
    /forward/i,
    /backward/i,
    /undo/i,
    /redo/i,
    /reply/i,
    /corner/i,
  ];

  // Exceptions that might match regex but are non-directional
  if (/chevrondown|chevronup|arrowdown|arrowup/i.test(iconName)) {
    return false; // Vertical chevrons/arrows don't flip horizontally
  }

  return directionalPatterns.some((pattern) => pattern.test(iconName));
}
