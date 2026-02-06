import { useParams, useNavigate } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { useCallback, useState, useEffect, useRef } from 'react'
import PptxGenJS from 'pptxgenjs'
import html2pdf from 'html2pdf.js'
import type { Slide } from './types'
import './PresentationEditor.css'

const SLIDE_WIDTH = 720
const SLIDE_HEIGHT = 405

const PRESET_COLORS = [
  '#1a1a2e',
  '#16213e',
  '#0f3460',
  '#533483',
  '#1b4332',
  '#2d6a4f',
  '#40916c',
]

const TEMPLATES = [
  { id: 'title', name: 'Title', bg: '#1a1a2e', title: 'Title Slide', content: 'Click to edit' },
  { id: 'content', name: 'Content', bg: '#16213e', title: 'Content', content: 'Add your content here' },
  { id: 'pitch', name: 'Pitch', bg: '#0f3460', title: 'Pitch', content: 'Your key points' },
  { id: 'creative', name: 'Creative', bg: '#533483', title: 'Creative', content: 'Ideas and inspiration' },
]

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
  const current = slidesList[currentIndex]

  const addSlide = useCallback(() => {
    const id = String(Date.now())
    ySlides.push([{ id, title: 'New Slide', content: '', bg: '#16213e' }])
    setCurrentIndex(ySlides.length - 1)
  }, [ySlides])

  const applyTemplate = useCallback(
    (t: (typeof TEMPLATES)[number]) => {
      if (!current) return
      const updated: Slide = {
        ...current,
        bg: t.bg,
        title: t.title,
        content: t.content,
      }
      ySlides.delete(currentIndex, 1)
      ySlides.insert(currentIndex, [updated])
    },
    [current, currentIndex, ySlides]
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

    slidesList.forEach((slide, i) => {
      const page = document.createElement('div')
      page.style.width = `${SLIDE_WIDTH}px`
      page.style.height = `${SLIDE_HEIGHT}px`
      page.style.backgroundColor = slide.bg
      page.style.color = '#fff'
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

      for (const slide of slidesList) {
        const slideConfig = pptx.addSlide()
        slideConfig.background = { color: slide.bg }
        slideConfig.addText(slide.title, {
          x: 0.5,
          y: 1,
          w: 9,
          h: 1,
          fontSize: 28,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
        })
        slideConfig.addText(slide.content, {
          x: 0.5,
          y: 2,
          w: 9,
          h: 3,
          fontSize: 18,
          color: 'FFFFFF',
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
        {/* Left sidebar - Canva style */}
        <aside className="presentation-editor__sidebar">
          <div className="presentation-editor__sidebar-tabs">
            <button
              type="button"
              className={`presentation-editor__sidebar-tab ${sidebarTab === 'design' ? 'active' : ''}`}
              onClick={() => setSidebarTab('design')}
            >
              Design
            </button>
            <button
              type="button"
              className={`presentation-editor__sidebar-tab ${sidebarTab === 'elements' ? 'active' : ''}`}
              onClick={() => setSidebarTab('elements')}
            >
              Elements
            </button>
            <button
              type="button"
              className={`presentation-editor__sidebar-tab ${sidebarTab === 'text' ? 'active' : ''}`}
              onClick={() => setSidebarTab('text')}
            >
              Text
            </button>
          </div>
          <div className="presentation-editor__sidebar-panel">
            {sidebarTab === 'design' && (
              <>
                <p className="presentation-editor__design-label">Templates</p>
                <div className="presentation-editor__template-grid">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="presentation-editor__template-card"
                      style={{ background: t.bg }}
                      onClick={() => applyTemplate(t)}
                      title={t.name}
                    >
                      {t.name}
                    </button>
                  ))}
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
                        style={{ background: s.bg }}
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
                style={{ backgroundColor: current.bg }}
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
