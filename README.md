# AC Scouter

Strumenti per il set in una webapp utilizzabile da Safari, dagli altri browser
e dalla schermata Home di iPhone.

## Versione aggiornata

- Film Calculator e Depth of Field con risultati compatti e comandi adatti al tocco.
- Sun Info per alba, tramonto e stime golden/blue hour.
- Marks con schede, foto, posizione ed esportazione PDF; salvataggio locale.
- Focus Chart e Chroma con sfondi fino ai bordi. La pressione prolungata dissolve
  soltanto i comandi, senza ridimensionare le immagini né selezionare le scritte.
- Ciak su sfondo nero, registrazione reale dal timbro più profondo e lampo bianco
  di 0,10 secondi sincronizzato all'inizio del battito.
- Scorrimento senza rimbalzo nelle pagine che entrano nello schermo; le schede
  lunghe rimangono scorribili. Icona derivata dal favicon originale.

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
o `ciak`. Il codice e le immagini del calcolatore sono inclusi nel repository;
le API Open-Meteo sono utilizzate soltanto quando si richiedono i dati Sun Info.

L'origine della registrazione del Ciak e la relativa licenza sono documentate in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
