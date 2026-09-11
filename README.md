# Michelin Race Challenge — reconstrucție web

Joc 2D slot-car, cu interfață în română. Proiect independent; grafica și circuitele sunt reconstruite, nu fișiere recuperate din original.

## Joc

- Cinci circuite complet vizibile, două culoare, monoposturi desenate în Canvas.
- Săgeată sus: accelerație graduală. Săgeată jos: frână. Eliberarea accelerației: încetinire naturală. Butoane tactile pe telefon.
- Ieșire deterministă din viraje, revenire automată după 1 s în același punct, viteză zero.
- Opt tururi. Egalitățile de cel mult 0,01 s adaugă un tur fără resetarea cursei.
- Trei pneuri disponibile tuturor: Soft, Medium, Hard; fără uzură sau achiziții în această versiune.
- Antrenament solo sau cu adversar automat, fără puncte și fără recorduri clasate.
- Dueluri reale între două identități autentificate: provocatorul alege circuitul, adversarul culoarul.
- Punctaj +3/−3, istoric, clasament general și de sezon, recorduri pe circuit, profiluri.
- Chat global, orașe, mesaje private și canale de turneu cu verificarea accesului.
- Administrare turnee, înscrieri, dueluri eliminatorii, calificări directe și sezoane.

## Server și stocare

React/Vinext + Cloudflare Worker + D1. Autentificarea este furnizată de Sites/ChatGPT; utilizatorii și clasamentele nu sunt păstrate doar în browser. Primul utilizator autentificat primește rolul de administrator: activarea inițială se face cât timp Site-ul este privat, accesibil doar proprietarului.

Serverul simulează fizica folosind numai comenzi validate (−1, 0, +1), nu acceptă poziții, timpi sau scoruri furnizate de client. Starea duelului este salvată în D1 prin actualizări cu verificarea reviziei. Rezultatele se acordă o singură dată într-o tranzacție, cu dovadă unică pentru fiecare rezultat.

Sincronizarea folosește cereri HTTP periodice (aproximativ 5/s/client) și predicție locală între răspunsuri. Este o primă implementare pentru grupuri mici, nu un backend dimensionat pentru competiții masive. Nu au fost efectuate teste de încărcare sau măsurători de latență între țări.

Lipsa semnalului mai mult de 1,2 s suspendă cursa la starea confirmată pe server. Fereastra de reconectare este de 10 s de la ultimul semnal. Un singur deconectat pierde; dacă ambii dispar, duelul se anulează. Detectarea nu poate coincide exact cu momentul fizic al pierderii conexiunii.

Turneele progresează în timpul cererilor către paddock, fără un serviciu separat de planificare. Sub doi înscriși, turneul se anulează. La invitație neacceptată timp de două minute, ultima prezență online departajează neprezentarea. Dacă ambii piloți dispar dintr-un duel de turneu, perechea este eliminată. Regulile pot fi ajustate ulterior.

## Dezvoltare locală

Necesită Node 22.13+ pentru aplicație; testele folosesc Node 24+ cu suportul node:sqlite și TypeScript în Node.

1. Instalează cu `npm run install:ci`.
2. Compilează cu `npm run build`.
3. Aplică migrarea locală o singură dată:
   `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_thin_micromacro.sql`
4. Pornește cu `npm run dev`; adresa implicită este http://localhost:5173/.
5. Autentificarea locală de dezvoltare se face prin `/signin-with-chatgpt?return_to=/`, folosind identitatea simulată a starterului.

## Verificare

- `node node_modules/typescript/bin/tsc --noEmit`
- `node --test tests/game.test.mjs`
- `npm run build`

Testele rulează pe o bază SQLite izolată și acoperă geometria circuitelor, accelerația/frâna, respawn, aderența pneurilor, egalitatea, coliziunile, autorizarea, confidențialitatea chatului, punctajul fără dublare, reconectarea, un duel complet, turneele și resetarea sezonului.

Nu s-a efectuat testare vizuală automată în browser, test cu doi oameni pe rețele diferite sau validarea WebMCP într-un browser compatibil. WebMCP este opțional și detectat la rulare.

## Publicare

Configurația Sites se află în .openai/hosting.json. Migrarea D1 și sursa sunt incluse în proiect. Versiunea inițială se publică privat pentru proprietar. Pentru dueluri între alte persoane trebuie extins accesul Site-ului la participanți. Schimbarea accesului se face din platforma Sites, independent de rolul de administrator din joc.

