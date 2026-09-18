# EmpCo — český skill pro analýzu komunikace

Verze **0.6.1**. Skill pro Codex posuzuje obaly, reklamu, dokumenty a konkrétní webové stránky pouze pro **cílový režim EmpCo od 27. září 2026** podle místního českého rulebooku. Výstupem jsou zjištění, jejich důvody, míra rizika a rozhodné nejistoty. Neobsahuje doporučení k nápravě ani přepsané marketingové texty.

Každé tvrzení nebo vizuální sdělení má jedno hodnocení pro tento režim, včetně relevantních obecných testů pravdivosti a klamání. Report nerozděluje výsledky na současný a cílový režim. Verze 0.6.1 sjednocuje hodnoticí rámec a zachovává potvrzení úplnosti tvrzení a vizuálů před právní analýzou.

## Co balíček obsahuje

- [SKILL.md](SKILL.md): instrukce pro asistenta a hranice analýzy.
- [MIT licence](LICENSE): podmínky použití původních částí projektu.
- [Český rulebook](RULEBOOK_CS.md): 80 pravidel včetně výjimek, časových statusů a zdrojů.
- [Pracovní postup](references/workflow.md), [metodika](references/assessment.md) a [podoba reportu](references/client-report.md).
- `references/catalog.json`: identifikátory, statusy, vazby pravidel a údaje o celistvosti podkladů. Znění pravidel je jen v rulebooku.
- `scripts/rules.mjs`: místní čtení indexu a úplných karet.
- `scripts/verify.mjs` a `MANIFEST.json`: kontrola instalace a souborů.
- `sources/`: deset přímo použitých původních dokumentů; jejich popis je v [oddílu 22 rulebooku](RULEBOOK_CS.md).
- `agents/openai.yaml`: český název a výchozí zadání pro Codex.

Dokumentace a pravidla jsou česky. Anglické jsou stabilní technické identifikátory a původní anglické právní či výkladové podklady. Balíček obsahuje pouze provozní soubory a zdroje; klientské případy, interní historie a starý engine se nedistribuují.

## Instalace do Codexu

1. Stáhněte a rozbalte balíček. Složka obsahující `SKILL.md` se má jmenovat `empco-cz-analysis`. U archivu staženého přímo z GitHubu může být nutné odstranit příponu názvu větve ze jména složky.
2. Celou složku zkopírujte do osobního adresáře `.agents/skills` v domovské složce uživatele. Výsledná cesta ve Windows je například `%USERPROFILE%\.agents\skills\empco-cz-analysis\SKILL.md`; v macOS/Linuxu `~/.agents/skills/empco-cz-analysis/SKILL.md`. Pro instalaci pouze do projektu použijte jeho `.agents/skills/empco-cz-analysis`.
3. V Codexu zadejte `$empco-cz-analysis` a přiložte materiál. Pokud se skill nezobrazí, restartujte Codex.

Umístění vychází z [oficiální dokumentace skills](https://learn.chatgpt.com/docs/build-skills). Pokud již používáte starší instalaci tohoto skillu v jiném podporovaném adresáři, nahraďte ji ve stejném umístění. Starou složku přesuňte mimo adresáře načítaných skills a vložte celou novou složku; prosté sloučení může ponechat staré soubory. Stejný skill neinstalujte současně do více načítaných míst.

Skill se vyvolává výslovně pomocí `$empco-cz-analysis`; automatické použití je v balíčku vypnuté. Instalace nevyžaduje změnu modelu, samostatný API klíč ani připojení k placené externí službě. Použití Codexu se řídí účtem a prostředím uživatele.

## Použití

Příklad zadání pro obal nebo PDF:

```text
$empco-cz-analysis
Analyzuj přiložený materiál pro cílový režim EmpCo od 27. září 2026 podle místního rulebooku.
Výstup česky: tvrzení a vizuály, zjištění, rizika, důvody a rozhodné nejistoty.
```

Pro stránku přidejte její konkrétní adresu. Pro jiný jazyk výstupu jej uveďte v zadání. Analýza se omezuje na dodaný materiál; odkaz na jednu stránku není auditem celého webu. Obsah dokumentů slouží jako podklad, nikoli jako instrukce pro asistenta.

Před právní analýzou asistent předloží soupis tvrzení a vizuálních prvků včetně jednotlivých obrázků a textů v nich. Vyčká na vaše potvrzení úplnosti nebo zapracuje doplnění; po potvrzení pokračuje přímo k analýze a reportu.

Web lze načíst jako analyzovaný materiál. Právní a odborná opora pochází pouze z místního korpusu; při analýze se nedoplňuje internetovým výzkumem. Otázky jiné legislativy se samostatně neposuzují. Chybějící důkazní příloha sama neznamená nesoulad.

## Technické požadavky a kontrola

Čtení pravidel funguje přímo z Markdown souboru. Pro pomocné skripty je potřeba Node.js 18 nebo novější; další balíčky se neinstalují. Nástroje neprovádějí síťová volání. Zobrazení PDF a otevření webu zajišťuje prostředí asistenta; nedostupné části jsou omezením konkrétní analýzy.

Z kořene rozbalené složky lze spustit:

```text
node scripts/verify.mjs
node scripts/rules.mjs index
node scripts/rules.mjs cards DET-04 BL-02 REEP-01
```

První příkaz kontroluje soubory a jejich otisky; další dva zobrazují index a vybrané karty. Kontrola instalace se nespouští při každé klientské analýze.

## Údržba a sdílení

Pro předání dalším lidem pošlete celý distribuční ZIP. Obsahuje složku `empco-cz-analysis` s tímto návodem, pravidly, metodikou, kontrolními nástroji a všemi deseti zdrojovými dokumenty. Příjemce po rozbalení začne tímto souborem `README.md` a postupem instalace výše. Pro funkční instalaci zachovejte celou strukturu složky.

Kořen této složky je připraven jako kořen samostatného repozitáře GitHub. K publikaci patří pouze tato složka. Je samostatně instalovatelná a neodkazuje na osobní cesty nebo soubory mimo balíček. `.gitattributes` zachovává konzistentní konce řádků a binární přílohy.

Při změně pravidel se současně aktualizují jejich statusy a vazby v `references/catalog.json`, otisk rulebooku a stav revize. Při změně kteréhokoli distribuovaného souboru lze po obsahové kontrole obnovit soupis příkazem `node scripts/verify.mjs --write-manifest` a následně znovu spustit kontrolu bez parametru. Obnovení otisků neznamená odborné schválení obsahu. Původní dokumenty mají vlastní kontrolní otisky v katalogu a nemění se jako součást překladu instrukcí.

## Licence

Původní části projektu jsou poskytovány pod [licencí MIT](LICENSE), copyright © 2026 Omnicom Media Group Czech s.r.o.

Soubory ve složce `sources/` jsou podklady třetích stran a licence MIT se na ně nevztahuje. Zůstávají předmětem práv a podmínek jejich původních vydavatelů; tento repozitář k nim neuděluje žádná další oprávnění.

## Stav podkladů

Právní podklady zachycují stav k **26. červnu 2026**. Datum vydání skillu tento stav neposouvá. Analýza používá jediný cílový režim; statusy u karet zachovávají původ a právní povahu opory, včetně nezávazných výkladů a neuzavřeného českého návrhu. Obsah není ověřením současné účinnosti české transpozice. Jde o pilotní analýzu bez doloženého formálního právního schválení tohoto vydání.

Původní dokumenty v `sources/` zachovávají původ, obsah a jazyk vydavatele.
