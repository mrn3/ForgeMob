import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, Button, ButtonGroup, TextField, Picker, Item } from '@adobe/react-spectrum'

const TEMPLATES = [
  { id: 'instagram-post', name: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'instagram-story', name: 'Instagram Story', w: 1080, h: 1920 },
  { id: 'facebook', name: 'Facebook Post', w: 1200, h: 630 },
  { id: 'twitter', name: 'Twitter Post', w: 1200, h: 675 },
  { id: 'linkedin', name: 'LinkedIn', w: 1200, h: 627 },
  { id: 'pinterest', name: 'Pinterest', w: 1000, h: 1500 },
]

type SocialDoc = { template: string; headline: string; body: string; width: number; height: number }

const defaultDoc: SocialDoc = {
  template: 'instagram-post',
  headline: 'Your Headline',
  body: 'Add your message here.',
  width: 1080,
  height: 1080,
}

export function SocialEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'social')
  const data = useYMap<SocialDoc>(doc, 'data')
  const state = { ...defaultDoc, ...data }
  const yMap = doc.getMap('data')

  const update = (patch: Partial<SocialDoc>) => {
    Object.entries(patch).forEach(([k, v]) => yMap.set(k, v))
  }

  return (
    <EditorLayout
      title="Social Media"
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
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="row" flex={1} gap="size-400" UNSAFE_style={{ padding: 16 }}>
        <Flex direction="column" width="size-3000" gap="size-200">
          <TextField
            label="Headline"
            value={state.headline}
            onChange={(v) => update({ headline: v })}
          />
          <TextField
            label="Body"
            value={state.body}
            onChange={(v) => update({ body: v })}
            width="100%"
          />
        </Flex>
        <Flex
          flex={1}
          alignItems="center"
          justifyContent="center"
          UNSAFE_style={{ background: '#f0f0f0', borderRadius: 8 }}
        >
          <div
            style={{
              width: Math.min(400, (state.width / state.height) * 400),
              height: Math.min(400, (state.height / state.width) * 400),
              maxWidth: 500,
              maxHeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              color: '#fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, textAlign: 'center' }}>{state.headline}</div>
            <div style={{ fontSize: 14, marginTop: 8, textAlign: 'center' }}>{state.body}</div>
          </div>
        </Flex>
      </Flex>
    </EditorLayout>
  )
}
