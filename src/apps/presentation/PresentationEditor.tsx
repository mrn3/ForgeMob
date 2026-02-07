import { useParams, useNavigate } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { useCallback, useState, useEffect, useRef } from 'react'
import PptxGenJS from 'pptxgenjs'
import html2pdf from 'html2pdf.js'
import type { Slide } from './types'
import { TEMPLATES, TEMPLATE_CATEGORIES, type Template } from './templates'
import './PresentationEditor.css'

const SLIDE_WIDTH = 720
const SLIDE_HEIGHT = 405
const RECENT_TEMPLATES_MAX = 6

const PRESET_COLORS = [
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#533483',
  '#1b4332',
  '#2d6a4f',
  '#40916c',
]

/** Nav rail icon: Design (palette) */
function IconDesign() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
/** Nav rail icon: Elements (shapes) */
function IconElements() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      <path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}
/** Nav rail icon: Text */
function IconText() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
  )
}

function initSlides(): Slide[] {
  return [
    { id: '1', title: 'Title Slide', content: 'Click to edit', bg: '#1a1a2e' },
    { id: '2', title: 'Content', content: 'Add your content here', bg: '#16213e' },
  ]
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function PresentationEditor() {
  const { docId } = useParams<{ docId: string }>()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  if (!docId) {
    navigate('/', { replace: true })
    return (
      <div className="presentation-editor">
        <div className="presentation-editor__topbar">
          <span className="presentation-editor__topbar-title">Redirecting…</span>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="presentation-editor" data-loading>
        <header className="presentation-editor__topbar">
          <span className="presentation-editor__topbar-title">Loading presentation…</span>
          <span className="presentation-editor__topbar-doc">Doc: {docId}</span>
        </header>
        <div className="presentation-editor__body" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e7eb' }}>
          <p style={{ margin: 0, fontSize: 15, color: '#6b7280' }}>Opening your presentation…</p>
        </div>
      </div>
    )
  }

  return (
    <PresentationEditorContent docId={docId} navigate={navigate} />
  )
}

function PresentationEditorContent({
  docId,
  navigate,
}: {
  docId: string
  navigate: (to: string) => void
}) {
  const doc = useYDoc(docId, 'presentation')
  const ySlides = doc.getArray('slides')
  const slidesFromY = useYArray<Slide | Slide[]>(doc, 'slides')
  const slidesList: Slide[] =
    slidesFromY.length > 0
      ? slidesFromY.map((item) => (Array.isArray(item) ? item[0] : item)).filter((s): s is Slide => s != null && typeof s === 'object' && 'id' in s)
      : initSlides()
  const pdfExportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ySlides.length === 0) {
      initSlides().forEach((s) => ySlides.push([s]))
    }
  }, [ySlides])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [exporting, setExporting] = useState<'idle' | 'pdf' | 'pptx'>('idle')
  const [sidebarTab, setSidebarTab] = useState<'design' | 'elements' | 'text'>('design')
  const [shareOpen, setShareOpen] = useState(false)
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])
  const current = slidesList[currentIndex]

  const addToRecentlyUsed = useCallback((templateId: string) => {
    setRecentlyUsed((prev) => {
      const next = [templateId, ...prev.filter((id) => id !== templateId)].slice(0, RECENT_TEMPLATES_MAX)
      return next
    })
  }, [])

  const addSlide = useCallback(() => {
    const id = String(Date.now())
    ySlides.push([{ id, title: 'New Slide', content: '', bg: '#16213e' }])
    setCurrentIndex(ySlides.length - 1)
  }, [ySlides])

  const applyTemplate = useCallback(
    (t: Template, toAll: boolean) => {
      const slidePayload = (s: Slide): Slide => ({
        ...s,
        bg: t.bg,
        ...(t.textColor !== undefined ? { textColor: t.textColor } : {}),
      })
      if (toAll) {
        slidesList.forEach((s, i) => {
          const updated = slidePayload(s)
          if (i === 0) {
            updated.title = t.title
            updated.content = t.content
          }
          ySlides.delete(i, 1)
          ySlides.insert(i, [updated])
        })
      } else if (current) {
        const updated: Slide = {
          ...current,
          bg: t.bg,
          title: t.title,
          content: t.content,
          ...(t.textColor !== undefined ? { textColor: t.textColor } : {}),
        }
        ySlides.delete(currentIndex, 1)
        ySlides.insert(currentIndex, [updated])
      }
      addToRecentlyUsed(t.id)
    },
    [current, currentIndex, ySlides, slidesList, addToRecentlyUsed]
  )

  const updateSlide = useCallback(
    (index: number, patch: Partial<Slide>) => {
      const s = slidesList[index]
      if (!s) return
      const updated = { ...s, ...patch }
      ySlides.delete(index, 1)
      ySlides.insert(index, [updated])
    },
    [ySlides, slidesList]
  )

  const exportPdf = useCallback(async () => {
    if (!pdfExportRef.current || slidesList.length === 0) return
    setExporting('pdf')
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.style.width = `${SLIDE_WIDTH}px`
    document.body.appendChild(container)

    const isGradient = (c: string) => typeof c === 'string' && c.startsWith('linear-gradient')
    slidesList.forEach((slide, i) => {
      const page = document.createElement('div')
      page.style.width = `${SLIDE_WIDTH}px`
      page.style.height = `${SLIDE_HEIGHT}px`
      if (isGradient(slide.bg)) {
        page.style.background = slide.bg
      } else {
        page.style.backgroundColor = slide.bg
      }
      page.style.color = slide.textColor ?? '#fff'
      page.style.padding = '24px'
      page.style.boxSizing = 'border-box'
      page.style.display = 'flex'
      page.style.flexDirection = 'column'
      page.style.alignItems = 'center'
      page.style.justifyContent = 'center'
      page.style.textAlign = 'center'
      page.style.pageBreakAfter = i < slidesList.length - 1 ? 'always' : 'auto'
      page.innerHTML = `
        <div style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">${escapeHtml(slide.title)}</div>
        <div style="font-size: 18px; opacity: 0.9; white-space: pre-wrap;">${escapeHtml(slide.content)}</div>
      `
      container.appendChild(page)
    })

    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `presentation-${docId}.pdf`,
          jsPDF: { unit: 'px', format: [SLIDE_WIDTH, SLIDE_HEIGHT], orientation: 'landscape' },
        })
        .from(container)
        .save(`presentation-${docId}.pdf`)
    } finally {
      document.body.removeChild(container)
      setExporting('idle')
    }
  }, [slidesList, docId])

  const exportPptx = useCallback(async () => {
    if (slidesList.length === 0) return
    setExporting('pptx')
    try {
      const pptx = new PptxGenJS()
      pptx.layout = 'LAYOUT_16x9'
      pptx.title = 'ForgeMob Presentation'

      const solidColor = (bg: string) => {
        if (bg.startsWith('linear-gradient')) {
          const match = bg.match(/#[0-9a-fA-F]{6}/)
          return match ? match[0] : '#16213e'
        }
        return bg
      }
      const toPptxHex = (hex: string) => (hex.startsWith('#') ? hex.slice(1) : hex)
      for (const slide of slidesList) {
        const slideConfig = pptx.addSlide()
        const bg = solidColor(slide.bg)
        slideConfig.background = { color: bg.startsWith('#') ? bg.slice(1) : bg }
        const textHex = toPptxHex(slide.textColor ?? '#FFFFFF')
        slideConfig.addText(slide.title, {
          x: 0.5,
          y: 1,
          w: 9,
          h: 1,
          fontSize: 28,
          bold: true,
          color: textHex,
          align: 'center',
        })
        slideConfig.addText(slide.content, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 3,
          fontSize: 18,
          color: textHex,
          align: 'center',
          valign: 'middle',
        })
      }

      await pptx.writeFile({ fileName: `presentation-${docId}.pptx` })
    } finally {
      setExporting('idle')
    }
  }, [slidesList, docId])

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/presentation/${docId}`
    navigator.clipboard.writeText(url)
  }, [docId])

  return (
    <div className="presentation-editor">
      <div ref={pdfExportRef} aria-hidden style={{ position: 'absolute', left: -9999 }} />

      {/* Top bar */}
      <header className="presentation-editor__topbar">
        <button
          type="button"
          className="presentation-editor__topbar-back"
          onClick={() => navigate('/')}
          aria-label="Back to home"
        >
          ←
        </button>
        <h1 className="presentation-editor__topbar-title">Untitled design – Presentation</h1>
        <span className="presentation-editor__topbar-doc">Doc: {docId}</span>
        <div className="presentation-editor__topbar-actions">
          <button
            type="button"
            className="presentation-editor__topbar-btn presentation-editor__topbar-btn--primary"
            onClick={addSlide}
          >
            + Add slide
          </button>
          <button
            type="button"
            className="presentation-editor__topbar-btn presentation-editor__topbar-btn--secondary"
            disabled={exporting !== 'idle'}
            onClick={exportPdf}
          >
            {exporting === 'pdf' ? 'Exporting…' : 'Download PDF'}
          </button>
          <button
            type="button"
            className="presentation-editor__topbar-btn presentation-editor__topbar-btn--secondary"
            disabled={exporting !== 'idle'}
            onClick={exportPptx}
          >
            {exporting === 'pptx' ? 'Exporting…' : 'Download PPTX'}
          </button>
          <button
            type="button"
            className="presentation-editor__topbar-btn presentation-editor__topbar-btn--secondary"
            onClick={() => setShareOpen(true)}
          >
            Share & collaborate
          </button>
        </div>
      </header>

      <div className="presentation-editor__body">
        {/* Canva-style left sidebar: nav rail + expanded panel */}
        <aside className="presentation-editor__sidebar">
          <nav className="presentation-editor__rail" aria-label="Editor tools">
            <button
              type="button"
              className={`presentation-editor__rail-btn ${sidebarTab === 'design' ? 'active' : ''}`}
              onClick={() => setSidebarTab('design')}
              title="Design"
              aria-label="Design"
            >
              <IconDesign />
              <span>Design</span>
            </button>
            <button
              type="button"
              className={`presentation-editor__rail-btn ${sidebarTab === 'elements' ? 'active' : ''}`}
              onClick={() => setSidebarTab('elements')}
              title="Elements"
              aria-label="Elements"
            >
              <IconElements />
              <span>Elements</span>
            </button>
            <button
              type="button"
              className={`presentation-editor__rail-btn ${sidebarTab === 'text' ? 'active' : ''}`}
              onClick={() => setSidebarTab('text')}
              title="Text"
              aria-label="Text"
            >
              <IconText />
              <span>Text</span>
            </button>
          </nav>
          <div className="presentation-editor__panel">
            <div className="presentation-editor__sidebar-tabs">
              <button
                type="button"
                className={`presentation-editor__sidebar-tab ${sidebarTab === 'design' ? 'active' : ''}`}
                onClick={() => setSidebarTab('design')}
              >
                Templates
              </button>
              <button
                type="button"
                className={`presentation-editor__sidebar-tab ${sidebarTab === 'elements' ? 'active' : ''}`}
                onClick={() => setSidebarTab('elements')}
              >
                Layouts
              </button>
              <button
                type="button"
                className={`presentation-editor__sidebar-tab ${sidebarTab === 'text' ? 'active' : ''}`}
                onClick={() => setSidebarTab('text')}
              >
                Styles
              </button>
            </div>
            <div className="presentation-editor__sidebar-panel">
              {sidebarTab === 'design' && (
                <>
                  <p className="presentation-editor__design-hint">
                    Choose a template to apply to the current slide or the whole presentation.
                  </p>
                  {recentlyUsed.length > 0 && (
                    <>
                      <p className="presentation-editor__design-label">Recently used</p>
                      <div className="presentation-editor__template-grid">
                        {recentlyUsed
                          .map((id) => TEMPLATES.find((t) => t.id === id))
                          .filter((t): t is Template => t != null)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="presentation-editor__template-card"
                              style={{ background: t.bg, color: t.textColor ?? '#fff' }}
                              title={t.name}
                              onClick={() => applyTemplate(t, false)}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyTemplate(t, false) } }}
                              role="button"
                              tabIndex={0}
                            >
                              <span className="presentation-editor__template-card-name">{t.name}</span>
                              <span className="presentation-editor__template-card-actions">
                                <button
                                  type="button"
                                  className="presentation-editor__template-apply"
                                  onClick={(e) => { e.stopPropagation(); applyTemplate(t, false) }}
                                  title="Apply to current slide"
                                >
                                  Slide
                                </button>
                                <button
                                  type="button"
                                  className="presentation-editor__template-apply"
                                  onClick={(e) => { e.stopPropagation(); applyTemplate(t, true) }}
                                  title="Apply to all slides"
                                >
                                  All
                                </button>
                              </span>
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                  <p className="presentation-editor__design-label">
                    {recentlyUsed.length > 0 ? 'All templates' : 'Templates'}
                  </p>
                  <div className="presentation-editor__template-scroll">
                    {TEMPLATE_CATEGORIES.filter((c) => c !== 'Recently used').map((category) => {
                      const items = TEMPLATES.filter((t) => t.category === category)
                      if (items.length === 0) return null
                      return (
                        <div key={category} className="presentation-editor__template-section">
                          <p className="presentation-editor__design-label">{category}</p>
                          <div className="presentation-editor__template-grid">
                            {items.map((t) => (
                              <div
                                key={t.id}
                                className="presentation-editor__template-card"
                                style={{ background: t.bg, color: t.textColor ?? '#fff' }}
                                title={t.name}
                                onClick={() => applyTemplate(t, false)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applyTemplate(t, false) } }}
                                role="button"
                                tabIndex={0}
                              >
                              <span className="presentation-editor__template-card-name">{t.name}</span>
                              <span className="presentation-editor__template-card-actions">
                                <button
                                  type="button"
                                  className="presentation-editor__template-apply"
                                  onClick={(e) => { e.stopPropagation(); applyTemplate(t, false) }}
                                  title="Apply to current slide"
                                >
                                  Slide
                                </button>
                                <button
                                  type="button"
                                  className="presentation-editor__template-apply"
                                  onClick={(e) => { e.stopPropagation(); applyTemplate(t, true) }}
                                  title="Apply to all slides"
                                >
                                  All
                                </button>
                              </span>
                            </div>
                          ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="presentation-editor__design-label" style={{ marginTop: 16 }}>
                    Slides
                  </p>
                  <div className="presentation-editor__slides-list">
                    {slidesList.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`presentation-editor__slide-thumb ${i === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(i)}
                      >
                        <span
                          className="presentation-editor__slide-thumb-preview"
                          style={s.bg.startsWith('linear-gradient') ? { background: s.bg } : { backgroundColor: s.bg }}
                        />
                        <span className="presentation-editor__slide-thumb-title">
                          {s.title || `Slide ${i + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {sidebarTab === 'elements' && (
                <p className="presentation-editor__design-label">
                  Shapes, lines, icons — coming soon
                </p>
              )}
              {sidebarTab === 'text' && (
                <p className="presentation-editor__design-label">
                  Add headings, body text — use the canvas to edit
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="presentation-editor__canvas-wrap">
          {current && (
            <>
              <div className="presentation-editor__canvas-toolbar">
                <span className="presentation-editor__canvas-toolbar-label">Slide background</span>
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`presentation-editor__color-swatch ${current.bg === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                    onClick={() => updateSlide(currentIndex, { bg: color })}
                  />
                ))}
                <input
                  type="color"
                  className="presentation-editor__color-picker"
                  value={current.bg}
                  onChange={(e) => updateSlide(currentIndex, { bg: e.target.value })}
                  title="Custom color"
                />
              </div>
              <div
                className="presentation-editor__canvas"
                style={
                  current.bg.startsWith('linear-gradient')
                    ? { background: current.bg, color: current.textColor ?? '#fff' }
                    : { backgroundColor: current.bg, color: current.textColor ?? '#fff' }
                }
              >
                <input
                  className="presentation-editor__canvas-title"
                  value={current.title}
                  onChange={(e) => updateSlide(currentIndex, { title: e.target.value })}
                  placeholder="Slide title"
                />
                <textarea
                  className="presentation-editor__canvas-content"
                  value={current.content}
                  onChange={(e) => updateSlide(currentIndex, { content: e.target.value })}
                  placeholder="Add your content here"
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Bottom bar: pages + zoom */}
      <div className="presentation-editor__bottombar">
        <div className="presentation-editor__pages">
          <button
            type="button"
            className="presentation-editor__add-page"
            onClick={addSlide}
            aria-label="Add slide"
          >
            +
          </button>
          <span>
            Pages {currentIndex + 1}/{slidesList.length}
          </span>
        </div>
        <span className="presentation-editor__zoom">100%</span>
      </div>

      {/* Share modal */}
      {shareOpen && (
        <div
          className="presentation-editor__modal-backdrop"
          onClick={() => setShareOpen(false)}
          role="presentation"
        >
          <div
            className="presentation-editor__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <h2 id="share-modal-title" className="presentation-editor__modal-title">
              Collaborate on this presentation
            </h2>
            <p className="presentation-editor__modal-text">
              Anyone with this link can view and edit in real time. Open the same link in another
              tab or send it to a teammate to collaborate.
            </p>
            <div className="presentation-editor__modal-input-wrap">
              <input
                type="text"
                className="presentation-editor__modal-input"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/presentation/${docId}`}
              />
              <button
                type="button"
                className="presentation-editor__modal-copy"
                onClick={copyShareLink}
              >
                Copy link
              </button>
            </div>
            <p className="presentation-editor__modal-docid">Doc ID: {docId}</p>
            <button
              type="button"
              className="presentation-editor__topbar-btn presentation-editor__topbar-btn--secondary"
              onClick={() => setShareOpen(false)}
              style={{ marginTop: 8 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
