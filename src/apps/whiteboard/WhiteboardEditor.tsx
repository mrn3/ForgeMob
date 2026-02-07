import { useParams, useNavigate } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { useCallback, useRef, useState } from 'react'
import Menu from '@spectrum-icons/workflow/Menu'
import MoreVertical from '@spectrum-icons/workflow/MoreVertical'
import Sync from '@spectrum-icons/workflow/Sync'
import Chat from '@spectrum-icons/workflow/Chat'
import VideoFilled from '@spectrum-icons/workflow/VideoFilled'
import UserGroup from '@spectrum-icons/workflow/UserGroup'
import Play from '@spectrum-icons/workflow/Play'
import VisitShare from '@spectrum-icons/workflow/VisitShare'
import Edit from '@spectrum-icons/workflow/Edit'
import Hand from '@spectrum-icons/workflow/Hand'
import Note from '@spectrum-icons/workflow/Note'
import Type from '@spectrum-icons/workflow/Type'
import Rectangle from '@spectrum-icons/workflow/Rectangle'
import Circle from '@spectrum-icons/workflow/Circle'
import Link from '@spectrum-icons/workflow/Link'
import Table from '@spectrum-icons/workflow/Table'
import Comment from '@spectrum-icons/workflow/Comment'
import UploadToCloud from '@spectrum-icons/workflow/UploadToCloud'
import Add from '@spectrum-icons/workflow/Add'
import Undo from '@spectrum-icons/workflow/Undo'
import Redo from '@spectrum-icons/workflow/Redo'
import './WhiteboardEditor.css'

export type WhiteboardShape = {
  id: string
  type: 'rect' | 'circle' | 'text' | 'sticky'
  x: number
  y: number
  w: number
  h: number
  text?: string
  color?: string
}

type Tool = 'select' | 'pan' | 'rect' | 'circle' | 'text' | 'sticky'

export function WhiteboardEditor() {
  const { docId } = useParams<{ docId: string }>()
  const navigate = useNavigate()
  const doc = useYDoc(docId!, 'whiteboard')
  const shapes = useYArray<WhiteboardShape>(doc, 'shapes')
  const yShapes = doc.getArray('shapes')
  const [tool, setTool] = useState<Tool>('rect')
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  const addShape = useCallback(
    (shape: Omit<WhiteboardShape, 'id'>) => {
      yShapes.push([{ ...shape, id: String(Date.now()) }])
    },
    [yShapes]
  )

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    if (tool === 'rect') addShape({ type: 'rect', x, y, w: 100, h: 80, color: '#4caf50' })
    if (tool === 'circle') addShape({ type: 'circle', x, y, w: 80, h: 80, color: '#2196f3' })
    if (tool === 'sticky') addShape({ type: 'sticky', x, y, w: 120, h: 100, text: 'Note', color: '#ffeb3b' })
    if (tool === 'text') addShape({ type: 'text', x, y, w: 150, h: 30, text: 'Text' })
  }

  const removeShape = (index: number) => {
    yShapes.delete(index, 1)
  }

  const updateShape = useCallback(
    (index: number, updates: Partial<WhiteboardShape>) => {
      const current = yShapes.get(index) as WhiteboardShape
      if (!current) return
      const next = { ...current, ...updates }
      yShapes.delete(index, 1)
      yShapes.insert(index, [next])
    },
    [yShapes]
  )

  const [editingShapeIndex, setEditingShapeIndex] = useState<number | null>(null)

  const canvasClass = ['whiteboard-canvas']
  if (tool === 'select') canvasClass.push('tool-select')
  if (tool === 'pan') canvasClass.push('tool-pan')

  return (
    <div className="whiteboard-editor">
      {/* Miro-style top bar */}
      <header className="whiteboard-topbar">
        <div className="whiteboard-topbar-left">
          <button
            type="button"
            className="whiteboard-topbar-btn"
            onClick={() => navigate('/')}
            aria-label="Menu"
          >
            <Menu size="S" />
          </button>
          <span style={{ fontWeight: 600, color: '#172b4d', fontSize: 18 }}>ForgeMob</span>
          <h1 className="whiteboard-title">Whiteboard</h1>
          <span className="whiteboard-doc-id">Doc: {docId}</span>
          <button type="button" className="whiteboard-topbar-btn" aria-label="More options">
            <MoreVertical size="S" />
          </button>
        </div>
        <div className="whiteboard-topbar-right">
          <button type="button" className="whiteboard-topbar-btn" aria-label="Sync">
            <Sync size="S" />
          </button>
          <button type="button" className="whiteboard-topbar-btn" aria-label="Chat">
            <Chat size="S" />
          </button>
          <button type="button" className="whiteboard-topbar-btn" aria-label="Video">
            <VideoFilled size="S" />
          </button>
          <button type="button" className="whiteboard-topbar-btn" aria-label="Participants">
            <UserGroup size="S" />
          </button>
          <button type="button" className="whiteboard-topbar-btn" aria-label="Present">
            <Play size="S" />
          </button>
          <button type="button" className="whiteboard-topbar-btn share" aria-label="Share">
            <VisitShare size="S" />
            <span style={{ marginLeft: 6 }}>Share</span>
          </button>
        </div>
      </header>

      <div className="whiteboard-body">
        {/* Left vertical toolbar – Miro-style */}
        <aside className="whiteboard-toolbar">
          <div className="whiteboard-toolbar-section">
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'select' ? 'active' : ''}`}
              onClick={() => setTool('select')}
              aria-label="Select"
              title="Select"
            >
              <Edit size="S" />
            </button>
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'pan' ? 'active' : ''}`}
              onClick={() => setTool('pan')}
              aria-label="Pan"
              title="Pan"
            >
              <Hand size="S" />
            </button>
          </div>
          <div className="whiteboard-toolbar-section">
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'sticky' ? 'active' : ''}`}
              onClick={() => setTool('sticky')}
              aria-label="Sticky note"
              title="Sticky note"
            >
              <Note size="S" />
            </button>
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'text' ? 'active' : ''}`}
              onClick={() => setTool('text')}
              aria-label="Text"
              title="Text"
            >
              <Type size="S" />
            </button>
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'rect' ? 'active' : ''}`}
              onClick={() => setTool('rect')}
              aria-label="Shapes"
              title="Rectangle"
            >
              <Rectangle size="S" />
            </button>
            <button
              type="button"
              className={`whiteboard-toolbar-btn ${tool === 'circle' ? 'active' : ''}`}
              onClick={() => setTool('circle')}
              aria-label="Circle"
              title="Circle"
            >
              <Circle size="S" />
            </button>
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Connector" title="Connector">
              <Link size="S" />
            </button>
          </div>
          <div className="whiteboard-toolbar-section">
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Frame" title="Frame">
              <Table size="S" />
            </button>
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Comment" title="Comment">
              <Comment size="S" />
            </button>
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Upload" title="Upload">
              <UploadToCloud size="S" />
            </button>
            <button type="button" className="whiteboard-toolbar-btn" aria-label="More tools" title="More">
              <Add size="S" />
            </button>
          </div>
          <div className="whiteboard-toolbar-spacer" />
          <div className="whiteboard-toolbar-section">
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Undo" title="Undo">
              <Undo size="S" />
            </button>
            <button type="button" className="whiteboard-toolbar-btn" aria-label="Redo" title="Redo">
              <Redo size="S" />
            </button>
          </div>
        </aside>

        {/* Canvas */}
        <div className="whiteboard-canvas-wrap">
          <div
            ref={containerRef}
            className={canvasClass.join(' ')}
            onClick={handleCanvasClick}
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: '0 0' }}
          >
            {shapes.map((s, i) => {
              const isTextEditable = s.type === 'sticky' || s.type === 'text'
              const isEditing = editingShapeIndex === i
              return (
                <div
                  key={s.id}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation()
                    /* Select tool: focus shape so user can press Delete to remove; do not delete on click so double-click can edit */
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (tool === 'select' && isTextEditable) setEditingShapeIndex(i)
                  }}
                  onKeyDown={(e) => {
                    if (tool === 'select' && (e.key === 'Delete' || e.key === 'Backspace')) {
                      e.preventDefault()
                      removeShape(i)
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: s.x,
                    top: s.y,
                    width: s.w,
                    height: s.h,
                    backgroundColor: s.color ?? '#e0e0e0',
                    border: '2px solid #333',
                    borderRadius: s.type === 'circle' ? '50%' : 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {isEditing ? (
                    <textarea
                      className="whiteboard-shape-edit"
                      value={s.text ?? ''}
                      onChange={(e) => updateShape(i, { text: e.target.value })}
                      onBlur={() => setEditingShapeIndex(null)}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === 'Escape') {
                          setEditingShapeIndex(null)
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      aria-label="Edit note or text"
                    />
                  ) : (
                    s.text ?? s.type
                  )}
                </div>
              )
            })}
          </div>
          <div className="whiteboard-status">
            <button
              type="button"
              className="whiteboard-zoom-btn"
              onClick={() => setZoom((z) => Math.max(25, z - 25))}
              aria-label="Zoom out"
            >
              −
            </button>
            <span>{zoom}%</span>
            <button
              type="button"
              className="whiteboard-zoom-btn"
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
