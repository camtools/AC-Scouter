# AC Scouter

Strumenti per il set in una webapp utilizzabile da Safari, dagli altri browser
e dalla schermata Home di iPhone.

## Versione aggiornata

- Film Calculator e Depth of Field con risultati compatti e comandi adatti al tocco.
- Lens Match per mantenere approssimativamente la dimensione del soggetto nel frame:
  nota la nuova focale, calcola la distanza; nota la nuova distanza, calcola la
  focale teorica. Risultati in tempo reale, unità m/cm/ft, lettura feet/inches
  e lista di focali modificabile, salvata localmente.
- Sun Info per alba, tramonto e stime golden/blue hour.
- Marks con schede, foto, posizione ed esportazione PDF; salvataggio locale.
- Focus Chart e Chroma con sfondi fino ai bordi. La pressione prolungata dissolve
  soltanto i comandi, senza ridimensionare le immagini né selezionare le scritte.
- Ciak su sfondo nero, registrazione reale dal timbro più profondo e lampo bianco
  di 0,10 secondi sincronizzato all'inizio del battito.
- Scorrimento senza rimbalzo nelle pagine che entrano nello schermo; le schede
  lunghe rimangono scorribili. Icona derivata dal favicon originale.

## Grafica allineata all’app iPhone

Il menu mostra solo lo sfondo colorato leggermente scurito, senza sfocatura o
comandi residui di Chroma/Focus Chart. Il pulsante Home usa una casetta.
Lens Match dispone input, risultato e focali in una schermata, distribuendo
lo spazio verticale tra le card; i set oltre 15 focali usano pulsanti di pagina.
L’editor delle focali si apre sopra alla schermata. Anche Sun Tracker in Manual
usa un’area fissa, senza il piccolo scorrimento quando il contenuto entra.
Notch e indicatore Home restano protetti nella webapp installata.

## Uso su iPhone

Apri [AC Scouter](https://camtools.github.io/AC-Scouter/) in Safari e scegli
**Condividi → Aggiungi alla schermata Home**. Per vedere un aggiornamento,
ricarica la pagina dopo averla aperta con connessione disponibile.

Dopo il primo caricamento online, gli strumenti e i loro sfondi/audio sono
memorizzati sul dispositivo e disponibili offline. **Sun Info richiede Internet**
per la ricerca delle località e gli orari. Le schede Marks rimangono nell'archivio
locale di quel browser: non vengono sincronizzate con l'app iPhone o altri dispositivi.

Safari può richiedere il permesso di posizione e il volume multimediale deve
essere udibile per il Ciak. Le barre del browser dipendono da Safari; la versione
aggiunta alla Home utilizza l'area disponibile con protezione per notch e indicatore Home.
Il widget nativo iPhone rimane parte del progetto Xcode separato.

## Verifica locale

```sh
python3 -m http.server 8765
node --test tests/*.test.cjs
```

Apri `http://localhost:8765/`. Il service worker richiede HTTPS o localhost.
I collegamenti diretti usano `#tool=film`, `dof`, `sun`, `marks`, `focus`, `chroma`
o `ciak`; Lens Match usa `#tool=lens`. Il codice e le immagini del calcolatore sono inclusi nel repository;
le API Open-Meteo sono utilizzate soltanto quando si richiedono i dati Sun Info.

L'origine della registrazione del Ciak e la relativa licenza sono documentate in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Lens Match

La logica riutilizzabile è in `lens-match-math.js`, l'interfaccia e la persistenza
in `lens-match.js`. Il modulo matematico usa mm e metri, senza dipendere dal DOM.
Per lo stesso formato/sensore e crop, la prima versione applica
`D₂ = D₁ × F₂ / F₁` e l'inverso `F₂ = F₁ × D₂ / D₁`.

Esempi: 32 mm a 1,50 m → 50 mm a 2,34 m; 32 mm a 1,50 m → 3,00 m con
una focale teorica di 64 mm. Il rapporto delle focali è un'approssimazione
per la dimensione del soggetto: spostare la camera cambia la prospettiva.
Il confronto tra sensori/crop diversi non è implementato in questa versione.

Valori e lista di focali sono conservati nella chiave `ac_scouter_lens_match_v1`,
separata dalle schede Marks. Le distanze restano in metri internamente, senza
arrotondare i calcoli della griglia. I campi numerici accettano sia punto sia
virgola decimale; nell'editor della lista le virgole separano le focali e si usa
il punto per eventuali decimali. Lo strumento funziona anche offline.
