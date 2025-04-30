import { BooksLangList } from "./Books";

import cz from "../../data/books/cz.json";
import da from "../../data/books/da.json";
import en from "../../data/books/en.json";
import nob from "../../data/books/nob.json";
import pl from "../../data/books/pl.json";
import ptBr from "../../data/books/pt-br.json";
import de from "../../data/books/de.json";
import nl from "../../data/books/nl.json";
import zhCN from "../../data/books/zh-CN.json";
import zhHK from "../../data/books/zh-HK.json";
import es from "../../data/books/es.json";
import ro from "../../data/books/ro.json";
import sv from "../../data/books/sv.json";
import uk from "../../data/books/uk.json";
import ru from "../../data/books/ru.json";
import ko from "../../data/books/ko.json";
import fr from "../../data/books/fr.json";

// prettier-ignore
const booksNames = {
	"Czech": cz,
	"Chinese Simplified": zhCN,
	"Chinese Traditional": zhHK,
	"Danish": da,
	"Dutch": nl,
	"English": en,
	"French": fr,
	"German": de,
	"Norwegian": nob,
	"Polish": pl,
	"Portuguese (Brazil)": ptBr,
	"Spanish": es,
	"Swedish": sv,
	"Romanian": ro,
	"Ukrainian": uk,
	"Russian": ru,
	"Korean": ko,
} as BooksLangList;

export default booksNames;
