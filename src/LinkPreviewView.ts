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
import { verify } from "crypto";
import { MarkdownRenderChild } from "obsidian";
import tippy from "tippy.js";

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

		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					console.log("e", node.type.name);
					return;
					if (node.type.name.startsWith("string_url")) {
						const slice = view.state.sliceDoc(node.from, node.to);
						console.log(slice);
						builder.add(
							node.from,
							node.to,
							Decoration.replace({
								widget: new LinkTooltip(slice, slice),
							})
						);
					}
				},
				leave(node) {
					console.log("l", node.type.name);
				},
				mode: 2,
			});
		}

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

		tippy(el, { content: "działa" });

		return el;
	}
}
