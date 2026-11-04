// Fonts embedded as data URLs so the single-file build works offline.
//
// The PDF uses Inter: full TTFs (not web subsets), because the PDF engine needs one file that covers both Latin and
// Czech characters.
import interRegular from '@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf?inline'
import interSemiBold from '@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf?inline'
// The app UI (the owner, 2026-11-01, after trying pairs on the whole app): Source Sans 3 for text, labels, numbers and
// the wordmark (400, 500, 600, 700), Fira Sans Condensed 600 for headlines. Latin + latin-ext covers Czech.
// Source Sans 3 comes from Adobe's hinted TTFs (scripts/subset-ui-font.sh), not @fontsource: those files are unhinted,
// which made 14 px text grey and soft on Windows (2026-11-02). Fira Sans Condensed from @fontsource is hinted.
import sans400 from '@/assets/fonts/SourceSans3-Regular.woff2?inline'
import sans500 from '@/assets/fonts/SourceSans3-Medium.woff2?inline'
import sans600 from '@/assets/fonts/SourceSans3-Semibold.woff2?inline'
import sans700 from '@/assets/fonts/SourceSans3-Bold.woff2?inline'
import display600 from '@fontsource/fira-sans-condensed/files/fira-sans-condensed-latin-600-normal.woff2?inline'
import display600Ext from '@fontsource/fira-sans-condensed/files/fira-sans-condensed-latin-ext-600-normal.woff2?inline'

export const fonts = { regular: interRegular, semiBold: interSemiBold }

const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
const LATIN_EXT = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'

/** The app UI's faces (index.css names them in --font-sans and --font-display). */
export function loadUiFonts() {
  // `display` is set rather than left to the browser's default: the fonts are in the page, so a short block is enough.
  const subset = (family: string, weight: string, latin: string, latinExt: string) => [
    new FontFace(family, `url(${latin})`, { weight, unicodeRange: LATIN, display: 'block' }),
    new FontFace(family, `url(${latinExt})`, { weight, unicodeRange: LATIN_EXT, display: 'block' }),
  ]
  const whole = (family: string, weight: string, file: string) =>
    new FontFace(family, `url(${file})`, { weight, display: 'block' })
  const faces = [
    whole('Source Sans 3', '400', sans400),
    whole('Source Sans 3', '500', sans500),
    whole('Source Sans 3', '600', sans600),
    whole('Source Sans 3', '700', sans700),
    ...subset('Fira Sans Condensed', '600', display600, display600Ext),
  ]
  for (const face of faces) void face.load().then((f) => document.fonts.add(f)).catch(() => {})
}
