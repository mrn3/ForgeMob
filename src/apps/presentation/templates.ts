export type Template = {
  id: string
  name: string
  category: string
  bg: string
  title: string
  content: string
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

export const TEMPLATES: Template[] = [
  /* Business */
  { id: 'biz-title', name: 'Executive', category: 'Business', bg: '#1e3a5f', title: 'Title Slide', content: 'Click to edit' },
  { id: 'biz-content', name: 'Corporate', category: 'Business', bg: '#2c5282', title: 'Content', content: 'Add your content here' },
  { id: 'biz-pitch', name: 'Pitch Deck', category: 'Business', bg: '#2d3748', title: 'Key Points', content: 'Your main message' },
  { id: 'biz-report', name: 'Report', category: 'Business', bg: '#1a365d', title: 'Report', content: 'Summary and details' },
  { id: 'biz-meeting', name: 'Meeting', category: 'Business', bg: '#2b6cb0', title: 'Agenda', content: 'Meeting objectives' },
  { id: 'biz-strategy', name: 'Strategy', category: 'Business', bg: '#234e52', title: 'Strategy', content: 'Goals and approach' },
  /* Minimal */
  { id: 'min-title', name: 'Clean Title', category: 'Minimal', bg: '#f8fafc', title: 'Title Slide', content: 'Click to edit', textColor: '#1e293b' },
  { id: 'min-content', name: 'Simple', category: 'Minimal', bg: '#f1f5f9', title: 'Content', content: 'Add your content here', textColor: '#334155' },
  { id: 'min-white', name: 'White', category: 'Minimal', bg: '#ffffff', title: 'Minimal', content: 'Ideas and inspiration', textColor: '#475569' },
  { id: 'min-light', name: 'Light Gray', category: 'Minimal', bg: '#e2e8f0', title: 'Slide', content: 'Your key points', textColor: '#1e293b' },
  { id: 'min-offwhite', name: 'Off-White', category: 'Minimal', bg: '#fafafa', title: 'Presentation', content: 'Add your content here', textColor: '#374151' },
  { id: 'min-slate', name: 'Slate', category: 'Minimal', bg: '#64748b', title: 'Slide', content: 'Content goes here', textColor: '#f8fafc' },
  /* Nature */
  { id: 'nat-forest', name: 'Forest', category: 'Nature', bg: '#1b4332', title: 'Title', content: 'Click to edit' },
  { id: 'nat-leaf', name: 'Leaf', category: 'Nature', bg: '#2d6a4f', title: 'Content', content: 'Add your content here' },
  { id: 'nat-ocean', name: 'Ocean', category: 'Nature', bg: '#0f3460', title: 'Slide', content: 'Your key points' },
  { id: 'nat-sage', name: 'Sage', category: 'Nature', bg: '#40916c', title: 'Presentation', content: 'Ideas and inspiration' },
  { id: 'nat-teal', name: 'Teal', category: 'Nature', bg: '#0d9488', title: 'Slide', content: 'Add your content here' },
  { id: 'nat-earth', name: 'Earth', category: 'Nature', bg: '#4d7c0f', title: 'Title', content: 'Content goes here' },
  /* Creative */
  { id: 'cre-purple', name: 'Creative', category: 'Creative', bg: '#533483', title: 'Title Slide', content: 'Click to edit' },
  { id: 'cre-violet', name: 'Violet', category: 'Creative', bg: '#6d28d9', title: 'Content', content: 'Add your content here' },
  { id: 'cre-fuchsia', name: 'Fuchsia', category: 'Creative', bg: '#a21caf', title: 'Slide', content: 'Your key points' },
  { id: 'cre-rose', name: 'Rose', category: 'Creative', bg: '#be185d', title: 'Presentation', content: 'Ideas and inspiration' },
  { id: 'cre-indigo', name: 'Indigo', category: 'Creative', bg: '#4338ca', title: 'Slide', content: 'Add your content here' },
  { id: 'cre-plum', name: 'Plum', category: 'Creative', bg: '#7c3aed', title: 'Title', content: 'Content goes here' },
  /* Portfolio */
  { id: 'port-title', name: 'Portfolio', category: 'Portfolio', bg: '#1a1a2e', title: 'Portfolio', content: 'Your work' },
  { id: 'port-dark', name: 'Dark Portfolio', category: 'Portfolio', bg: '#16213e', title: 'Projects', content: 'Add your content here' },
  { id: 'port-deep', name: 'Deep Blue', category: 'Portfolio', bg: '#0f3460', title: 'Slide', content: 'Key projects' },
  { id: 'port-navy', name: 'Navy', category: 'Portfolio', bg: '#1e3a5f', title: 'Work', content: 'Ideas and inspiration' },
  { id: 'port-charcoal', name: 'Charcoal', category: 'Portfolio', bg: '#374151', title: 'Title', content: 'Add your content here' },
  { id: 'port-midnight', name: 'Midnight', category: 'Portfolio', bg: '#111827', title: 'Presentation', content: 'Content goes here' },
  /* Modern */
  { id: 'mod-coral', name: 'Coral', category: 'Modern', bg: '#e11d48', title: 'Title Slide', content: 'Click to edit' },
  { id: 'mod-orange', name: 'Orange', category: 'Modern', bg: '#ea580c', title: 'Content', content: 'Add your content here' },
  { id: 'mod-amber', name: 'Amber', category: 'Modern', bg: '#d97706', title: 'Slide', content: 'Your key points' },
  { id: 'mod-sky', name: 'Sky', category: 'Modern', bg: '#0284c7', title: 'Presentation', content: 'Ideas and inspiration' },
  { id: 'mod-cyan', name: 'Cyan', category: 'Modern', bg: '#0891b2', title: 'Slide', content: 'Add your content here' },
  { id: 'mod-emerald', name: 'Emerald', category: 'Modern', bg: '#059669', title: 'Title', content: 'Content goes here' },
  /* Dark */
  { id: 'dark-1', name: 'Dark Slate', category: 'Dark', bg: '#1a1a2e', title: 'Title Slide', content: 'Click to edit' },
  { id: 'dark-2', name: 'Dark Blue', category: 'Dark', bg: '#16213e', title: 'Content', content: 'Add your content here' },
  { id: 'dark-3', name: 'Dark Navy', category: 'Dark', bg: '#0f3460', title: 'Slide', content: 'Your key points' },
  { id: 'dark-4', name: 'Dark Purple', category: 'Dark', bg: '#533483', title: 'Presentation', content: 'Ideas and inspiration' },
  { id: 'dark-5', name: 'Dark Charcoal', category: 'Dark', bg: '#1f2937', title: 'Slide', content: 'Add your content here' },
  { id: 'dark-6', name: 'Dark Gray', category: 'Dark', bg: '#374151', title: 'Title', content: 'Content goes here' },
  /* Gradient (use solid fallback; we'll use linear-gradient in CSS where supported) */
  { id: 'grad-sunset', name: 'Sunset', category: 'Gradient', bg: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)', title: 'Title Slide', content: 'Click to edit' },
  { id: 'grad-ocean', name: 'Ocean', category: 'Gradient', bg: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', title: 'Content', content: 'Add your content here' },
  { id: 'grad-forest', name: 'Forest', category: 'Gradient', bg: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', title: 'Slide', content: 'Your key points' },
  { id: 'grad-royal', name: 'Royal', category: 'Gradient', bg: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', title: 'Presentation', content: 'Ideas and inspiration' },
  { id: 'grad-berry', name: 'Berry', category: 'Gradient', bg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', title: 'Slide', content: 'Add your content here' },
  { id: 'grad-midnight', name: 'Midnight', category: 'Gradient', bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', title: 'Title', content: 'Content goes here' },
]
