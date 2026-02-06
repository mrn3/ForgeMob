import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, TextField, Text } from '@adobe/react-spectrum'

type WebAppDoc = { name: string; description: string; pages: string }

const defaultDoc = { name: 'My App', description: '', pages: 'Home, About, Contact' }

export function WebAppEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'webapp')
  const data = useYMap<WebAppDoc>(doc, 'data')
  const state = { ...defaultDoc, ...data }
  const yMap = doc.getMap('data')

  const update = (patch: Partial<WebAppDoc>) => {
    Object.entries(patch).forEach(([k, v]) => yMap.set(k, v))
  }

  return (
    <EditorLayout
      title="Web App Builder"
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
          label="Description"
          value={state.description}
          onChange={(v) => update({ description: v })}
        />
        <TextField
          label="Pages (comma-separated)"
          value={state.pages}
          onChange={(v) => update({ pages: v })}
        />
        <Text UNSAFE_style={{ color: '#666' }}>
          Define your web app structure. Real-time collaboration enabled.
        </Text>
      </Flex>
    </EditorLayout>
  )
}
