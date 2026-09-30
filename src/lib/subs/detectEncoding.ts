import jschardet from 'jschardet';

const UTF8_BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

/**
 * jschardet labels (compat names and aliases) mapped onto TextDecoder labels.
 * windows-1254 is the WHATWG name for iso-8859-9, so both decode the same way.
 */
const DECODER_LABELS: Record<string, string> = {
  'utf-8': 'utf-8',
  utf8: 'utf-8',
  'utf-8-sig': 'utf-8',
  ascii: 'utf-8',
  'us-ascii': 'utf-8',
  'windows-1251': 'windows-1251',
  cp1251: 'windows-1251',
  'windows-1252': 'windows-1252',
  cp1252: 'windows-1252',
  'iso-8859-1': 'windows-1252',
  'iso8859-1': 'windows-1252',
  latin1: 'windows-1252',
  'windows-1256': 'windows-1256',
  cp1256: 'windows-1256',
  'iso-8859-7': 'iso-8859-7',
  'iso8859-7': 'iso-8859-7',
  'iso-8859-8': 'iso-8859-8',
  'iso8859-8': 'iso-8859-8',
  'iso-8859-9': 'iso-8859-9',
  'iso8859-9': 'iso-8859-9',
  'windows-1254': 'iso-8859-9',
  cp1254: 'iso-8859-9',
  latin5: 'iso-8859-9',
  'shift-jis': 'shift_jis',
  'shift_jis': 'shift_jis',
  sjis: 'shift_jis',
  cp932: 'shift_jis',
  'windows-31j': 'shift_jis',
  gb18030: 'gb18030',
  gbk: 'gb18030',
  gb2312: 'gb18030',
};

function detectorKey(label: string): string {
  return label.trim().toLowerCase().replace(/_/g, '-');
}

function mapDetectedEncoding(label: string | null): string {
  if (!label) return 'utf-8';
  const key = detectorKey(label);
  const mapped = DECODER_LABELS[key];
  if (mapped) return mapped;
  try {
    const canonical = new TextDecoder(key).encoding;
    if (canonical === 'windows-1254') return 'iso-8859-9';
    return canonical;
  } catch {
    return 'utf-8';
  }
}

function hasUtf8Bom(bytes: Uint8Array): boolean {
  return (
    bytes.length >= UTF8_BOM.length &&
    bytes[0] === UTF8_BOM[0] &&
    bytes[1] === UTF8_BOM[1] &&
    bytes[2] === UTF8_BOM[2]
  );
}

/** Charset label for bytes that are not valid UTF-8. */
export function detectEncodingLabel(bytes: Uint8Array): string {
  if (hasUtf8Bom(bytes)) return 'utf-8';
  const detected = jschardet.detect(bytes);
  return mapDetectedEncoding(detected.encoding);
}
