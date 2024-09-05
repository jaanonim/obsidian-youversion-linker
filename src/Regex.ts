export const linkRegex =
	/([12345]\s?)?\p{L}+\s?\d{1,3}([:,.]\s?\d{1,3}([-–]\d{1,3})?)?/gu;

export const bookRegex = /([12345]\s?)?\p{L}+/u;

export const separatorRegex = /[-:,.–]+/;

export const htmlDataRegex =
	/<script\s*id="__NEXT_DATA__"\s*type="application\/json"\s*>.+?(?=<\/script>\s*<\/body>\s*<\/html>)/;

export const htmlCleanupRegex =
	/<script\s*id="__NEXT_DATA__"\s*type="application\/json"\s*>/;
