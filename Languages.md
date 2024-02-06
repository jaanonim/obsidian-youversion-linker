# Supported languages

Thanks to the community, we have support for the following languages:

-   English - [jaanonim](https://github.com/jaanonim)
-   Polish - [jaanonim](https://github.com/jaanonim)
-   Brazilian Portuguese - [brunofow](https://github.com/brunofow)
-   Norwegian - [cmeeren](https://github.com/cmeeren)
-   German - [Tecur](https://github.com/Tecur)
-   Chinese - [John Huang](https://github.com/junwhuan)

## Adding new language support

If you want to add support for a new language, you can do so by following these steps:

1. Fork the repository.
2. Create a new file in `data/books` with the name of the language (e.g. `data/books/pl.json`) with books names.
3. Import json file to `src/Books.ts` as shown in the example:

```ts
import _pl from "../data/books/pl.json";
```

```ts
const pl = _pl as {
	[key: string]: string[];
};
```

```ts
Object.keys(books).forEach((b) => {
	books[b].push(
		// ...
		...pl[b]
		// ...
	);
});
```

(See the other languages for examples.)

4. Add your name to the list above in this file (`Languages.md`).
5. Create a PR with the changes. (I will review it and merge it.)

**Thank you for your contribution!**
