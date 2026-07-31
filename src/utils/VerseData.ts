import {
	htmlCleanupRegex,
	htmlDataRegex,
	htmlFlightDataRegex,
	htmlFlightReferenceRegex,
} from "../Regex";

export type VerseData = {
	info: { title: string; version: string };
	verses: string;
};

type PageProps = {
	type?: string;
	referenceTitle?: { title?: string };
	verses?: Array<{ content?: string }>;
	version?: { local_abbreviation?: string };
};

type Source = { pageProps: PageProps; payload: string };

// bible.com is serving two page formats at the moment: the old __NEXT_DATA__
// tag and a payload streamed through self.__next_f, so try both.
export function parseVerseData(html: string): VerseData | null {
	const source = readEmbedded(html) || readStreamed(html);
	if (!source || source.pageProps.type !== "verse") {
		return null;
	}

	const title = source.pageProps.referenceTitle?.title;
	const version = source.pageProps.version?.local_abbreviation;
	if (!title || !version) {
		return null;
	}

	const contents: string[] = [];
	for (const verse of source.pageProps.verses || []) {
		const content = readContent(source.payload, verse.content || "");
		if (content === null) {
			return null;
		}
		contents.push(content);
	}

	const verses = contents.join(" ");
	if (verses.length < 1) {
		return null;
	}

	return { info: { title, version }, verses };
}

function readEmbedded(html: string): Source | null {
	const match = html.match(htmlDataRegex);
	if (!match) {
		return null;
	}

	try {
		const pageProps = JSON.parse(match[0].replace(htmlCleanupRegex, ""))
			.props.pageProps;
		return { pageProps, payload: "" };
	} catch {
		return null;
	}
}

function readStreamed(html: string): Source | null {
	const payload = joinChunks(html);
	const key = payload.indexOf('"pageProps"');
	if (key < 0) {
		return null;
	}

	const object = sliceObject(payload, key);
	if (!object) {
		return null;
	}

	try {
		return { pageProps: JSON.parse(object), payload };
	} catch {
		return null;
	}
}

function joinChunks(html: string): string {
	htmlFlightDataRegex.lastIndex = 0;

	let payload = "";
	let match;
	while ((match = htmlFlightDataRegex.exec(html)) !== null) {
		try {
			payload += JSON.parse(match[1]);
		} catch {
			// skip the chunk and keep going
		}
	}

	return payload;
}

// Longer passages are not written inline: content holds "$<row>", pointing at a
// row of the payload. A leading "$$" is an escaped dollar sign.
function readContent(payload: string, content: string): string | null {
	if (content.charAt(0) !== "$") {
		return content;
	}

	if (content.charAt(1) === "$") {
		return content.substring(1);
	}

	const reference = content.match(htmlFlightReferenceRegex);
	if (!reference) {
		return content;
	}

	return readRow(payload, reference[1]);
}

// Rows are written as "<row>:T<length>,<text>", with the length in hex and
// counted in bytes of UTF-8.
function readRow(payload: string, row: string): string | null {
	const header = new RegExp("(?:^|\\n)" + row + ":T([0-9a-f]+),").exec(
		payload
	);
	if (!header) {
		return null;
	}

	const text = payload.substring(header.index + header[0].length);
	const length = parseInt(header[1], 16);
	const bytes = new TextEncoder().encode(text);
	if (bytes.length < length) {
		return null;
	}

	return new TextDecoder().decode(bytes.slice(0, length));
}

function sliceObject(source: string, from: number): string | null {
	const start = source.indexOf("{", from);
	if (start < 0) {
		return null;
	}

	let depth = 0;
	let inString = false;
	let escaped = false;

	for (let i = start; i < source.length; i++) {
		const char = source[i];

		if (escaped) {
			escaped = false;
		} else if (char === "\\") {
			escaped = true;
		} else if (char === '"') {
			inString = !inString;
		} else if (!inString) {
			if (char === "{") {
				depth++;
			} else if (char === "}") {
				depth--;
				if (depth === 0) {
					return source.slice(start, i + 1);
				}
			}
		}
	}

	return null;
}
