import { useParams } from 'react-router-dom'
import { useYDoc, useYArray } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import { Flex, ButtonGroup, Button, Text } from '@adobe/react-spectrum'

export type VideoClip = { id: string; name: string; start: number; duration: number; type: 'video' | 'text' }

export function VideoEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'video')
  const clips = useYArray<VideoClip>(doc, 'clips')
  const yClips = doc.getArray('clips')

  const addClip = () => {
    yClips.push([
      {
        id: String(Date.now()),
        name: `Clip ${clips.length + 1}`,
        start: clips.reduce((s, c) => s + c.duration, 0),
        duration: 5,
        type: 'video',
      },
    ])
  }

  const addTextOverlay = () => {
    yClips.push([
      {
        id: String(Date.now()),
        name: 'Text overlay',
        start: clips.reduce((s, c) => s + c.duration, 0),
        duration: 3,
        type: 'text',
      },
    ])
  }

  return (
    <EditorLayout
      title="Video Editor"
      toolbar={
        <ButtonGroup>
          <Button variant="accent" onPress={addClip}>
            Add clip
          </Button>
          <Button variant="secondary" onPress={addTextOverlay}>
            Add text
          </Button>
          <Button variant="secondary" onPress={() => {}}>
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 16 }} gap="size-400">
        <Flex
          UNSAFE_style={{
            height: 280,
            background: '#1a1a1a',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
          }}
        >
          Preview
        </Flex>
        <Flex direction="column" gap="size-100">
          <Text>Timeline — collaborative</Text>
          <Flex gap="size-100" wrap>
            {clips.length === 0 ? (
              <Text UNSAFE_style={{ color: '#888' }}>Add clips to build your video</Text>
            ) : (
              clips.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '8px 16px',
                    background: c.type === 'text' ? '#4caf50' : '#2196f3',
                    color: '#fff',
                    borderRadius: 4,
                    minWidth: 80,
                  }}
                >
                  {c.name} ({c.duration}s)
                </div>
              ))
            )}
          </Flex>
        </Flex>
      </Flex>
    </EditorLayout>
  )
}
