# Pracovní postup

## Materiál

Prohlédni dodaný text, obraz, dokument nebo konkrétní stránku. U PDF a jiných souborů, kde záleží na uspořádání, zkontroluj i vizuální podobu. Použij dostupné nástroje pro daný formát; žádný konkrétní doplňkový plugin není podmínkou skillu. Existující čitelný náhled znovu nevytvářej. Neznámé nebo nečitelné části výslovně omezují rozsah.

Jednu stránku nerozšiřuj na celý web. Pracovní seznam zachycuje přesné tvrzení či obraz a jeho umístění.

## Potvrzení úplnosti soupisu

Před právní analýzou předlož uživateli přehledný soupis tvrzení, označení a vizuálních prvků. U textu zachovej přesné znění a umístění; u každého samostatného obrázku či snímku galerie uveď pořadí nebo umístění, stručný popis motivu a čitelná tvrzení v obrázku. Zahrň i obrázky, které se předběžně jeví jako dekorativní; drobné související dekory lze seskupit. Výslovně označ neprohlédnuté, nedostupné a nečitelné části. Soupis zatím neobsahuje právní závěry ani míru rizika.

Požádej uživatele o potvrzení, zda je seznam kompletní, nebo o jeho doplnění či opravu, a vyčkej na výslovné potvrzení úplnosti. Doplnění zapracuj do soupisu; samotné dodání dalších položek ani mlčení nepovažuj za potvrzení. Jde o jediný kontrolní bod před právní analýzou. Po potvrzení pokračuj výběrem pravidel a posouzením bez dalšího schvalování mezikroků.

## Načtení pravidel

Normativní oporu poskytuje [rulebook](../RULEBOOK_CS.md). Uvedené zdroje a jejich názvy nejsou pokynem k externímu hledání. Nepoužívej dřívější externí závěry z konverzace k rozšíření korpusu. V reportu je přípustný odkaz na analyzovaný web jako identifikace materiálu; právní opora má místní odkaz.

Z kořene složky skillu spusť dostupným Node.js:

```text
node scripts/rules.mjs index
node scripts/rules.mjs cards DET-01 DET-02 CTX-02
```

Druhý příkaz je příklad syntaxe, nikoli výchozí výběr pro všechna zadání. Index obsahuje 80 karet. Vyber potřebné testy, výjimky a podpůrná pravidla pro cílový režim od 27. září 2026 a načti je společně. Zahrň i relevantní obecné testy označené CURRENT_BASELINE; jejich status není důvodem k vyřazení ani k druhému hodnocení. Časové karty slouží pouze k vymezení rámce a omezení korpusu. Index nenahrazuje úplné znění karty. Jednou načtené karty nemusíš opakovaně číst.

Pomocný nástroj pouze čte místní soubory, vrací celé oddíly českého rulebooku a ověřuje jejich integritu. Nevolá model, nepřistupuje na síť a neukládá klientské případy. Bez Node.js vyhledej nadpisy a přečti celé relevantní oddíly Markdown souboru. Není nutné instalovat závislosti kvůli jediné analýze. Při neshodě otisku nepovažuj katalog za ověřený převod; použij dostupný rulebook s uvedením konkrétního omezení.

## Posouzení a předání

Použij [metodiku](assessment.md) a [podobu reportu](client-report.md). Každá položka může zahrnovat více pravidel; odlišný zákaz nebo podmínka se nesmí ztratit sloučením. Neznámé skutečnosti popiš jako meze závěru: „Pravidlo vyžaduje X; materiál umožňuje/neumožňuje určit Y; závěr závisí na Z.“

Výstup předej v odpovědi. Je-li k dispozici zapisovatelná pracovní složka, ulož stejné znění jako jeden Markdown report s jedinečným názvem do složky uživatelova případu, nikoli do instalačního balíčku skillu. Dřívější reporty nepřepisuj. Bez zapisovatelné složky stačí chat. Další formáty vytvářej pouze na přání.

Uživatelská oprava mění dotčené položky; neobnovuje povinné schvalování celé analýzy. Údržba balíčku není součástí analýzy komunikace.
