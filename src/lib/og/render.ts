import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import type { OgCard } from './card';

const WIDTH = 1200;
const HEIGHT = 630;
const STRIPE = 16;
const PAD_LEFT = 72;
const PAD_RIGHT = 88;
const TEXT_WIDTH = WIDTH - STRIPE - PAD_LEFT - PAD_RIGHT;

const light = {
  bg: '#FFFFFF',
  brand: '#3730A3',
  ink: '#111827',
  muted: '#6B7280',
  accent: '#A7F3D0',
} as const;

type Style = Record<string, string | number>;

type OgNode = {
  type: 'div';
  props: {
    style?: Style;
    children?: string | OgNode | Array<string | OgNode>;
  };
};

function el(style: Style, children?: OgNode['props']['children']): OgNode {
  return { type: 'div', props: { style, children } };
}

const require = createRequire(fileURLToPath(import.meta.url));

function interFont(weight: 400 | 600): ArrayBuffer {
  const packageJson = require.resolve('@fontsource/inter/package.json');
  const file = weight === 400 ? 'inter-latin-400-normal.woff' : 'inter-latin-600-normal.woff';
  const bytes = readFileSync(join(dirname(packageJson), 'files', file));
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

type InterFont = {
  name: 'Inter';
  data: ArrayBuffer;
  weight: 400 | 600;
  style: 'normal';
};

let fonts: InterFont[] | undefined;

function interFonts(): InterFont[] {
  if (!fonts) {
    fonts = [
      { name: 'Inter', data: interFont(400), weight: 400, style: 'normal' },
      { name: 'Inter', data: interFont(600), weight: 600, style: 'normal' },
    ];
  }
  return fonts;
}

function cardNode(card: OgCard): OgNode {
  return el(
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'row',
      backgroundColor: light.bg,
      fontFamily: 'Inter',
    },
    [
      el({
        width: STRIPE,
        height: HEIGHT,
        backgroundColor: light.brand,
      }),
      el(
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: WIDTH - STRIPE,
          height: HEIGHT,
          paddingTop: 76,
          paddingBottom: 76,
          paddingLeft: PAD_LEFT,
          paddingRight: PAD_RIGHT,
          boxSizing: 'border-box',
        },
        [
          el(
            {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            },
            [
              el(
                { fontSize: 32, fontWeight: 400, color: light.brand, lineHeight: '36px' },
                'subtitle',
              ),
              el(
                { fontSize: 32, fontWeight: 600, color: light.brand, lineHeight: '36px' },
                'fixer',
              ),
            ],
          ),
          el({
            width: 72,
            height: 8,
            marginTop: 28,
            backgroundColor: light.accent,
            borderRadius: 4,
          }),
          el(
            {
              display: 'block',
              width: TEXT_WIDTH,
              marginTop: 36,
              fontSize: 56,
              fontWeight: 600,
              lineHeight: '64px',
              letterSpacing: -1.2,
              color: light.ink,
              lineClamp: 2,
              overflow: 'hidden',
            },
            card.title,
          ),
          el(
            {
              display: 'block',
              width: TEXT_WIDTH,
              marginTop: 28,
              fontSize: 28,
              fontWeight: 400,
              lineHeight: '40px',
              color: light.muted,
              lineClamp: 3,
              overflow: 'hidden',
            },
            card.description,
          ),
        ],
      ),
    ],
  );
}

export async function renderOgCard(card: OgCard): Promise<Uint8Array> {
  const svg = await satori(cardNode(card), {
    width: WIDTH,
    height: HEIGHT,
    fonts: interFonts(),
  });
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    background: light.bg,
    font: { loadSystemFonts: false },
  })
    .render()
    .asPng();
  return new Uint8Array(png);
}
