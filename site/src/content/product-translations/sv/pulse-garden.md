---
# Swedish text for src/content/products/pulse-garden.md. Only translatable fields; lists must match the source item by
# item (validated at build time). In-game names (Spark, Bloom, Anchor, Instability, Heat) are kept as they appear.
slug: pulse-garden
locale: sv
tagline: Ett levande pussel där varje drag förändrar allt.
description: >-
  Ett strategipussel för iPhone, i stående läge och för en hand. Plantera organismer i en kompakt hexagonal trädgård,
  starta kedjereaktioner och väg en växande poäng mot en stigande instabilitet.
statusNote: >-
  Spelbart som prototyp på dator. Utformat först och främst för iPhone — ännu inte testat på iPhone och inte
  tillgängligt på App Store eller TestFlight.
iconAlt: Pulse Gardens appikon — en cyanfärgad stjärna, en rosa blomma och en bärnstensfärgad hexsten i en turkos hexagon.
heroImageAlt: >-
  Pulse Garden under spel: en hexagonal trädgård med glödande organismer mitt i en reaktion, med texten
  ”Chain x19 — Whole garden pulse!”.
ogImageAlt: Pulse Garden — ett levande pussel där varje drag förändrar allt.
facts:
  - label: Genre
    value: Strategipussel
  - label: Utformat för
    value: iPhone, stående läge
  - label: Anslutning
    value: Spelas helt offline
  - label: Språk
    value: Engelska och svenska
  - label: Styrning
    value: Ett finger, turordningsbaserat
  - label: Spellägen
    value: Fri · Daglig · Utmaningar
  - label: Utmaningar
    value: 200 nivåer i 10 kapitel
  - label: Spelmotor
    value: Godot 4
stepsEyebrow: Så spelar du
stepsTitle: Från ett tryck till en puls genom hela trädgården
steps:
  - title: Läs av trädgården
    description: >-
      Tre organismer, en regel var. Spark avfyras när den planteras, Bloom fördubblar en puls och Anchor tar upp den
      och lugnar trädgården.
    alt: Spelets ”How to play”-kort som förklarar Spark, Bloom och Anchor, Heat och terräng.
  - title: Förhandsgranska draget
    description: >-
      Tryck på en hexruta för att se exakt vad som händer — poäng, instabilitet före och efter, och om draget är
      säkert eller riskabelt. Tryck igen för att plantera.
    alt: En förhandsgranskning av ett drag märkt CALMING som visar +520 poäng och en instabilitet som sjunker från 8 till 7.
  - title: Starta kedjan
    description: >-
      Pulserna vandrar från organism till organism. Planera placeringen rätt så tänder ett enda tryck hela
      trädgården.
    alt: En kedjereaktion med 19 organismer över hela trädgården och texten ”Chain x19 — Whole garden pulse!”.
milestones:
  - title: Spelbar kärna
    note: Hexagonal trädgård, tre organismer, deterministiska kedjereaktioner, poäng, instabilitet och omstart.
  - title: Tydlighet och introduktion
    note: Välkomstkort, en guide på en minut och tydliga förhandsgranskningar av dragen.
  - title: Omspelbarhet
    note: Heat, terräng, lägena Fri, Daglig och Utmaning samt par och stjärnor finns på plats; speltester med människor pågår.
  - title: 200 utmaningsnivåer
    note: Tio kapitel byggda och automatiskt kontrollerade; speltester per kapitel återstår.
  - title: Redo för iPhone
    note: Layouter för iPhone och export via Xcode är förberedda. Ännu inte byggt på en Mac eller testat på en iPhone.
  - title: Externt speltest
  - title: TestFlight-beta och App Store
    note: Först efter tester på iPhone och med ägarens godkännande.
milestonesSource: Pulse Gardens projektfärdplan och README (oktober 2026)
gallery:
  - alt: Pulse Gardens huvudmeny med Free garden, Daily garden och Challenges.
    caption: Fri trädgård, daglig trädgård och utmaningar.
  - alt: >-
      En förhandsgranskning av ett drag märkt CALMING som visar +520 poäng och en instabilitet som går från 8 till 7
      innan organismen planteras.
    caption: Förhandsgranska varje drag innan du bestämmer dig.
  - alt: En kedjereaktion med 19 organismer som lyser upp över hela trädgården.
    caption: En enda placering kan sätta igång hela trädgården.
  - alt: Kapitelskärmen med utmaningskapitel som Chain Reactions, Fertile Ground och Stone Paths.
    caption: Tio kapitel med handkontrollerade utmaningar.
  - alt: Introduktionskortet för nivå 3-8 med mål, stjärngränser och parpoäng.
    caption: Varje nivå har ett par, satt av en inbyggd spelare.
  - alt: Resultatskärmen med texten ”Garden in full bloom”, tre stjärnor och slutpoängen 2900.
    caption: Nå par för tre stjärnor.
  - alt: Spelets ”How to play”-kort som förklarar Spark, Bloom, Anchor, Heat och terräng.
    caption: Reglerna får plats på ett kort.
features:
  - title: Ett tryck, och hela trädgården reagerar
    description: >-
      Välj en organism och plantera den på en hexruta. Dess puls vandrar genom varje organism den når, och varje
      reaktion ger poäng.
  - title: Tre organismer
    description: >-
      Spark avfyras när den planteras och skickar pulser vidare. Bloom fördubblar en puls. Anchor tar upp en puls och
      sänker instabiliteten.
  - title: Heat mot instabilitet
    description: >-
      Högre instabilitet multiplicerar varje poäng ×2 och sedan ×3 — men vid 25 växer trädgården igen och omgången tar
      slut.
  - title: Förhandsgranska innan du planterar
    description: >-
      Tryck en gång för att se resultatet: poäng, instabilitet före och efter, och om draget är säkert eller
      riskabelt. Tryck igen för att plantera.
  - title: 200 utmaningsnivåer
    description: >-
      Tio kapitel, där varje nivå har ett par satt av en inbyggd spelare. Samla stjärnor för att låsa upp nästa nivå.
  - title: Spelas offline
    description: >-
      En daglig trädgård som är densamma för alla, utan krav på att spela varje dag. Inget konto och ingen reklam i den
      nuvarande versionen. Engelska och svenska.
---

Pulse Garden är ett turordningsbaserat strategipussel byggt kring en enda idé: **ett tryck planterar en organism, och
ett nät av reaktioner förändrar hela trädgården.**

Varje drag avgörs förutsägbart, så du kan lära dig exakt varför en kedja fungerade — och sedan planera en större.
Stenar blockerar både plantering och pulser. Bördig jord fördubblar poängen. Instabiliteten stiger för varje organism
du planterar; att spela på gränsen multiplicerar poängen, ända tills trädgården växer igen.

Varje trädgård har ett *par*: den poäng som en inbyggd spelare når i samma trädgård. En stjärna låser upp nästa nivå;
tre stjärnor betyder att du har nått paret.

Pulse Garden är byggt i Godot och utformat för en telefon som hålls i en hand. Spelet är fortfarande under utveckling,
och inget här är slutgiltigt.
