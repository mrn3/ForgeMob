import { useParams } from 'react-router-dom'
import { useYDoc, useYMap } from '@/collab/useCollaboration'
import { EditorLayout } from '@/components/EditorLayout'
import React, { useEffect, useState, useCallback } from 'react'
import * as Y from 'yjs'
import {
  Flex,
  Button,
  ButtonGroup,
  Text,
  Picker,
  Item,
  DialogTrigger,
  Dialog,
  Content,
  Heading,
  TextField,
  Checkbox,
  ActionButton,
  TooltipTrigger,
  Tooltip,
} from '@adobe/react-spectrum'
import Filter from '@spectrum-icons/workflow/Filter'
import Edit from '@spectrum-icons/workflow/Edit'
import type { ColumnDef, ColumnFilter, ColumnType, CellFormat, FilterCondition } from './types'
import {
  getCellKey,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_COLUMN_DEF,
} from './types'
import './SheetsEditor.css'

const COLS = 15
const ROWS = 50

const COLUMN_TYPE_OPTIONS: { type: ColumnType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'currency', label: 'Currency' },
  { type: 'percent', label: 'Percent' },
  { type: 'date', label: 'Date' },
  { type: 'datetime', label: 'Date & time' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'single_select', label: 'Single select' },
  { type: 'multi_select', label: 'Multi select' },
  { type: 'url', label: 'URL' },
  { type: 'email', label: 'Email' },
  { type: 'rating', label: 'Rating' },
]

const FILTER_CONDITIONS: { value: FilterCondition; label: string }[] = [
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'greater_than_or_equal', label: 'Greater than or equal' },
  { value: 'less_than', label: 'Less than' },
  { value: 'less_than_or_equal', label: 'Less than or equal' },
  { value: 'is_checked', label: 'Is checked' },
  { value: 'is_not_checked', label: 'Is not checked' },
]

function ensureColumnDefs(doc: Y.Doc) {
  const defsMap = doc.getMap('columnDefs')
  if (defsMap.size > 0) return
  for (let i = 0; i < COLS; i++) {
    const m = new Y.Map()
    const def = DEFAULT_COLUMN_DEF(i)
    m.set('id', def.id)
    m.set('name', def.name)
    m.set('type', def.type)
    m.set('width', def.width ?? DEFAULT_COLUMN_WIDTH)
    defsMap.set(String(i), m)
  }
}

function getColumnDef(defs: Record<string, ColumnDef>, colIndex: number): ColumnDef {
  const key = String(colIndex)
  const stored = defs[key]
  if (stored) return stored
  return DEFAULT_COLUMN_DEF(colIndex)
}

function matchesFilter(
  cellValue: string,
  filter: ColumnFilter,
  colDef: ColumnDef
): boolean {
  if (!filter.enabled) return true
  const raw = cellValue?.trim() ?? ''
  const empty = raw === ''

  switch (filter.condition) {
    case 'is_empty':
      return empty
    case 'is_not_empty':
      return !empty
    case 'is_checked':
      return colDef.type === 'checkbox' && (raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes')
    case 'is_not_checked':
      return colDef.type === 'checkbox' && !(raw === 'true' || raw === '1' || raw.toLowerCase() === 'yes')
    case 'equals':
      return filter.value !== undefined && String(filter.value) === raw
    case 'not_equals':
      return filter.value !== undefined && String(filter.value) !== raw
    case 'contains':
      return filter.value !== undefined && raw.toLowerCase().includes(String(filter.value).toLowerCase())
    case 'not_contains':
      return filter.value !== undefined && !raw.toLowerCase().includes(String(filter.value).toLowerCase())
    case 'greater_than':
      if (colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') {
        const n = parseFloat(raw)
        const v = typeof filter.value === 'number' ? filter.value : parseFloat(String(filter.value))
        return !Number.isNaN(n) && !Number.isNaN(v) && n > v
      }
      return filter.value !== undefined && raw > String(filter.value)
    case 'greater_than_or_equal':
      if (colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') {
        const n = parseFloat(raw)
        const v = typeof filter.value === 'number' ? filter.value : parseFloat(String(filter.value))
        return !Number.isNaN(n) && !Number.isNaN(v) && n >= v
      }
      return filter.value !== undefined && raw >= String(filter.value)
    case 'less_than':
      if (colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') {
        const n = parseFloat(raw)
        const v = typeof filter.value === 'number' ? filter.value : parseFloat(String(filter.value))
        return !Number.isNaN(n) && !Number.isNaN(v) && n < v
      }
      return filter.value !== undefined && raw < String(filter.value)
    case 'less_than_or_equal':
      if (colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') {
        const n = parseFloat(raw)
        const v = typeof filter.value === 'number' ? filter.value : parseFloat(String(filter.value))
        return !Number.isNaN(n) && !Number.isNaN(v) && n <= v
      }
      return filter.value !== undefined && raw <= String(filter.value)
    default:
      return true
  }
}

export function SheetsEditor() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useYDoc(docId!, 'sheets')
  const cells = useYMap<Record<string, string>>(doc, 'cells')
  const columnDefs = useYMap<Record<string, ColumnDef>>(doc, 'columnDefs')
  const cellFormats = useYMap<Record<string, CellFormat>>(doc, 'cellFormats')
  const columnFilters = useYMap<Record<string, ColumnFilter>>(doc, 'columnFilters')

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [filterOpenCol, setFilterOpenCol] = useState<number | null>(null)
  const [columnConfigCol, setColumnConfigCol] = useState<number | null>(null)

  useEffect(() => {
    ensureColumnDefs(doc)
  }, [doc])

  const cellsMap = doc.getMap('cells')
  const cellFormatsMap = doc.getMap('cellFormats')
  const columnDefsMap = doc.getMap('columnDefs')
  const columnFiltersMap = doc.getMap('columnFilters')

  const setCell = useCallback(
    (key: string, value: string) => {
      cellsMap.set(key, value)
    },
    [cellsMap]
  )

  const updateColumnDef = useCallback(
    (colIndex: number, partial: Partial<ColumnDef>) => {
      let colMap = columnDefsMap.get(String(colIndex)) as Y.Map<unknown> | undefined
      if (!colMap) {
        colMap = new Y.Map()
        const def = DEFAULT_COLUMN_DEF(colIndex)
        colMap.set('id', def.id)
        colMap.set('name', def.name)
        colMap.set('type', def.type)
        colMap.set('width', def.width ?? DEFAULT_COLUMN_WIDTH)
        columnDefsMap.set(String(colIndex), colMap)
      }
      Object.entries(partial).forEach(([k, v]) => {
        if (v !== undefined) colMap!.set(k, v)
      })
    },
    [columnDefsMap]
  )

  const setColumnFilter = useCallback(
    (colIndex: number, filter: ColumnFilter) => {
      const m = new Y.Map()
      m.set('enabled', filter.enabled)
      m.set('condition', filter.condition)
      if (filter.value !== undefined) m.set('value', filter.value)
      if (filter.selectedOptionIds?.length) m.set('selectedOptionIds', filter.selectedOptionIds)
      columnFiltersMap.set(String(colIndex), m)
    },
    [columnFiltersMap]
  )

  const getColumnFilter = useCallback(
    (colIndex: number): ColumnFilter => {
      const raw = columnFilters[String(colIndex)]
      if (raw && typeof raw === 'object') return raw as ColumnFilter
      return { enabled: false, condition: 'is_not_empty' }
    },
    [columnFilters]
  )

  const setCellFormat = useCallback(
    (cellKey: string, format: CellFormat) => {
      const existing = cellFormats[cellKey] as CellFormat | undefined
      const merged = { ...existing, ...format }
      const m = new Y.Map()
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined) m.set(k, v)
      })
      cellFormatsMap.set(cellKey, m)
    },
    [cellFormatsMap, cellFormats]
  )

  const getCellFormat = useCallback(
    (cellKey: string): CellFormat => {
      const raw = cellFormats[cellKey]
      if (raw && typeof raw === 'object') return raw as CellFormat
      return {}
    },
    [cellFormats]
  )

  // Compute visible rows: a row is visible if it passes every column's filter
  const visibleRows = React.useMemo(() => {
    const byCol: Record<number, Set<number>> = {}
    for (let c = 0; c < COLS; c++) {
      byCol[c] = new Set()
      const colDef = getColumnDef(columnDefs, c)
      const filter = getColumnFilter(c)
      for (let r = 0; r < ROWS; r++) {
        const key = getCellKey(r, c)
        const value = cells[key] ?? ''
        if (matchesFilter(value, filter, colDef)) byCol[c].add(r)
      }
    }
    const intersection = new Set<number>()
    for (let r = 0; r < ROWS; r++) {
      let ok = true
      for (let c = 0; c < COLS; c++) {
        if (!byCol[c].has(r)) {
          ok = false
          break
        }
      }
      if (ok) intersection.add(r)
    }
    return intersection
  }, [cells, columnDefs, columnFilters, getColumnFilter])

  return (
    <EditorLayout
      title="Sheets"
      toolbar={
        <Flex alignItems="center" gap="size-200">
          {selectedCell && (
            <Flex alignItems="center" gap="size-100" UNSAFE_style={{ flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                onPress={() => setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { bold: true })}
              >
                <strong>B</strong>
              </Button>
              <Button
                variant="secondary"
                onPress={() => setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { italic: true })}
              >
                <em>I</em>
              </Button>
              <Button
                variant="secondary"
                onPress={() =>
                  setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { horizontalAlign: 'left' })
                }
              >
                Left
              </Button>
              <Button
                variant="secondary"
                onPress={() =>
                  setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { horizontalAlign: 'center' })
                }
              >
                Center
              </Button>
              <Button
                variant="secondary"
                onPress={() =>
                  setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { horizontalAlign: 'right' })
                }
              >
                Right
              </Button>
              <input
                type="color"
                title="Fill color"
                style={{ width: 28, height: 28, padding: 0, border: '1px solid #ccc', cursor: 'pointer' }}
                onChange={(e) =>
                  setCellFormat(getCellKey(selectedCell.row, selectedCell.col), { fillColor: e.target.value })
                }
              />
            </Flex>
          )}
          <ButtonGroup>
            <Button variant="accent" onPress={() => window.print()}>
              Export
            </Button>
          </ButtonGroup>
        </Flex>
      }
    >
      <Flex direction="column" flex={1} UNSAFE_style={{ padding: 8, overflow: 'auto' }}>
        <div
          className="sheets-grid"
          style={{
            gridTemplateColumns: `40px repeat(${COLS}, minmax(100px, 1fr))`,
            gridTemplateRows: `28px repeat(${ROWS}, 26px)`,
          }}
        >
          <div className="sheets-corner" />
          {Array.from({ length: COLS }, (_, c) => {
            const colDef = getColumnDef(columnDefs, c)
            const filter = getColumnFilter(c)
            const hasFilter = filter.enabled
            const colWidth = colDef.width ?? DEFAULT_COLUMN_WIDTH
            return (
              <div
                key={c}
                className={`sheets-col-header ${hasFilter ? 'has-filter' : ''}`}
                style={{ minWidth: colWidth }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{colDef.name}</span>
                <DialogTrigger
                  isOpen={filterOpenCol === c}
                  onOpenChange={(open) => setFilterOpenCol(open ? c : null)}
                >
                  <TooltipTrigger>
                    <ActionButton isQuiet aria-label="Filter column">
                      <Filter size="S" />
                    </ActionButton>
                    <Tooltip>Filter column</Tooltip>
                  </TooltipTrigger>
                  <Dialog>
                    <Content>
                      <Heading>Filter: {colDef.name}</Heading>
                      <Flex direction="column" gap="size-200" marginTop="size-200">
                        <Checkbox isSelected={filter.enabled} onChange={(v) => setColumnFilter(c, { ...filter, enabled: v })}>
                          Enable filter
                        </Checkbox>
                        <Picker
                          label="Condition"
                          selectedKey={filter.condition}
                          onSelectionChange={(key) => setColumnFilter(c, { ...filter, condition: key as FilterCondition })}
                          width="100%"
                        >
                          {FILTER_CONDITIONS.map((fc) => (
                            <Item key={fc.value}>{fc.label}</Item>
                          ))}
                        </Picker>
                        {!['is_empty', 'is_not_empty', 'is_checked', 'is_not_checked'].includes(filter.condition) && (
                          <TextField
                            label="Value"
                            value={filter.value != null ? String(filter.value) : ''}
                            onChange={(v) => setColumnFilter(c, { ...filter, value: v })}
                            width="100%"
                          />
                        )}
                      </Flex>
                    </Content>
                  </Dialog>
                </DialogTrigger>
                <DialogTrigger
                  isOpen={columnConfigCol === c}
                  onOpenChange={(open) => setColumnConfigCol(open ? c : null)}
                >
                  <TooltipTrigger>
                    <ActionButton isQuiet aria-label="Column settings">
                      <Edit size="S" />
                    </ActionButton>
                    <Tooltip>Column settings (name, type, options)</Tooltip>
                  </TooltipTrigger>
                  <Dialog>
                    <Content UNSAFE_style={{ padding: 16, minWidth: 320, maxWidth: 400 }}>
                      <Heading>Column: {colDef.name}</Heading>
                      <Flex direction="column" gap="size-200" marginTop="size-200">
                        <TextField
                          label="Name"
                          value={colDef.name}
                          onChange={(name) => updateColumnDef(c, { name })}
                          width="100%"
                        />
                        <Picker
                          label="Type"
                          selectedKey={colDef.type}
                          onSelectionChange={(key) => updateColumnDef(c, { type: key as ColumnType })}
                          width="100%"
                        >
                          {COLUMN_TYPE_OPTIONS.map((opt) => (
                            <Item key={opt.type}>{opt.label}</Item>
                          ))}
                        </Picker>
                        {(colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') && (
                          <>
                            <TextField
                              label="Number format"
                              value={colDef.numberFormat ?? ''}
                              onChange={(v) => updateColumnDef(c, { numberFormat: v || undefined })}
                              width="100%"
                              placeholder="#,##0.00"
                            />
                            {colDef.type === 'currency' && (
                              <TextField
                                label="Currency code"
                                value={colDef.currencyCode ?? 'USD'}
                                onChange={(v) => updateColumnDef(c, { currencyCode: v || 'USD' })}
                                width="100%"
                              />
                            )}
                          </>
                        )}
                        {(colDef.type === 'date' || colDef.type === 'datetime') && (
                          <TextField
                            label="Date format"
                            value={colDef.dateFormat ?? ''}
                            onChange={(v) => updateColumnDef(c, { dateFormat: v || undefined })}
                            width="100%"
                            placeholder="e.g. MM/dd/yyyy"
                          />
                        )}
                        {(colDef.type === 'single_select' || colDef.type === 'multi_select') && (
                          <>
                            <Text>Options</Text>
                            <Flex direction="column" gap="size-100">
                              {(colDef.options ?? []).map((opt) => (
                                <div key={opt.id} className="sheets-option-chip">
                                  <span className="chip-color" style={{ background: opt.color ?? '#94a3b8' }} />
                                  {opt.label}
                                  <ActionButton
                                    isQuiet
                                    onPress={() =>
                                      updateColumnDef(c, {
                                        options: (colDef.options ?? []).filter((o) => o.id !== opt.id),
                                      })
                                    }
                                  >
                                    ×
                                  </ActionButton>
                                </div>
                              ))}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  const input = (e.currentTarget.elements.namedItem('newOption') as HTMLInputElement)
                                  const label = input?.value?.trim()
                                  if (!label) return
                                  const newOpt = {
                                    id: `opt-${Date.now()}`,
                                    label,
                                    color: '#94a3b8',
                                  }
                                  updateColumnDef(c, {
                                    options: [...(colDef.options ?? []), newOpt],
                                  })
                                  input.value = ''
                                }}
                              >
                                <Flex gap="size-100">
                                  <TextField name="newOption" placeholder="Add option..." width="100%" />
                                  <Button type="submit" variant="secondary">
                                    Add
                                  </Button>
                                </Flex>
                              </form>
                            </Flex>
                          </>
                        )}
                        {colDef.type === 'rating' && (
                          <TextField
                            label="Max rating (e.g. 5)"
                            value={String(colDef.maxRating ?? 5)}
                            onChange={(v) => updateColumnDef(c, { maxRating: parseInt(v, 10) || 5 })}
                            width="100%"
                          />
                        )}
                      </Flex>
                    </Content>
                  </Dialog>
                </DialogTrigger>
              </div>
            )
          })}
          {Array.from({ length: ROWS }, (_, r) => (
            <React.Fragment key={r}>
              <div className="sheets-row-header">{r + 1}</div>
              {Array.from({ length: COLS }, (_, c) => {
                const key = getCellKey(r, c)
                const value = cells[key] ?? ''
                const colDef = getColumnDef(columnDefs, c)
                const format = getCellFormat(key)
                const visible = visibleRows.has(r)
                const colWidth = colDef.width ?? DEFAULT_COLUMN_WIDTH
                const isSelected = selectedCell?.row === r && selectedCell?.col === c
                const style: React.CSSProperties = {
                  minWidth: colWidth,
                  display: visible ? undefined : 'none',
                  fontWeight: format.bold ? 'bold' : undefined,
                  fontStyle: format.italic ? 'italic' : undefined,
                  textDecoration: format.underline ? 'underline' : format.strikethrough ? 'line-through' : undefined,
                  backgroundColor: format.fillColor ?? undefined,
                  color: format.textColor ?? undefined,
                  textAlign: format.horizontalAlign ?? undefined,
                  verticalAlign: format.verticalAlign ?? undefined,
                }

                const cellContent = (() => {
                  if (colDef.type === 'checkbox') {
                    const checked = value === 'true' || value === '1' || value.toLowerCase() === 'yes'
                    return (
                      <div className={`sheets-cell-wrap${isSelected ? ' selected' : ''}`} style={style}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setCell(key, e.target.checked ? 'true' : 'false')}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )
                  }
                  if (colDef.type === 'single_select' && (colDef.options?.length ?? 0) > 0) {
                    return (
                      <div className={`sheets-cell-wrap${isSelected ? ' selected' : ''}`} style={style}>
                        <select
                          className="sheets-cell-input"
                          value={value}
                          onChange={(e) => setCell(key, e.target.value)}
                          onFocus={() => setSelectedCell({ row: r, col: c })}
                        >
                          <option value="">Select...</option>
                          {(colDef.options ?? []).map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  }
                  if (colDef.type === 'rating') {
                    const max = colDef.maxRating ?? 5
                    const current = Math.min(max, Math.max(0, parseInt(value, 10) || 0))
                    return (
                      <div
                        className={`sheets-cell-wrap sheets-rating-cell${isSelected ? ' selected' : ''}`}
                        style={style}
                        onClick={() => setSelectedCell({ row: r, col: c })}
                        onBlur={() => setSelectedCell(null)}
                      >
                        {Array.from({ length: max }, (_, i) => (
                          <span
                            key={i}
                            className={i < current ? 'filled' : ''}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCell(key, String(i + 1))
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )
                  }
                  if (colDef.type === 'date' || colDef.type === 'datetime') {
                    const inputType = colDef.type === 'datetime' ? 'datetime-local' : 'date'
                    let inputValue = value
                    if (value && (colDef.type === 'date' || colDef.type === 'datetime')) {
                      const d = new Date(value)
                      if (!Number.isNaN(d.getTime())) {
                        inputValue = colDef.type === 'datetime'
                          ? d.toISOString().slice(0, 16)
                          : d.toISOString().slice(0, 10)
                      }
                    }
                    return (
                      <div className={`sheets-cell-wrap${isSelected ? ' selected' : ''}`} style={style}>
                        <input
                          type={inputType}
                          className="sheets-cell-input"
                          value={inputValue}
                          onChange={(e) => setCell(key, e.target.value ? new Date(e.target.value).toISOString() : '')}
                          onFocus={() => setSelectedCell({ row: r, col: c })}
                        />
                      </div>
                    )
                  }
                  if (colDef.type === 'number' || colDef.type === 'currency' || colDef.type === 'percent') {
                    const numValue = value === '' ? '' : (colDef.type === 'percent' ? parseFloat(value) * 100 : parseFloat(value))
                    return (
                      <div className={`sheets-cell-wrap${isSelected ? ' selected' : ''}`} style={style}>
                        <input
                          type="number"
                          className="sheets-cell-input"
                          step={colDef.type === 'percent' ? 0.01 : undefined}
                          value={numValue === '' ? '' : String(numValue)}
                          onChange={(e) => {
                            const v = e.target.value
                            if (v === '') setCell(key, '')
                            else {
                              const n = parseFloat(v)
                              setCell(key, colDef.type === 'percent' ? String(n / 100) : String(n))
                            }
                          }}
                          onFocus={() => setSelectedCell({ row: r, col: c })}
                        />
                      </div>
                    )
                  }
                  return (
                    <div className={`sheets-cell-wrap${isSelected ? ' selected' : ''}`} style={style}>
                      <input
                        type={colDef.type === 'email' ? 'email' : colDef.type === 'url' ? 'url' : 'text'}
                        className="sheets-cell-input"
                        value={value}
                        onChange={(e) => setCell(key, e.target.value)}
                        onFocus={() => setSelectedCell({ row: r, col: c })}
                        onBlur={() => setSelectedCell(null)}
                      />
                    </div>
                  )
                })()

                return (
                  <div
                    key={key}
                    className="sheets-cell"
                    onClick={() => setSelectedCell({ row: r, col: c })}
                    role="gridcell"
                    aria-selected={selectedCell?.row === r && selectedCell?.col === c}
                  >
                    {cellContent}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
        <Text UNSAFE_style={{ marginTop: 8 }}>
          Collaborative spreadsheet — filters, column types (number, date, select, checkbox), cell formatting, and
          Airtable-style column config. Click column header icons to filter or edit column settings.
        </Text>
      </Flex>
    </EditorLayout>
  )
}
