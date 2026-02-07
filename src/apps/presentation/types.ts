export type Slide = {
  id: string
  title: string
  content: string
  bg: string
  /** Optional background image URL (e.g. Canva-style photo) */
  bgImage?: string
  /** Optional; for light-background slides */
  textColor?: string
}
