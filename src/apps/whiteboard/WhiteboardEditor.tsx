import { useParams } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, Picker, Item } from '@adobe/react-spectrum'
import { useCallback, useRef, useState } from 'react'

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

export function WhiteboardEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'whiteboard')
  const shapes = useYArray<WhiteboardShape>(doc, 'shapes')
  const yShapes = doc.getArray('shapes')
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'text' | 'sticky'>('rect')
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

  return (
    <EditorLayout
      title="Whiteboard"
      toolbar={
        <ButtonGroup>
          <Picker
            label="Tool"
            selectedKey={tool}
            onSelectionChange={(k) => setTool(k as typeof tool)}
          >
            <Item key="select">Select</Item>
            <Item key="rect">Rectangle</Item>
            <Item key="circle">Circle</Item>
            <Item key="text">Text</Item>
            <Item key="sticky">Sticky</Item>
          </Picker>
          <Button variant="accent" onPress={() => window.print()}>
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex flex={1} UNSAFE_style={{ overflow: 'hidden' }}>
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          style={{
            flex: 1,
            background: 'repeating-conic-gradient(#f0f0f0 0% 25%, #fff 0% 50%) 50% / 20px 20px',
            position: 'relative',
            minHeight: 400,
          }}
        >
          {shapes.map((s, i) => (
            <div
              key={s.id}
              onClick={(e) => {
                e.stopPropagation()
                if (tool === 'select') removeShape(i)
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
              {s.text ?? s.type}
            </div>
          ))}
        </div>
      </Flex>
    </EditorLayout>
  )
}
