#!/usr/bin/env bash
# Builds the app's text face, Source Sans 3, as hinted woff2 subsets in src/assets/fonts/.
#
# Why not @fontsource: its Source Sans 3 files have no TrueType hinting, so on Windows (ClearType, normal pixel
# density) 14 px text looks grey and soft. Adobe's own TTFs are hinted; this keeps the hinting and every OpenType
# feature, and cuts the glyphs to latin + latin-ext (Czech). Needs Python with fonttools and brotli
# (pip install fonttools brotli). Run it again only to move to a newer Source Sans release.
set -euo pipefail
VERSION=3.52.0
OUT="$(cd "$(dirname "$0")/.." && pwd)/src/assets/fonts"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
(cd "$TMP" && npm pack "source-sans@$VERSION" -q >/dev/null && tar xzf "source-sans-$VERSION.tgz")
# The same ranges as Google's latin and latin-ext subsets (src/pdf/fonts.ts used them with @fontsource).
UNICODES='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF'
mkdir -p "$OUT"
for w in Regular Medium Semibold Bold; do
  python -m fontTools.subset "$TMP/package/TTF/SourceSans3-$w.ttf" \
    --unicodes="$UNICODES" --layout-features='*' --hinting --flavor=woff2 \
    --output-file="$OUT/SourceSans3-$w.woff2"
done
cp "$TMP/package/LICENSE.md" "$OUT/SourceSans3-LICENSE.md"
ls -l "$OUT"
