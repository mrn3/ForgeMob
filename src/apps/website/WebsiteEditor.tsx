import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, TextField, Picker, Item } from '@adobe/react-spectrum'

export type Section = {
  id: string
  type: 'hero' | 'text' | 'gallery' | 'cta'
  heading: string
  body: string
}

export function WebsiteEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'website')
  const sections = useYArray<Section>(doc, 'sections')
  const ySections = doc.getArray('sections')

  useEffect(() => {
    if (ySections.length === 0) {
      ySections.push([{ id: '1', type: 'hero', heading: 'Welcome', body: 'Build your website with blocks.' }])
    }
  }, [])

  const updateSection = (index: number, patch: Partial<Section>) => {
    const s = sections[index]
    if (!s) return
    const updated = { ...s, ...patch }
    ySections.delete(index, 1)
    ySections.insert(index, [updated])
  }

  const addSection = () => {
    ySections.push([
      {
        id: String(Date.now()),
        type: 'text',
        heading: 'New Section',
        body: 'Content here.',
      },
    ])
  }

  return (
    <EditorLayout
      title="Website Builder"
      toolbar={
        <ButtonGroup>
          <Button variant="accent" onPress={addSection}>
            Add section
          </Button>
          <Button variant="secondary" onPress={() => window.print()}>
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 16 }} gap="size-400">
        {sections.map((sec, i) => (
          <Flex key={sec.id} direction="column" gap="size-100" UNSAFE_style={{ padding: 12, backgroundColor: '#f0f0f0' }}>
            <Picker
              label="Section type"
              selectedKey={sec.type}
              onSelectionChange={(k) => updateSection(i, { type: k as Section['type'] })}
            >
              <Item key="hero">Hero</Item>
              <Item key="text">Text</Item>
              <Item key="gallery">Gallery</Item>
              <Item key="cta">CTA</Item>
            </Picker>
            <TextField
              label="Heading"
              value={sec.heading}
              onChange={(v) => updateSection(i, { heading: v })}
            />
            <TextField
              label="Body"
              value={sec.body}
              onChange={(v) => updateSection(i, { body: v })}
            />
          </Flex>
        ))}
      </Flex>
    </EditorLayout>
  )
}
