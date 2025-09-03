export function escapeMarkdown(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/\*/g, "\\*")
		.replace(/_/g, "\\_")
		.replace(/`/g, "\\`")
		.replace(/#/g, "\\#")
		.replace(/\+/g, "\\+")
		.replace(/-/g, "\\-")
		.replace(/\./g, "\\.")
		.replace(/!/g, "\\!")
		.replace(/\[/g, "\\[")
		.replace(/\]/g, "\\]")
		.replace(/\(/g, "\\(")
		.replace(/\)/g, "\\)")
		.replace(/\{/g, "\\{")
		.replace(/\}/g, "\\}")
		.replace(/\^/g, "\\^")
		.replace(/~/g, "\\~")
		.replace(/\|/g, "\\|")
		.replace(/>/g, "\\>")
		.replace(/</g, "\\<")
		.replace(/&/g, "\\&");
}
