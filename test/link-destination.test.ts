import LinkPreviewManager from "../src/preview/LinkPreview";
import { getSuggestionsFromQuery } from "../src/Suggestions";
import {
	DEFAULT_SETTINGS,
	LinkDestination,
	ObsidianYouversionLinkerSettings,
} from "../src/settings/SettingsData";
import { VerseType } from "../src/verses/VerseType";

jest.mock("../src/preview/LinkPreview", () => ({
	__esModule: true,
	default: {
		processUrl: jest.fn(),
	},
}));

const mockedLinkPreviewManager = LinkPreviewManager as jest.Mocked<
	typeof LinkPreviewManager
>;

function getSettings(
	linkDestination: LinkDestination
): ObsidianYouversionLinkerSettings {
	return {
		...DEFAULT_SETTINGS,
		linkDestination,
		bibleVersions: [{ id: "1", language: "eng" }],
		selectedBooksLanguages: ["English"],
	};
}

describe("Link destination", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("builds a route.bible URL for a matched reference", async () => {
		const [suggestion] = getSuggestionsFromQuery(
			"John 3:16",
			VerseType.LINK,
			getSettings(LinkDestination.ROUTE_BIBLE)
		);

		expect(await suggestion.toReplace()).toBe(
			"[John 3:16](https://route.bible/?q=John%203%3A16&utm_source=obsidian_youversion_linker&utm_medium=link)"
		);
	});

	test("keeps the existing YouVersion URL by default", async () => {
		const [suggestion] = getSuggestionsFromQuery(
			"Romans 8:28-29",
			VerseType.LINK,
			getSettings(LinkDestination.YOUVERSION)
		);

		expect(await suggestion.toReplace()).toBe(
			"[Romans 8:28-29](https://www.bible.com/bible/1/ROM.8.28-29)"
		);
	});

	test("keeps quote generation unchanged apart from the destination link", async () => {
		mockedLinkPreviewManager.processUrl.mockResolvedValue({
			err: false,
			info: { title: "John 3:16", version: "KJV" },
			verses: "For God so loved the world",
		});

		const [suggestion] = getSuggestionsFromQuery(
			"John 3:16",
			VerseType.EMBED,
			getSettings(LinkDestination.ROUTE_BIBLE)
		);

		const result = await suggestion.toReplace();

		expect(mockedLinkPreviewManager.processUrl).toHaveBeenCalledWith(
			"https://www.bible.com/bible/1/JHN.3.16"
		);
		expect(result).toContain(
			"(https://route.bible/?q=John%203%3A16&utm_source=obsidian_youversion_linker&utm_medium=link)"
		);
		expect(result).toContain(">For God so loved the world");
	});
});
