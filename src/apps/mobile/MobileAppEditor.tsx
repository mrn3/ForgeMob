import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, TextField, Picker, Item } from '@adobe/react-spectrum'

type MobileDoc = { name: string; screens: string; platform: string }

const defaultDoc: MobileDoc = { name: 'My App', screens: 'Home, Profile, Settings', platform: 'ios' }

export function MobileAppEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'mobile')
  const data = useYMap<MobileDoc>(doc, 'data')
  const state = { ...defaultDoc, ...data }
  const yMap = doc.getMap('data')

  const update = (patch: Partial<MobileDoc>) => {
    Object.entries(patch).forEach(([k, v]) => yMap.set(k, v))
  }

  return (
    <EditorLayout
      title="Mobile App Builder"
      toolbar={
        <ButtonGroup>
          <Button variant="accent" onPress={() => {}}>
            Preview
          </Button>
          <Button variant="secondary" onPress={() => {}}>
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 16 }} gap="size-300">
        <TextField
          label="App name"
          value={state.name}
          onChange={(v) => update({ name: v })}
        />
        <TextField
          label="Screens (comma-separated)"
          value={state.screens}
          onChange={(v) => update({ screens: v })}
        />
        <Picker
          label="Platform"
          selectedKey={state.platform}
          onSelectionChange={(k) => update({ platform: String(k) })}
        >
          <Item key="ios">iOS</Item>
          <Item key="android">Android</Item>
        </Picker>
        <div
          style={{
            border: '2px solid #333',
            borderRadius: 24,
            width: 280,
            height: 560,
            margin: '0 auto',
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ textAlign: 'center', padding: 20 }}>Screen preview</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{state.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{state.screens}</div>
        </div>
      </Flex>
    </EditorLayout>
  )
}
