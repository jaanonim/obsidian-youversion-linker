import { VerseFormat } from "src/settings/SettingsData";
import { escapeMarkdown } from "src/utils/Markdown";

export function applyFormatting(raw: string, format: VerseFormat): string {
    const numberFormat = (n: string) => {
        switch (format.number) {
            case "none":
                return "";
            case "plain":
                return `${n} `;
            case "dot":
                return `${n}. `;
            case "paren":
                return `${n}) `;
            case "dash":
                return `${n} - `;
            case "bold":
                return `<strong>${n}</strong> `;
            case "italic":
                return `<em>${n}</em> `;
            case "superscript":
                return `<sup>${n}</sup> `;
            case "superscript-bold":
                return `<sup><b>${n}</b></sup> `;
            case "superscript-italic":
                return `<sup><i>${n}</i></sup> `;
        }
    };

    const hasMarkers = /\[(\d+)\]/.test(raw);

    switch (format.text) {
        case "translation": {
            return raw.replace(/\[(\d+)\]\s?/g, (_m, n) => numberFormat(n) || "");
        }
        case "manuscript": {
            const replaced = raw.replace(/\[(\d+)\]\s?/g, (_m, n) => numberFormat(n) || "");
            return replaced.replace(/\s*\n\s*/g, " ").trim();
        }
        case "single-verse": {
            if (hasMarkers) {
                const lines: string[] = [];
                const re = /(?:\[(\d+)\]\s*)([\s\S]*?)(?=(?:\[\d+\]\s*)|$)/g;
                let m: RegExpExecArray | null;
                while ((m = re.exec(raw))) {
                    const num = m[1];
                    let body = (m[2] || "").replace(/\s*\n\s*/g, " ").trim();
                    lines.push(`${numberFormat(num) || ""}${body}`.trim());
                }
                return lines.join("\n");
            } else {
                return raw
                    .split(/\n+/)
                    .map((l) => l.trim())
                    .filter((l) => l.length)
                    .join("\n");
            }
        }
        default:
            return raw;
    }
}

export function bodyForDisplay(formatted: string, format: VerseFormat): string {
    const usesHtml = [
        "superscript",
        "superscript-bold",
        "superscript-italic",
        "bold",
        "italic",
    ].includes(format.number);
    return usesHtml ? formatted : escapeMarkdown(formatted);
}
