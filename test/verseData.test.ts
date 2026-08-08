import { readFileSync } from 'fs';
import { join } from 'path';
import { parseVerseData } from '../src/utils/VerseData';
import { describe, expect, test } from '@jest/globals';

function fixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8');
}

/** Builds a page whose verse content is `content`, preceded by `rows`. */
function flightPage(content: string, rows = ''): string {
  const body =
    rows +
    '0:["$","$L1",null,' +
    JSON.stringify({
      pageProps: {
        type: 'verse',
        referenceTitle: { title: 'Test 1:1' },
        verses: [{ content }],
        version: { local_abbreviation: 'XYZ' },
      },
    }) +
    ']\n';

  return (
    '<html><body><script>self.__next_f.push([1,' +
    JSON.stringify(body) +
    '])</script></body></html>'
  );
}

describe('parseVerseData', () => {
  test('reads a verse from the legacy __NEXT_DATA__ payload', () => {
    const data = parseVerseData(fixture('legacy-verse.html'));

    expect(data).not.toBeNull();
    expect(data?.info.title).toBe('João 3:16');
    expect(data?.info.version).toBe('NVI');
    expect(data?.verses).toBe(
      '― Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo aquele que nele crer não pereça, mas tenha a vida eterna.',
    );
  });

  test('reads a verse from the streamed payload', () => {
    const data = parseVerseData(fixture('rsc-verse.html'));

    expect(data).not.toBeNull();
    expect(data?.info.title).toBe('João 10:3-5');
    expect(data?.info.version).toBe('NVI');
    expect(data?.verses).toContain('O porteiro abre‑lhe a porta');
  });

  test('joins a payload split across several chunks', () => {
    const data = parseVerseData(fixture('rsc-verse.html'));

    expect(data?.verses).toContain('não reconhecem a voz de estranhos.');
  });

  test('resolves a verse sent as a reference to another row', () => {
    const data = parseVerseData(fixture('rsc-verse-lazy.html'));

    expect(data).not.toBeNull();
    expect(data?.info.title).toBe('2Crônicas 20:2-15');
    expect(data?.verses).toBe(
      'Então, informaram Josafá:\n― Um exército enorme vem contra ti de Edom. ' +
        'Alarmado, Josafá decidiu consultar o SENHOR e proclamou um jejum em todo o reino de Judá.',
    );
  });

  test('measures the referenced row in bytes, not characters', () => {
    const text = 'coração é vida';
    const rows = `2:T${Buffer.byteLength(text, 'utf8').toString(16)},${text}\n`;

    expect(parseVerseData(flightPage('$2', rows))?.verses).toBe(text);
  });

  test('returns null when the reference points to a missing row', () => {
    expect(parseVerseData(flightPage('$99'))).toBeNull();
  });

  test('reads a dollar sign written as an escape', () => {
    expect(parseVerseData(flightPage('$$32'))?.verses).toBe('$32');
  });

  test('keeps braces that appear inside the verse text', () => {
    expect(parseVerseData(flightPage('a } b { c'))?.verses).toBe('a } b { c');
  });

  test('returns null for a chapter page', () => {
    expect(parseVerseData(fixture('rsc-chapter.html'))).toBeNull();
  });

  test('returns null when the page carries no payload', () => {
    expect(parseVerseData('<html><body>nothing here</body></html>')).toBeNull();
  });

  test('returns null when the verse list is empty', () => {
    const payload = JSON.stringify({
      props: {
        pageProps: {
          type: 'verse',
          referenceTitle: { title: 'João 3:16' },
          verses: [],
          version: { local_abbreviation: 'NVI' },
        },
      },
    });
    const html =
      '<html><body><script id="__NEXT_DATA__" type="application/json">' +
      payload +
      '</script></body></html>';

    expect(parseVerseData(html)).toBeNull();
  });
});
