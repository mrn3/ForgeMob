export type Template = {
  id: string
  name: string
  category: string
  bg: string
  title: string
  content: string
  /** Optional background image URL for Canva-style photo previews */
  bgImage?: string
  /** Optional text color for light-background templates */
  textColor?: string
}

export const TEMPLATE_CATEGORIES = [
  'Recently used',
  'Business',
  'Minimal',
  'Nature',
  'Creative',
  'Portfolio',
  'Modern',
  'Dark',
  'Gradient',
] as const

/** Base URL for template background images (picsum.photos: deterministic per seed, no auth) */
const IMG = (id: string) => `https://picsum.photos/seed/${id}/400/225`

export const TEMPLATES: Template[] = [
  /* Business – each with a distinct background image */
  { id: 'biz-title', name: 'Executive', category: 'Business', bg: '#1e3a5f', title: 'Title Slide', content: 'Click to edit', bgImage: IMG('biz-title') },
  { id: 'biz-content', name: 'Corporate', category: 'Business', bg: '#2c5282', title: 'Content', content: 'Add your content here', bgImage: IMG('biz-content') },
  { id: 'biz-pitch', name: 'Pitch Deck', category: 'Business', bg: '#2d3748', title: 'Key Points', content: 'Your main message', bgImage: IMG('biz-pitch') },
  { id: 'biz-report', name: 'Report', category: 'Business', bg: '#1a365d', title: 'Report', content: 'Summary and details', bgImage: IMG('biz-report') },
  { id: 'biz-meeting', name: 'Meeting', category: 'Business', bg: '#2b6cb0', title: 'Agenda', content: 'Meeting objectives', bgImage: IMG('biz-meeting') },
  { id: 'biz-strategy', name: 'Strategy', category: 'Business', bg: '#234e52', title: 'Strategy', content: 'Goals and approach', bgImage: IMG('biz-strategy') },
  /* Minimal – light images with dark text */
  { id: 'min-title', name: 'Clean Title', category: 'Minimal', bg: '#f8fafc', title: 'Title Slide', content: 'Click to edit', textColor: '#1e293b', bgImage: IMG('min-title') },
  { id: 'min-content', name: 'Simple', category: 'Minimal', bg: '#f1f5f9', title: 'Content', content: 'Add your content here', textColor: '#334155', bgImage: IMG('min-content') },
  { id: 'min-white', name: 'White', category: 'Minimal', bg: '#ffffff', title: 'Minimal', content: 'Ideas and inspiration', textColor: '#475569', bgImage: IMG('min-white') },
  { id: 'min-light', name: 'Light Gray', category: 'Minimal', bg: '#e2e8f0', title: 'Slide', content: 'Your key points', textColor: '#1e293b', bgImage: IMG('min-light') },
  { id: 'min-offwhite', name: 'Off-White', category: 'Minimal', bg: '#fafafa', title: 'Presentation', content: 'Add your content here', textColor: '#374151', bgImage: IMG('min-offwhite') },
  { id: 'min-slate', name: 'Slate', category: 'Minimal', bg: '#64748b', title: 'Slide', content: 'Content goes here', textColor: '#f8fafc', bgImage: IMG('min-slate') },
  /* Nature */
  { id: 'nat-forest', name: 'Ecosystem', category: 'Nature', bg: '#1b4332', title: 'ECOSYSTEM', content: 'Click to edit', bgImage: IMG('nat-forest') },
  { id: 'nat-leaf', name: 'Nature', category: 'Nature', bg: '#2d6a4f', title: 'Nature', content: 'PRESENTATION', bgImage: IMG('nat-leaf') },
  { id: 'nat-landscape', name: 'Landscape', category: 'Nature', bg: '#2d5016', title: 'Nature', content: 'Your key points', bgImage: IMG('nat-landscape') },
  { id: 'nat-sage', name: 'The Art of Nature', category: 'Nature', bg: '#1e4620', title: 'THE ART OF NATURE', content: 'Ideas and inspiration', bgImage: IMG('nat-sage') },
  { id: 'nat-leaf-split', name: 'Leaf Focus', category: 'Nature', bg: '#e8f5e9', title: 'Slide', content: 'Add your content here', textColor: '#1b5e20', bgImage: IMG('nat-leaf-split') },
  { id: 'nat-earth', name: 'Sostenibilidad', category: 'Nature', bg: '#1e3d1e', title: 'SOSTENIBILIDAD', content: 'Construyendo un mundo sostenible', bgImage: IMG('nat-earth') },
  /* Creative */
  { id: 'cre-purple', name: 'Creative', category: 'Creative', bg: '#533483', title: 'Title Slide', content: 'Click to edit', bgImage: IMG('cre-purple') },
  { id: 'cre-violet', name: 'Violet', category: 'Creative', bg: '#6d28d9', title: 'Content', content: 'Add your content here', bgImage: IMG('cre-violet') },
  { id: 'cre-fuchsia', name: 'Fuchsia', category: 'Creative', bg: '#a21caf', title: 'Slide', content: 'Your key points', bgImage: IMG('cre-fuchsia') },
  { id: 'cre-rose', name: 'Rose', category: 'Creative', bg: '#be185d', title: 'Presentation', content: 'Ideas and inspiration', bgImage: IMG('cre-rose') },
  { id: 'cre-indigo', name: 'Indigo', category: 'Creative', bg: '#4338ca', title: 'Slide', content: 'Add your content here', bgImage: IMG('cre-indigo') },
  { id: 'cre-plum', name: 'Plum', category: 'Creative', bg: '#7c3aed', title: 'Title', content: 'Content goes here', bgImage: IMG('cre-plum') },
  /* Portfolio */
  { id: 'port-title', name: 'Portfolio', category: 'Portfolio', bg: '#1a1a2e', title: 'PORTAFOLIO', content: 'Your work', bgImage: IMG('port-title') },
  { id: 'port-dark', name: 'Dark Portfolio', category: 'Portfolio', bg: '#16213e', title: 'Projects', content: 'Add your content here', bgImage: IMG('port-dark') },
  { id: 'port-minimal', name: 'Minimalist', category: 'Portfolio', bg: '#f5f5f0', title: 'MINIMALIST PHOTOGRAPHY', content: 'Ideas and inspiration', textColor: '#1e293b', bgImage: IMG('port-minimal') },
  { id: 'port-navy', name: 'Navy', category: 'Portfolio', bg: '#1e3a5f', title: 'Work', content: 'Ideas and inspiration', bgImage: IMG('port-navy') },
  { id: 'port-interior', name: 'Interior', category: 'Portfolio', bg: '#c4b8a8', title: 'Diseño interior', content: 'Add your content here', textColor: '#2d2a26', bgImage: IMG('port-interior') },
  { id: 'port-midnight', name: 'Midnight', category: 'Portfolio', bg: '#111827', title: 'Presentation', content: 'Content goes here', bgImage: IMG('port-midnight') },
  /* Modern */
  { id: 'mod-coral', name: 'Coral', category: 'Modern', bg: '#e11d48', title: 'Title Slide', content: 'Click to edit', bgImage: IMG('mod-coral') },
  { id: 'mod-orange', name: 'Orange', category: 'Modern', bg: '#ea580c', title: 'Content', content: 'Add your content here', bgImage: IMG('mod-orange') },
  { id: 'mod-amber', name: 'Amber', category: 'Modern', bg: '#d97706', title: 'Slide', content: 'Your key points', bgImage: IMG('mod-amber') },
  { id: 'mod-sky', name: 'Sky', category: 'Modern', bg: '#0284c7', title: 'Presentation', content: 'Ideas and inspiration', bgImage: IMG('mod-sky') },
  { id: 'mod-cyan', name: 'Cyan', category: 'Modern', bg: '#0891b2', title: 'Slide', content: 'Add your content here', bgImage: IMG('mod-cyan') },
  { id: 'mod-emerald', name: 'Emerald', category: 'Modern', bg: '#059669', title: 'Title', content: 'Content goes here', bgImage: IMG('mod-emerald') },
  /* Dark */
  { id: 'dark-1', name: 'Dark Slate', category: 'Dark', bg: '#1a1a2e', title: 'Title Slide', content: 'Click to edit', bgImage: IMG('dark-1') },
  { id: 'dark-2', name: 'Dark Blue', category: 'Dark', bg: '#16213e', title: 'Content', content: 'Add your content here', bgImage: IMG('dark-2') },
  { id: 'dark-3', name: 'Dark Navy', category: 'Dark', bg: '#0f3460', title: 'Slide', content: 'Your key points', bgImage: IMG('dark-3') },
  { id: 'dark-4', name: 'Dark Purple', category: 'Dark', bg: '#533483', title: 'Presentation', content: 'Ideas and inspiration', bgImage: IMG('dark-4') },
  { id: 'dark-5', name: 'Dark Charcoal', category: 'Dark', bg: '#1f2937', title: 'Slide', content: 'Add your content here', bgImage: IMG('dark-5') },
  { id: 'dark-6', name: 'Dark Gray', category: 'Dark', bg: '#374151', title: 'Title', content: 'Content goes here', bgImage: IMG('dark-6') },
  /* Gradient – overlay image on gradient-like fallback */
  { id: 'grad-sunset', name: 'Sunset', category: 'Gradient', bg: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', title: 'Title Slide', content: 'Click to edit', bgImage: IMG('grad-sunset') },
  { id: 'grad-ocean', name: 'Ocean', category: 'Gradient', bg: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', title: 'Content', content: 'Add your content here', bgImage: IMG('grad-ocean') },
  { id: 'grad-forest', name: 'Forest', category: 'Gradient', bg: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', title: 'Slide', content: 'Your key points', bgImage: IMG('grad-forest') },
  { id: 'grad-royal', name: 'Royal', category: 'Gradient', bg: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', title: 'Presentation', content: 'Ideas and inspiration', bgImage: IMG('grad-royal') },
  { id: 'grad-berry', name: 'Berry', category: 'Gradient', bg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', title: 'Slide', content: 'Add your content here', bgImage: IMG('grad-berry') },
  { id: 'grad-midnight', name: 'Midnight', category: 'Gradient', bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', title: 'Title', content: 'Content goes here', bgImage: IMG('grad-midnight') },
]
