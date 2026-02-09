// Column types (Excel/Sheets + Airtable-style)
export type ColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'checkbox'
  | 'single_select'
  | 'multi_select'
  | 'url'
  | 'email'
  | 'rating'

export interface ColumnDef {
  id: string
  name: string
  type: ColumnType
  width?: number
  // For single_select / multi_select
  options?: { id: string; label: string; color?: string }[]
  // Number/currency/percent
  numberFormat?: string // e.g. '#,##0.00', '0.0%'
  currencyCode?: string
  // Date/datetime
  dateFormat?: string
  timeFormat?: string
  // Rating (1-5 stars)
  maxRating?: number
}

export interface CellFormat {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  fillColor?: string
  textColor?: string
  horizontalAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  wrapText?: boolean
  numberFormat?: string // cell-level override
}

// Filter condition for a column
export type FilterCondition =
  | 'is_empty'
  | 'is_not_empty'
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'greater_than_or_equal'
  | 'less_than'
  | 'less_than_or_equal'
  | 'is_checked' // checkbox
  | 'is_not_checked'

export interface ColumnFilter {
  enabled: boolean
  condition: FilterCondition
  value?: string | number | boolean
  // For multi-select filter: which option ids are visible
  selectedOptionIds?: string[]
}

export const DEFAULT_COLUMN_WIDTH = 120
export const COL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function getColumnLetter(index: number): string {
  if (index < 26) return COL_LETTERS[index]
  return COL_LETTERS[Math.floor(index / 26) - 1] + COL_LETTERS[index % 26]
}

export function getCellKey(row: number, col: number): string {
  return `${getColumnLetter(col)}${row + 1}`
}

export const DEFAULT_COLUMN_DEF = (colIndex: number): ColumnDef => ({
  id: `col-${colIndex}`,
  name: getColumnLetter(colIndex),
  type: 'text',
  width: DEFAULT_COLUMN_WIDTH,
})
