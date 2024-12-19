# Supported languages

Thanks to the community, we have support for the following languages:

-   Brazilian Portuguese - [Brunofow](https://github.com/brunofow)
-   Chinese - [John Huang](https://github.com/junwhuan)
-   Danish - [Nicolai Skødt Holmgaard](https://github.com/Nicolai9852)
-   Dutch - [Jaap Kramer](https://github.com/jaapkramer)
-   English - [Jaanonim](https://github.com/jaanonim)
-   German - [Tecur](https://github.com/Tecur)
-   Norwegian - [Cmeeren](https://github.com/cmeeren)
-   Polish - [Jaanonim](https://github.com/jaanonim)
-   Spanish - [Javier Rios](https://github.com/JavierRiosN)
-   Swedish - [Eric Lundgren](https://github.com/TheFringe)
-   Romanian - [Paul Timoce](https://github.com/paultimoce)
-   Rusian - [Sakardin](https://github.com/Sakardin)
-   Ukrainian - [Seesmof](https://github.com/seesmof)
-   Korean - [Woollim](https://github.com/woollim)
-   French - [Cedriane](https://github.com/Cedriane)

## Adding new language support

If you want to add support for a new language, you can do so by following these steps:

1. Fork the repository.
2. Create a new file in `data/books` with the name of the language (e.g. `data/books/pl.json`) with books names.
3. Import json file to `src/BooksLists.ts` as shown in the example:

```ts
import pl from "../data/books/pl.json";
```

```ts
// prettier-ignore
const booksNames = {
	// ...
	"Polish": pl,
	// ...
} as BooksLangList;
```

(See the other languages for examples.)

4. Add your name to the list above in this file (`Languages.md`).
5. Create a PR with the changes. Title it `Add {some_languges} book names` for eg: `Add Polish book names`. (I will review it and merge it.)

**Thank you for your contribution!**
