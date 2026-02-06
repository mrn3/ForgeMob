import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useYDoc, useYText } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, Text } from '@adobe/react-spectrum'

export function DocsEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'docs')
  const yText = doc.getText('content')
  const content = useYText(doc, 'content')
  useEffect(() => {
    if (yText.length === 0) yText.insert(0, 'Start writing...')
  }, [])

  const updateContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    yText.delete(0, yText.length)
    yText.insert(0, v)
  }

  return (
    <EditorLayout
      title="Docs"
      toolbar={
        <ButtonGroup>
          <Button variant="secondary" onPress={() => document.execCommand('bold')}>
            B
          </Button>
          <Button variant="secondary" onPress={() => document.execCommand('italic')}>
            I
          </Button>
          <Button variant="accent" onPress={() => window.print()}>
            Export / Print
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 16 }} alignItems="center">
        <div style={{ width: '100%', maxWidth: 720 }}>
          <textarea
            value={content}
            onChange={updateContent}
            style={{
              width: '100%',
              minHeight: 400,
              fontSize: 16,
              lineHeight: 1.6,
              border: '1px solid #ccc',
              borderRadius: 8,
              padding: 24,
              fontFamily: 'inherit',
            }}
          />
          <Text UNSAFE_style={{ marginTop: 8, color: '#666' }}>
            Real-time collaboration: edits sync across tabs.
          </Text>
        </div>
      </Flex>
    </EditorLayout>
  )
}
