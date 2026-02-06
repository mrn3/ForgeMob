import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Document from '@spectrum-icons/workflow/Document'
import Image from '@spectrum-icons/workflow/Image'
import Filmroll from '@spectrum-icons/workflow/Filmroll'
import Type from '@spectrum-icons/workflow/Type'
import Table from '@spectrum-icons/workflow/Table'
import Draw from '@spectrum-icons/workflow/Draw'
import Globe from '@spectrum-icons/workflow/Globe'
import DevicePhone from '@spectrum-icons/workflow/DevicePhone'
import FileTemplate from '@spectrum-icons/workflow/FileTemplate'
import WebPage from '@spectrum-icons/workflow/WebPage'
import Add from '@spectrum-icons/workflow/Add'
import Home from '@spectrum-icons/workflow/Home'
import Folder from '@spectrum-icons/workflow/Folder'
import Search from '@spectrum-icons/workflow/Search'
import './Dashboard.css'

const APP_TYPES = [
  { id: 'presentation', name: 'Presentations', path: '/presentation', icon: Document, desc: 'Slides and decks', pastel: '#fef9c3' },
  { id: 'social', name: 'Social Media', path: '/social', icon: Image, desc: 'Posts and stories', pastel: '#e9d5ff' },
  { id: 'video', name: 'Video', path: '/video', icon: Filmroll, desc: 'Video editor', pastel: '#dbeafe' },
  { id: 'print', name: 'Print', path: '/print', icon: FileTemplate, desc: 'Flyers, posters, cards', pastel: '#d1fae5' },
  { id: 'docs', name: 'Docs', path: '/docs', icon: Type, desc: 'Documents', pastel: '#fce7f3' },
  { id: 'whiteboard', name: 'Whiteboard', path: '/whiteboard', icon: Draw, desc: 'Infinite canvas', pastel: '#e0e7ff' },
  { id: 'sheets', name: 'Sheets', path: '/sheets', icon: Table, desc: 'Spreadsheets', pastel: '#ccfbf1' },
  { id: 'website', name: 'Websites', path: '/website', icon: Globe, desc: 'Website builder', pastel: '#fed7aa' },
  { id: 'webapp', name: 'Web Apps', path: '/webapp', icon: WebPage, desc: 'Web app builder', pastel: '#fbcfe8' },
  { id: 'mobile', name: 'Mobile Apps', path: '/mobile', icon: DevicePhone, desc: 'Mobile app builder', pastel: '#c7d2fe' },
  { id: 'photo', name: 'Photo Editor', path: '/photo', icon: Image, desc: 'Edit photos', pastel: '#ddd6fe' },
] as const

function generateId() {
  return Math.random().toString(36).slice(2, 11)
}

export function Dashboard() {
  const navigate = useNavigate()
  const [docName, setDocName] = useState('')
  const [creatingFor, setCreatingFor] = useState<typeof APP_TYPES[number] | null>(null)
  const [activeTab, setActiveTab] = useState<'designs' | 'templates' | 'ai'>('templates')

  const createAndOpen = (app: typeof APP_TYPES[number]) => {
    const docId = generateId()
    navigate(`${app.path}/${docId}`)
  }

  const openWithName = () => {
    if (!creatingFor) return
    const docId = docName.trim() || generateId()
    navigate(`${creatingFor.path}/${docId}`)
    setCreatingFor(null)
    setDocName('')
  }

  const exploreCards = APP_TYPES.slice(0, 6)

  return (
    <div className="dashboard canva-app-root">
      {/* Left sidebar - Canva style */}
      <aside className="sidebar">
        <div style={{ padding: '8px 0', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.02em' }} aria-hidden>ForgeMob</div>
        <button type="button" className="sidebar-item sidebar-create" aria-label="Create">
          <Add size="S" />
        </button>
        <button type="button" className="sidebar-item" aria-label="Home">
          <span className="sidebar-icon"><Home size="S" /></span>
        </button>
        <button type="button" className="sidebar-item" aria-label="Projects">
          <span className="sidebar-icon"><Folder size="S" /></span>
        </button>
        <button type="button" className="sidebar-item active" aria-label="Templates">
          <span className="sidebar-icon"><FileTemplate size="S" /></span>
        </button>
        <div className="sidebar-spacer" />
        <div className="sidebar-item" aria-hidden style={{ cursor: 'default', position: 'relative' }}>
          <span className="sidebar-icon">🔔</span>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
        </div>
        <div className="sidebar-item" aria-label="Profile" style={{ borderRadius: '50%', overflow: 'hidden' }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', borderRadius: '50%' }} />
        </div>
      </aside>

      <main className="main">
        <section className="hero">
          <h1 className="hero-title">What will you design today?</h1>
          <button type="button" className="hero-cta">
            Start creating — free
          </button>
        </section>

        <div className="pill-tabs">
          <button type="button" className={`pill-tab ${activeTab === 'designs' ? 'active' : ''}`} onClick={() => setActiveTab('designs')}>
            Your designs
          </button>
          <button type="button" className={`pill-tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            Templates
          </button>
          <button type="button" className={`pill-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
            ForgeMob AI
          </button>
        </div>

        <div className="search-wrap">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden><Search size="S" /></span>
            <input type="search" className="search-bar" placeholder="Search millions of templates" aria-label="Search templates" />
          </div>
        </div>

        <h2 className="section-title">Explore templates</h2>
        <div className="explore-row">
          {exploreCards.map((app) => {
            const Icon = app.icon
            return (
              <button
                key={app.id}
                type="button"
                className="explore-card"
                style={{ background: app.pastel }}
                onClick={() => createAndOpen(app)}
              >
                <span style={{ marginBottom: 'auto', opacity: 0.9 }}><Icon size="S" /></span>
                {app.name}
              </button>
            )
          })}
        </div>

        <h2 className="section-title">Create new</h2>
        <div className="app-grid">
          {APP_TYPES.map((app) => {
            const Icon = app.icon
            return (
              <div
                key={app.id}
                className="app-card"
                onClick={() => createAndOpen(app)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); createAndOpen(app); } }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${app.name}, ${app.desc}`}
              >
                <div className="app-card-icon-wrap">
                  <Icon size="L" />
                </div>
                <h3 className="app-card-title">{app.name}</h3>
                <p className="app-card-desc">{app.desc}</p>
                <button type="button" className="app-card-btn" onClick={(e) => { e.stopPropagation(); createAndOpen(app); }}>
                  New
                </button>
                <button
                  type="button"
                  className="modal-btn-secondary"
                  style={{ marginTop: -4 }}
                  onClick={(e) => { e.stopPropagation(); setCreatingFor(app); setDocName(''); }}
                >
                  Open by ID
                </button>
              </div>
            )
          })}
        </div>
      </main>

      {creatingFor && (
        <div className="modal-backdrop" onClick={() => setCreatingFor(null)} role="presentation">
          <div className="modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h2 id="modal-title" className="modal-title">Open {creatingFor.name} document</h2>
            <label className="modal-label" htmlFor="doc-id-input">Document ID</label>
            <input
              id="doc-id-input"
              type="text"
              className="modal-input"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Paste ID to join collaboration"
            />
            <div className="modal-actions">
              <button type="button" className="modal-btn-primary" onClick={openWithName}>Open</button>
              <button type="button" className="modal-btn-secondary" onClick={() => setCreatingFor(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
