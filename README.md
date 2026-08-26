# 🥑 DietaQuest

La tua dieta e la tua scheda trasformate in un gioco. Webapp PWA personale, mobile-first, con particelle WebGPU.

## Comandi

```bash
npm run dev
```

```bash
npm run build
```

`npm run icons` rigenera le icone PWA (serve solo se cambi la mascotte).

## Online

L'app è pubblicata su GitHub Pages: **https://micheal44mic.github.io/dietaquest/**

Da Safari sull'iPhone: **Condividi → Aggiungi a Home**. Da lì parte a schermo intero, funziona
offline grazie al service worker e le particelle WebGPU girano (servono HTTPS o `localhost`).

Per aggiornarla dopo una modifica:

```bash
npm run deploy
```

Compila e spinge la build sul branch `gh-pages`. Il sorgente sta su `main`; `dist` non viene
versionata. L'aggiornamento sul telefono si vede al secondo avvio, perché il service worker
scarica la versione nuova e la attiva al riavvio successivo.

⚠️ Il percorso `/dietaquest/` è cablato in `vite.config.ts` (`BASE`): se rinomini il repository
vanno cambiati anche `base`, `scope` e `start_url`, altrimenti la pagina resta bianca.

I dati sono legati all'indirizzo: quelli registrati sul vecchio indirizzo locale non si spostano
qui. Usa **Profilo → Esporta / Importa** per trasferirli.

## Come funziona il programma

La scheda è **settimanale**: 5 sedute e 2 giorni senza pesi, ripetuti ogni 7 giorni.

| Giorno | Seduta |
| --- | --- |
| Lunedì | Upper A — centro schiena, deltoidi laterali, braccia |
| Martedì | Lower A — femorali e glutei pesanti, addome, collo |
| Mercoledì | Riposo o camminata leggera + cardio facile |
| Giovedì | Upper B — centro schiena, spalle, braccia, poco petto |
| Venerdì | Lower B — glutei e femorali, addome, collo |
| Sabato | Upper C — braccia prioritarie, in superserie |
| Domenica | Riposo o camminata leggera + cardio facile |

L'app calcola da sola a che giorno e a che settimana sei partendo dalla **data di inizio**
(Profilo → Programma). Se salti un giorno o vai avanti, i pulsanti *giorno prima / giorno dopo*
spostano il ciclo senza perdere lo storico.

### Quando parte

Il giorno 1 è fissato al **22 agosto 2026** (`PROGRAM_START` in `src/data/program.ts`).
Prima di quella data l'app lo dice chiaramente e non fa spuntare nulla, così non finiscono XP,
streak e medie fuori dal programma. Puoi cambiare la data da Profilo → Programma, e
«Azzera tutti i dati» rimette sempre quella di partenza.

Partire di sabato non cambia il ritmo della scheda: resta due giorni di lavoro, uno di stop, tre
di lavoro, uno di stop. Cambiano solo i giorni della settimana su cui cadono i riposi (lunedì e
venerdì invece di mercoledì e domenica). Se li vuoi come da tabella, la data di inizio va su un lunedì.

### Rampa di volume, automatica

Il piano chiede di non passare di colpo da 9 a 15 serie di alzate laterali:

- **Settimane 1-2**: alzate laterali a 4 serie per seduta, collo a 1 serie per direzione.
- **Settimana 1**: circa 2 RIR anche sugli isolamenti (il collo resta sempre a 3).
- **Dalla settimana 3**: volume e RIR pieni della scheda.

È gestita da `workoutFor` in `src/game/cycle.ts`, non da un'impostazione: si applica da sola in
base alla settimana. Dalla settimana 7 l'app ricorda che il piano prevede una settimana di scarico.

Ogni esercizio ha un **"Come farlo bene"** che si apre con la descrizione tecnica, e i recuperi
sono quelli della scheda. Le superserie di Upper C sono marcate A1/A2 e B1/B2: dopo A1 non parte
nessun timer, perché si passa subito ad A2.

### Muoversi fra i giorni

Le frecce in cima alla schermata Oggi scorrono avanti e indietro nel calendario.

- **Giorni passati**: pienamente modificabili, così puoi segnare quello che avevi dimenticato.
- **Giorni futuri**: sola lettura, in modalità *anteprima* — pasti con le quantità, esercizi con
  serie e ripetizioni, obiettivo passi. Serve per fare la spesa e prepararti.

Il futuro è volutamente non spuntabile: segnare come mangiato un pasto non ancora mangiato
falserebbe XP, streak e medie settimanali del peso, che sono la base della revisione calorica.

## Struttura

### La dieta: 5 modelli, non un menù al giorno

La dieta non è un menù diverso ogni giorno: sono **5 modelli** legati al tipo di giornata.

| Modello | Giornate | Circa |
| --- | --- | --- |
| A | Upper A, Upper B, Upper C | 2.286 kcal · 161 g P |
| B | Lower A | 2.297 kcal · 160 g P |
| C | Lower B | 2.281 kcal · 152 g P |
| D | primo giorno senza pesi | 2.027 kcal · 156 g P |
| E | secondo giorno senza pesi | 2.034 kcal · 151 g P |

I sette giorni sono **generati dal piano in formato testo**, non trascritti a mano:

```bash
npm run dieta
```

Legge `dieta_settimanale_testo_mandorle.txt` e riscrive il blocco DIETA di `src/data/program.ts`
con nome, quantità e valori nutrizionali di ogni alimento. Prima di scrivere controlla che la somma
degli alimenti torni con i totali di ogni pasto e di ogni giorno dichiarati nella fonte, e che lo
stesso alimento abbia sempre la stessa densità per 100 g. Se qualcosa non torna non scrive niente.

Quel blocco **non va modificato a mano**: si perde alla generazione successiva. Per cambiare la
dieta si aggiorna il file di testo e si rilancia il comando.

La creatina non compare fra gli alimenti perché è già una voce fissa della routine.

### I tuoi prodotti

Toccando un alimento dentro un pasto si aprono i valori **per 100 g**, precompilati con quelli del
piano: ci scrivi quelli dell'etichetta del prodotto che hai comprato davvero e da lì in poi l'app
usa i tuoi.

Sono salvati per 100 g e non per porzione di proposito: lo stesso alimento compare con quantità
diverse nei vari giorni — il pollo va da 180 a 220 g — quindi ogni porzione si ricalcola da sola.
Registri il prodotto una volta e vale per tutta la settimana.

I totali di pasto e di giornata sono calcolati sommando gli alimenti, quindi si aggiornano subito.
L'elenco dei prodotti corretti sta in **Profilo → 🏷️ I tuoi prodotti**, da dove si ripristinano
i valori del piano. Finiscono anche nei backup.

| Percorso | Cosa contiene |
| --- | --- |
| `src/data/program.ts` | I 7 giorni: modelli alimentari, esercizi, passi, cardio, spesa |
| `src/data/routine.ts` | Routine fissa, mobilità, riscaldamento, recuperi |
| `src/game/cycle.ts` | Dove sei nel ciclo settimanale, rampa di volume |
| `src/game/derive.ts` | XP, giornata perfetta, streak |
| `src/game/review.ts` | Medie settimanali, regola calorica, progressione carichi |
| `src/game/loads.ts` | Storico dei carichi, pronti a salire |
| `src/game/badges.ts` | I badge |
| `src/screens/WorkoutScreen.tsx` | Diario di allenamento serie per serie |
| `src/fx/` | Particelle WebGPU, suoni |

### La regola importante: i fatti nello storage, le regole nel codice

Nel telefono vengono salvati **solo i fatti**: quale pasto hai mangiato, quali voci di routine hai
spuntato, carico/ripetizioni/RIR di ogni serie, passi, acqua, misure. XP, livello, streak e badge
non sono mai salvati: si **ricalcolano ogni volta** da quei fatti (`src/game/derive.ts`).

Anche il programma vive nel codice, non nello storage. Questo significa che puoi
**correggere un grammo o cambiare un esercizio quando vuoi**, e lo storico resta coerente senza
azzerare niente.

Le uniche due cose "di gioco" persistite sono `seenLevel` e `seenBadges`, che servono solo a non
rifarti vedere la stessa celebrazione due volte.

Vincolo da rispettare se aggiungi badge: i `check` devono essere **monotoni**, cioè una volta veri
non possono tornare falsi. Per questo i badge streak usano `bestStreak` e non `streak` — altrimenti
un trofeo già conquistato si ri-bloccherebbe rompendo la catena.

## Modificare il piano

Apri [`src/data/program.ts`](src/data/program.ts). Per la dieta modifica i modelli `MODEL_A`…
`MODEL_E` e la `ROTATION`: la modifica si propaga da sola a tutte le giornate di quel tipo.
Gli `id` degli esercizi legano lo storico dei carichi: se cambi l'`id` di un esercizio perdi la
sua progressione, mentre cambiare `name`, serie o ripetizioni è sicuro.

Gli XP di ogni azione sono le costanti `XP` in [`src/game/derive.ts`](src/game/derive.ts).

## La revisione

In **Progressi** l'app calcola le medie settimanali del peso — il piano dice esplicitamente di non
reagire alle oscillazioni del singolo giorno — e applica la **tabella di decisione del giorno 22**.
Il bersaglio è perdere 0,15-0,30 kg a settimana, cioè circa 0,45-0,90 kg sui 21 giorni.

| Cosa dicono i dati | Cosa dice il piano |
| --- | --- |
| Oltre −1,2 kg | Aggiungi 100-150 kcal |
| Fra −0,45 e −0,90 kg | Continua identico |
| Peso quasi fermo ma vita in calo | Continua: probabile ricomposizione |
| Vita in aumento | Ricontrolla pesatura e punto di misura, non tagliare |
| Peso e vita invariati | Togli ~100 kcal: 25-30 g di riso secco in meno |

Servono almeno 4 pesate a settimana e 21 giorni completi. La vita conta quanto la bilancia: senza
misure registrate l'app usa solo il peso, quindi la ricomposizione non può riconoscerla.

È aritmetica sulle regole del piano applicata ai tuoi dati: la decisione resta tua.

## I carichi

**Progressi → 🏋️ Carichi** mostra l'andamento nel tempo di ogni esercizio.

In cima c'è **"Pronti a salire di carico"**: gli esercizi che hanno raggiunto il tetto del range in
tutte le serie per due sedute, con lo scatto da fare (+1-2,5 kg sopra, +2,5-5 kg sotto). È la regola
del piano applicata da sola, ed è la parte più utile: prima di andare in palestra sai già cosa
aumentare.

Il grafico traccia la **serie migliore di ogni seduta come kg × ripetizioni**, non il solo peso e
non il volume totale. Il motivo: nella doppia progressione si avanza prima aggiungendo ripetizioni,
quindi un grafico del solo peso resterebbe piatto proprio mentre stai migliorando; il volume totale
invece salterebbe quando cambia il numero di serie durante la rampa di ingresso. Quando aggiungi
peso il grafico scende, ed è normale: l'app te lo scrive.

I confronti avvengono **solo fra sedute dello stesso tipo** (`programDay`), perché lo stesso
esercizio può comparire in due giornate con schemi diversi — le estensioni tricipiti sono 3 × 8-12
in Upper A e 2 × 10-15 in Upper C, e mescolarle darebbe progressioni sbagliate.

Le stesse informazioni compaiono anche dentro il diario, sull'esercizio che stai facendo.

## Backup

**Profilo → Esporta** scarica un JSON con tutto; **Importa** lo rimette dopo averlo validato e
chiesto conferma. Fallo ogni tanto: i dati vivono solo nel browser di quel dispositivo.

## Da app web ad app vera

La struttura è pronta per Capacitor: `npm i @capacitor/core @capacitor/cli`, `npx cap init`,
`npx cap add ios`, e la `dist/` diventa l'app nativa senza riscrivere niente.
