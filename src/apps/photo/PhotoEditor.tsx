import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import {
  Canvas,
  FabricImage,
  Rect,
  Circle,
  FabricText,
  PencilBrush,
  type FabricObject,
  type TPointerEvent,
} from 'fabric'
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import './PhotoEditor.css'

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 600

type Tool = 'select' | 'brush' | 'eraser' | 'rect' | 'ellipse' | 'text'

type PhotoDoc = {
  canvasJson?: string
  width: number
  height: number
}

const defaultDoc: PhotoDoc = {
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
}

export function PhotoEditor() {
  const { docId } = useParams<{ docId: string }>()
  if (!docId) {
    return (
      <EditorLayout title="Photo Editor" toolbar={null}>
        <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>No document selected. Use the dashboard to create a new photo.</div>
      </EditorLayout>
    )
  }
  return <PhotoEditorInner docId={docId} />
}

function PhotoEditorInner({ docId }: { docId: string }) {
  const doc = useYDoc(docId, 'photo')
  const data = useYMap<PhotoDoc>(doc, 'data')
  const state = { ...defaultDoc, ...data }
  const yMap = doc.getMap('data')

  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const [layerTrigger, setLayerTrigger] = useState(0)
  const [tool, setTool] = useState<Tool>('select')
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null)
  const [brushColor, setBrushColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [opacity, setOpacity] = useState(100)
  const [layerName, setLayerName] = useState('')
  const [canvasReady, setCanvasReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const json = JSON.stringify(canvas.toJSON())
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1)
      next.push(json)
      return next.slice(-30)
    })
    setHistoryIndex((prev) => Math.min(prev + 1, 29))
  }, [historyIndex])

  const persistCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const json = JSON.stringify(canvas.toJSON())
    yMap.set('canvasJson', json)
    yMap.set('width', canvas.getWidth())
    yMap.set('height', canvas.getHeight())
  }, [yMap])

  const initBlank = useCallback((canvas: Canvas) => {
    canvas.setDimensions({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT })
    canvas.backgroundColor = '#ffffff'
    canvas.clear()
    canvas.requestRenderAll()
    const bg = new Rect({
      left: 0,
      top: 0,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      fill: '#ffffff',
      selectable: false,
      evented: false,
    })
    ;(bg as unknown as Record<string, unknown>).layerId = 'layer-0'
    ;(bg as unknown as Record<string, unknown>).layerName = 'Background'
    canvas.add(bg)
    canvas.requestRenderAll()
  }, [])

  useLayoutEffect(() => {
    setInitError(null)
    setCanvasReady(false)
    const el = canvasElRef.current
    if (!el) {
      setInitError('Canvas element not found')
      return
    }

    let disposed = false
    try {
      const canvas = new Canvas(el, {
        width: state.width || DEFAULT_WIDTH,
        height: state.height || DEFAULT_HEIGHT,
        backgroundColor: '#ffffff',
      })
      if (disposed) {
        canvas.dispose()
        return
      }
      canvasRef.current = canvas

      if (state.canvasJson) {
        canvas.loadFromJSON(state.canvasJson).then(() => {
          if (disposed) return
          canvas.requestRenderAll()
          setLayerTrigger((t) => t + 1)
          setCanvasReady(true)
        }).catch(() => {
          if (disposed) return
          initBlank(canvas)
          setCanvasReady(true)
        })
      } else {
        initBlank(canvas)
        setCanvasReady(true)
      }

      const handleAdd = () => setLayerTrigger((t) => t + 1)
      const handleRemove = () => setLayerTrigger((t) => t + 1)
      const handleSelect = (e: { selected?: FabricObject[] }) => {
        const obj = e.selected?.[0] ?? null
        setSelectedObject(obj)
        if (obj) {
          setOpacity(Math.round((obj.opacity ?? 1) * 100))
          const name = (obj as unknown as Record<string, unknown>).layerName as string | undefined
          setLayerName(name ?? '')
        }
      }
      const handleModify = () => {
        saveHistory()
        persistCanvas()
        setLayerTrigger((t) => t + 1)
      }

      canvas.on('object:added', handleAdd)
      canvas.on('object:removed', handleRemove)
      canvas.on('selection:created', handleSelect)
      canvas.on('selection:updated', handleSelect)
      canvas.on('selection:cleared', () => {
        setSelectedObject(null)
      })
      canvas.on('object:modified', handleModify)

      return () => {
        disposed = true
        setCanvasReady(false)
        canvas.off('object:added', handleAdd)
        canvas.off('object:removed', handleRemove)
        canvas.off('selection:created', handleSelect)
        canvas.off('selection:updated', handleSelect)
        canvas.off('object:modified', handleModify)
        canvas.dispose()
        canvasRef.current = null
      }
    } catch (err) {
      setInitError(err instanceof Error ? err.message : 'Failed to init canvas')
    }
  }, [docId])

  const objects = canvasRef.current?.getObjects() ?? []
  const layers = [...objects].reverse()

  const addLayer = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.getWidth()
    const h = canvas.getHeight()
    const id = `layer-${Date.now()}`
    const rect = new Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      fill: 'transparent',
      selectable: true,
      evented: true,
    })
    ;(rect as unknown as Record<string, unknown>).layerId = id
    ;(rect as unknown as Record<string, unknown>).layerName = `Layer ${objects.length + 1}`
    canvas.add(rect)
    canvas.setActiveObject(rect)
    setSelectedObject(rect)
    setLayerName(`Layer ${objects.length + 1}`)
    setOpacity(100)
    saveHistory()
    persistCanvas()
    setLayerTrigger((t) => t + 1)
  }

  const deleteSelected = () => {
    const canvas = canvasRef.current
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    canvas.remove(active)
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    setSelectedObject(null)
    saveHistory()
    persistCanvas()
    setLayerTrigger((t) => t + 1)
  }

  const setLayerVisibility = (obj: FabricObject, visible: boolean) => {
    obj.visible = visible
    canvasRef.current?.requestRenderAll()
    persistCanvas()
    setLayerTrigger((t) => t + 1)
  }

  const updateSelectedOpacity = (value: number) => {
    if (!selectedObject) return
    selectedObject.set('opacity', value / 100)
    setOpacity(value)
    canvasRef.current?.requestRenderAll()
    persistCanvas()
  }

  const updateSelectedName = (name: string) => {
    if (!selectedObject) return
    setLayerName(name)
    ;(selectedObject as unknown as Record<string, unknown>).layerName = name
    persistCanvas()
    setLayerTrigger((t) => t + 1)
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const prev = history[historyIndex - 1]
    setHistoryIndex((i) => i - 1)
    canvas.loadFromJSON(prev).then(() => {
      canvas.requestRenderAll()
      setLayerTrigger((t) => t + 1)
    })
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const next = history[historyIndex + 1]
    setHistoryIndex((i) => i + 1)
    canvas.loadFromJSON(next).then(() => {
      canvas.requestRenderAll()
      setLayerTrigger((t) => t + 1)
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.isDrawingMode = tool === 'brush' || tool === 'eraser'
    if (tool === 'brush') {
      const brush = new PencilBrush(canvas)
      brush.color = brushColor
      brush.width = brushSize
      canvas.freeDrawingBrush = brush
    } else if (tool === 'eraser') {
      const brush = new PencilBrush(canvas)
      brush.color = 'rgba(255,255,255,1)'
      brush.width = brushSize * 2
      canvas.freeDrawingBrush = brush
    }
    canvas.requestRenderAll()
  }, [tool, brushColor, brushSize])

  const handleCanvasMouseDown = (opt: { e: TPointerEvent; target?: FabricObject; scenePoint: { x: number; y: number } }) => {
    if (tool === 'rect') {
      const canvas = canvasRef.current
      if (!canvas || opt.target) return
      const pointer = opt.scenePoint
      const rect = new Rect({
        left: pointer.x,
        top: pointer.y,
        width: 0,
        height: 0,
        fill: brushColor,
        stroke: brushColor,
      })
      ;(rect as unknown as Record<string, unknown>).layerId = `layer-${Date.now()}`
      ;(rect as unknown as Record<string, unknown>).layerName = `Rectangle ${objects.length + 1}`
      canvas.add(rect)
      canvas.setActiveObject(rect)
      const start = { x: pointer.x, y: pointer.y }
      const onMove = (ev: { scenePoint: { x: number; y: number } }) => {
        const p = ev.scenePoint
        rect.set({
          width: Math.abs(p.x - start.x),
          height: Math.abs(p.y - start.y),
          left: Math.min(start.x, p.x),
          top: Math.min(start.y, p.y),
        })
        canvas.requestRenderAll()
      }
      const onUp = () => {
        canvas.off('mouse:move', onMove)
        canvas.off('mouse:up', onUp)
        saveHistory()
        persistCanvas()
        setLayerTrigger((t) => t + 1)
      }
      canvas.on('mouse:move', onMove)
      canvas.on('mouse:up', onUp)
    } else if (tool === 'ellipse') {
      const canvas = canvasRef.current
      if (!canvas || opt.target) return
      const pointer = opt.scenePoint
      const rx = 50
      const ry = 30
      const circle = new Circle({
        left: pointer.x - rx,
        top: pointer.y - ry,
        radius: Math.min(rx, ry),
        fill: brushColor,
      })
      ;(circle as unknown as Record<string, unknown>).layerId = `layer-${Date.now()}`
      ;(circle as unknown as Record<string, unknown>).layerName = `Ellipse ${objects.length + 1}`
      canvas.add(circle)
      canvas.setActiveObject(circle)
      saveHistory()
      persistCanvas()
      setLayerTrigger((t) => t + 1)
    } else if (tool === 'text') {
      const canvas = canvasRef.current
      if (!canvas || opt.target) return
      const pointer = opt.scenePoint
      const text = new FabricText('Text', {
        left: pointer.x,
        top: pointer.y,
        fontSize: 24,
        fill: brushColor,
      })
      ;(text as unknown as Record<string, unknown>).layerId = `layer-${Date.now()}`
      ;(text as unknown as Record<string, unknown>).layerName = `Text ${objects.length + 1}`
      canvas.add(text)
      canvas.setActiveObject(text)
      saveHistory()
      persistCanvas()
      setLayerTrigger((t) => t + 1)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (e: { path: FabricObject }) => {
      const path = e.path
      ;(path as unknown as Record<string, unknown>).layerId = `layer-${Date.now()}`
      ;(path as unknown as Record<string, unknown>).layerName = `Path ${canvas.getObjects().length}`
      saveHistory()
      persistCanvas()
      setLayerTrigger((t) => t + 1)
    }
    canvas.on('path:created', handler)
    return () => canvas.off('path:created', handler)
  }, [saveHistory, persistCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (opt: unknown) => handleCanvasMouseDown(opt as { e: TPointerEvent; target?: FabricObject; scenePoint: { x: number; y: number } })
    canvas.on('mouse:down', handler)
    return () => canvas.off('mouse:down', handler)
  }, [tool, brushColor, objects.length])

  const selectLayer = (obj: FabricObject) => {
    canvasRef.current?.setActiveObject(obj)
    canvasRef.current?.requestRenderAll()
    setSelectedObject(obj)
    setOpacity(Math.round((obj.opacity ?? 1) * 100))
    setLayerName(((obj as unknown as Record<string, unknown>).layerName as string) ?? '')
  }

  const openImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    FabricImage.fromURL(url).then((img) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const imgW = img.width ?? 1
      const imgH = img.height ?? 1
      // Resize canvas to match the opened photo
      canvas.setDimensions({ width: imgW, height: imgH })
      canvas.backgroundColor = '#ffffff'
      canvas.clear()
      const bg = new Rect({
        left: 0,
        top: 0,
        width: imgW,
        height: imgH,
        fill: '#ffffff',
        selectable: false,
        evented: false,
      })
      ;(bg as unknown as Record<string, unknown>).layerId = 'layer-0'
      ;(bg as unknown as Record<string, unknown>).layerName = 'Background'
      canvas.add(bg)
      img.set({ left: 0, top: 0 })
      img.scale(1)
      ;(img as unknown as Record<string, unknown>).layerId = `layer-${Date.now()}`
      ;(img as unknown as Record<string, unknown>).layerName = 'Image 1'
      canvas.add(img)
      canvas.centerObject(img)
      canvas.setActiveObject(img)
      setSelectedObject(img)
      setLayerName('Image 1')
      saveHistory()
      persistCanvas()
      setLayerTrigger((t) => t + 1)
      URL.revokeObjectURL(url)
    })
    e.target.value = ''
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `photo-${docId}.png`
    link.href = canvas.toDataURL({ multiplier: 1, format: 'png' })
    link.click()
  }

  const exportJpeg = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `photo-${docId}.jpg`
    link.href = canvas.toDataURL({ multiplier: 1, format: 'jpeg', quality: 0.92 })
    link.click()
  }

  const newDocument = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    initBlank(canvas)
    setHistory([])
    setHistoryIndex(-1)
    setSelectedObject(null)
    setLayerTrigger((t) => t + 1)
    yMap.set('canvasJson', undefined)
    yMap.set('width', DEFAULT_WIDTH)
    yMap.set('height', DEFAULT_HEIGHT)
  }

  return (
    <EditorLayout
      title="Photo Editor"
      toolbar={
        <div className="photo-editor__top-bar">
          <div className="photo-editor__menu-group">
            <button type="button" className="photo-editor__menu-btn" onClick={newDocument}>New</button>
            <button type="button" className="photo-editor__menu-btn" onClick={() => fileInputRef.current?.click()}>Open</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={openImage} style={{ display: 'none' }} />
            <button type="button" className="photo-editor__menu-btn" onClick={exportPng}>Export PNG</button>
            <button type="button" className="photo-editor__menu-btn" onClick={exportJpeg}>Export JPEG</button>
          </div>
          <div className="photo-editor__menu-divider" />
          <div className="photo-editor__menu-group">
            <button type="button" className="photo-editor__menu-btn" onClick={handleUndo} title="Undo" disabled={historyIndex <= 0}>Undo</button>
            <button type="button" className="photo-editor__menu-btn" onClick={handleRedo} title="Redo" disabled={historyIndex >= history.length - 1}>Redo</button>
          </div>
        </div>
      }
    >
      <div className="photo-editor" style={{ height: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="photo-editor__body" style={{ flex: 1, minHeight: 0 }}>
          <div className="photo-editor__left-side">
            <aside className="photo-editor__tool-strip" aria-label="Tools">
              <button type="button" className={`photo-editor__tool-btn ${tool === 'select' ? 'active' : ''}`} onClick={() => setTool('select')} title="Select (V)" aria-pressed={tool === 'select'}>
                <span className="photo-editor__tool-icon" aria-hidden>↖</span>
              </button>
              <button type="button" className={`photo-editor__tool-btn ${tool === 'brush' ? 'active' : ''}`} onClick={() => setTool('brush')} title="Brush (B)" aria-pressed={tool === 'brush'}>
                <span className="photo-editor__tool-icon" aria-hidden>✎</span>
              </button>
              <button type="button" className={`photo-editor__tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')} title="Eraser (E)" aria-pressed={tool === 'eraser'}>
                <span className="photo-editor__tool-icon" aria-hidden>⌫</span>
              </button>
              <button type="button" className={`photo-editor__tool-btn ${tool === 'rect' ? 'active' : ''}`} onClick={() => setTool('rect')} title="Rectangle" aria-pressed={tool === 'rect'}>
                <span className="photo-editor__tool-icon" aria-hidden>▭</span>
              </button>
              <button type="button" className={`photo-editor__tool-btn ${tool === 'ellipse' ? 'active' : ''}`} onClick={() => setTool('ellipse')} title="Ellipse" aria-pressed={tool === 'ellipse'}>
                <span className="photo-editor__tool-icon" aria-hidden>○</span>
              </button>
              <button type="button" className={`photo-editor__tool-btn ${tool === 'text' ? 'active' : ''}`} onClick={() => setTool('text')} title="Text (T)" aria-pressed={tool === 'text'}>
                <span className="photo-editor__tool-icon" aria-hidden>T</span>
              </button>
            </aside>
            <aside className="photo-editor__left-panel">
              <div className="photo-editor__layers-header">
                <span>LAYERS</span>
              </div>
            <div className="photo-editor__layers-list" key={layerTrigger}>
              {layers.map((obj) => {
                const name = (obj as unknown as Record<string, unknown>).layerName as string | undefined
                const isActive = canvasRef.current?.getActiveObject() === obj
                return (
                  <div
                    key={(obj as unknown as Record<string, unknown>).layerId as string || obj.type}
                    className={`photo-editor__layer-item ${isActive ? 'active' : ''}`}
                    onClick={() => selectLayer(obj)}
                  >
                    <span
                      className={`photo-editor__layer-eye ${obj.visible ? '' : 'hidden'}`}
                      onClick={(ev) => { ev.stopPropagation(); setLayerVisibility(obj, !obj.visible); }}
                      role="button"
                      aria-label={obj.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {obj.visible ? '👁' : '👁'}
                    </span>
                    <span className="photo-editor__layer-name">{name ?? obj.type ?? 'Layer'}</span>
                    <button type="button" className="photo-editor__layer-delete" onClick={(ev) => { ev.stopPropagation(); canvasRef.current?.remove(obj); setLayerTrigger((t) => t + 1); }} aria-label="Delete layer">
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
            <button type="button" className="photo-editor__add-layer" onClick={addLayer}>
              + Add layer
            </button>
          </aside>
          </div>

          <div className="photo-editor__canvas-wrap">
            {initError && (
              <div className="photo-editor__canvas-loading" style={{ color: '#e74c3c', padding: 24, textAlign: 'center' }}>
                {initError}
              </div>
            )}
            {!canvasReady && !initError && (
              <div className="photo-editor__canvas-loading" style={{ color: '#999', padding: 24, textAlign: 'center' }}>
                Preparing canvas…
              </div>
            )}
            <div className="photo-editor__canvas-container">
              <canvas
                ref={canvasElRef}
                id="photo-editor-canvas"
                width={state.width || DEFAULT_WIDTH}
                height={state.height || DEFAULT_HEIGHT}
                style={{ display: 'block' }}
              />
            </div>
          </div>

          <aside className="photo-editor__right-panel">
            <div className="photo-editor__props-title">PROPERTIES</div>
            {(tool === 'brush' || tool === 'eraser') && (
              <div className="photo-editor__prop-section">
                <div className="photo-editor__prop-row">
                  <label>Color</label>
                  <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="photo-editor__color-input" title="Brush color" />
                </div>
                <div className="photo-editor__prop-row">
                  <label>Size</label>
                  <div className="photo-editor__slider-wrap">
                    <input type="range" min={1} max={50} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
                    <span>{brushSize}px</span>
                  </div>
                </div>
              </div>
            )}
            {selectedObject ? (
              <div className="photo-editor__prop-section">
                <div className="photo-editor__prop-row">
                  <label>Name</label>
                  <input type="text" value={layerName} onChange={(e) => updateSelectedName(e.target.value)} />
                </div>
                <div className="photo-editor__prop-row">
                  <label>Opacity</label>
                  <div className="photo-editor__slider-wrap">
                    <input type="range" min={0} max={100} value={opacity} onChange={(e) => updateSelectedOpacity(Number(e.target.value))} />
                    <span>{opacity}%</span>
                  </div>
                </div>
                <div className="photo-editor__prop-row">
                  <button type="button" className="photo-editor__delete-layer" onClick={deleteSelected}>
                    Delete layer
                  </button>
                </div>
              </div>
            ) : (
              !(tool === 'brush' || tool === 'eraser') && <p className="photo-editor__no-selection">Select a layer to edit properties.</p>
            )}
          </aside>
        </div>
      </div>
    </EditorLayout>
  )
}
