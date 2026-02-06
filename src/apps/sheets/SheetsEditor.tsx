import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import React from 'react'
import { Flex, Button, ButtonGroup, Text } from '@adobe/react-spectrum'

const COLS = 10
const ROWS = 20
const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, COLS).split('')

function getCellKey(r: number, c: number) {
  return `${COL_LETTERS[c]}${r + 1}`
}

export function SheetsEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'sheets')
  const cells = useYMap<Record<string, string>>(doc, 'cells')
  const yMap = doc.getMap('cells')

  const setCell = (key: string, value: string) => {
    yMap.set(key, value)
  }

  return (
    <EditorLayout
      title="Sheets"
      toolbar={
        <ButtonGroup>
          <Button variant="accent" onPress={() => window.print()}>
            Export
          </Button>
        </ButtonGroup>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 8, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${COLS}, 120px)` }}>
          <div style={{ background: '#f5f5f5', padding: 8, border: '1px solid #ddd' }} />
          {COL_LETTERS.map((col) => (
            <div
              key={col}
              style={{
                background: '#f5f5f5',
                padding: 8,
                border: '1px solid #ddd',
                fontWeight: 600,
              }}
            >
              {col}
            </div>
          ))}
          {Array.from({ length: ROWS }, (_, r) => (
            <React.Fragment key={r}>
              <div
                key={`row-${r}`}
                style={{ background: '#f5f5f5', padding: 8, border: '1px solid #ddd', fontWeight: 600 }}
              >
                {r + 1}
              </div>
              {COL_LETTERS.map((_, c) => {
                const key = getCellKey(r, c)
                const value = cells[key] ?? ''
                return (
                  <input
                    key={key}
                    type="text"
                    value={value}
                    onChange={(e) => setCell(key, e.target.value)}
                    style={{
                      padding: 6,
                      border: '1px solid #ddd',
                      fontSize: 13,
                    }}
                  />
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <Text UNSAFE_style={{ marginTop: 8 }}>Collaborative spreadsheet — cells sync in real time.</Text>
      </Flex>
    </EditorLayout>
  )
}
