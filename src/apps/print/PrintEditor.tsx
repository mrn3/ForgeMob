import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, Picker, Item, TextField } from '@adobe/react-spectrum'

type PrintDoc = {
  template: string
  title: string
  subtitle: string
  width: number
  height: number
}

const TEMPLATES = [
  { id: 'flyer', name: 'Flyer', w: 816, h: 1056 },
  { id: 'poster', name: 'Poster', w: 1056, h: 816 },
  { id: 'card', name: 'Card', w: 612, h: 792 },
  { id: 'a4', name: 'A4', w: 794, h: 1123 },
]

const defaultDoc: PrintDoc = {
  template: 'flyer',
  title: 'Your Title',
  subtitle: 'Subtitle or tagline',
  width: 816,
  height: 1056,
}

export function PrintEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'print')
  const data = useYMap<PrintDoc>(doc, 'data')
  const state = { ...defaultDoc, ...data }
  const yMap = doc.getMap('data')

  const update = (patch: Partial<PrintDoc>) => {
    Object.entries(patch).forEach(([k, v]) => yMap.set(k, v))
  }

  return (
    <EditorLayout
      title="Print"
      toolbar={
        <ButtonGroup>
          <Picker
            label="Template"
            selectedKey={state.template}
            onSelectionChange={(key) => {
              const t = TEMPLATES.find((x) => x.id === key)
              if (t) update({ template: t.id, width: t.w, height: t.h })
            }}
          >
            {TEMPLATES.map((t) => (
              <Item key={t.id}>{t.name}</Item>
            ))}
          </Picker>
          <Button variant="accent" onPress={() => window.print()}>
            Print / PDF
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="row" flex={1} gap="size-400" UNSAFE_style={{ padding: 16 }}>
        <Flex direction="column" width="size-3000" gap="size-200">
          <TextField
            label="Title"
            value={state.title}
            onChange={(v) => update({ title: v })}
          />
          <TextField
            label="Subtitle"
            value={state.subtitle}
            onChange={(v) => update({ subtitle: v })}
          />
        </Flex>
        <Flex flex={1} alignItems="center" justifyContent="center" UNSAFE_style={{ background: '#f0f0f0' }}>
          <div
            style={{
              width: Math.min(400, (state.width / state.height) * 500),
              height: Math.min(520, (state.height / state.width) * 400),
              background: '#fff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700 }}>{state.title}</div>
            <div style={{ fontSize: 16, color: '#666', marginTop: 8 }}>{state.subtitle}</div>
          </div>
        </Flex>
      </Flex>
    </EditorLayout>
  )
}
