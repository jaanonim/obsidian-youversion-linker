import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginSpec,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
	WidgetType,
} from "@codemirror/view";
import LinkPreviewManager from "./LinkPreview";

class LinkPreviewView implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		let last_f: number = 0;
		let last_t: number = 0;
		let content: string = "";
		let urls: Array<string> = [];

		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					if (node.type.name.startsWith("link")) {
						const slice = view.state.sliceDoc(node.from, node.to);
						last_f = node.from;
						last_t = node.to;
						content = slice;
					}
					if (node.type.name.startsWith("string_url")) {
						const slice = view.state.sliceDoc(node.from, node.to);
						if (slice.startsWith("https://www.bible.com/bible")) {
							urls.push(slice);
							builder.add(
								last_f,
								last_t,
								Decoration.replace({
									widget: new LinkTooltip(content, slice),
								})
							);
						}
					}
				},
				mode: 2,
			});
		}
		LinkPreviewManager.clearCache(urls);
		return builder.finish();
	}
}

const pluginSpec: PluginSpec<LinkPreviewView> = {
	decorations: (value: LinkPreviewView) => value.decorations,
};

export const linkPreviewPlugin = ViewPlugin.fromClass(
	LinkPreviewView,
	pluginSpec
);

class LinkTooltip extends WidgetType {
	constructor(private text: string, private url: string) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const el = document.createElement("a");
		el.href = this.url;
		el.innerHTML = this.text;

		LinkPreviewManager.processLink(el);

		return el;
	}
}
