---
# Swedish text for src/content/products/pdfstudio.md. Only translatable fields; lists must match the source item by
# item (validated at build time). PDF Studio's own UI is Swedish by default, so on-screen labels are quoted as shown.
slug: pdfstudio
locale: sv
tagline: Läs, redigera, organisera, signera, skydda och skriv ut PDF-filer — helt offline.
description: >-
  Ett Windows-program för att läsa, redigera, organisera, signera, skydda och skriva ut PDF-filer. Det fungerar helt
  offline, utan konto, och dina dokument lämnar aldrig datorn.
statusNote: >-
  Version 0.9.0 är en osignerad förhandsversion för utveckling, testad på utvecklarens dator. Den har inte släppts:
  det finns ingen offentlig nedladdning, beta, prissättning eller lanseringsdag.
iconAlt: >-
  PDF Studios appikon — ett vitt dokument med ett vikt hörn och fyra violetta textrader på en kvadrat med rundade
  hörn i en övergång från violett till rosa.
heroImageAlt: >-
  PDF Studios startsida i mörkt tema, med snabbåtgärder, listan över senaste filer och en yta för att släppa PDF-filer.
screenshotsNote: >-
  Riktiga skärmbilder av PDF Studio 0.9.0 från de automatiska gränssnittstesterna i Windows 11 med 100 % skalning.
  Gränssnittet är på svenska, som är standardspråket, och alla dokument är syntetiska testfiler.
facts:
  - label: Typ
    value: PDF-läsare och redigerare
  - label: Körs på
    value: Windows 10 (2004+) och 11, x64
  - label: Byggd med
    value: WinUI 3 · .NET 10
  - label: Anslutning
    value: Fungerar helt offline
  - label: Integritet
    value: Inget konto, ingen telemetri
  - label: Installation
    value: "Per användare, utan admin\u00ADrättigheter"
  - label: Språk
    value: Svenska och engelska (huvudgränssnittet)
  - label: Version
    value: "0.9.0 · förhands\u00ADversion, inte släppt"
stepsEyebrow: Så fungerar det
stepsTitle: Hitta, ändra, spara säkert
steps:
  - title: Hitta alla verktyg och ord
    description: >-
      Tryck Ctrl+K och skriv för att hitta valfritt kommando. Fritextsökningen markerar varje träff, och dokumenten
      öppnas i flikar med miniatyrer och zoom från 25 till 800 %.
    alt: Kommandosökningen med Ctrl+K — skriver man ”rotera hö” hittas Rotera höger.
  - title: Redigera, fyll i och skydda
    description: >-
      Ändra sidordning, kommentera, fyll i formulär eller markera innehåll för verklig maskering. Varje ändring går
      att ångra tills du sparar.
    alt: Fliken Skydda med ett område markerat för maskering över ett syntetiskt kontonummer, SECRET-1234-5678.
  - title: Spara utan risk
    description: >-
      Sparandet sker atomärt, så ett misslyckat sparande skadar aldrig originalet. Maskerat innehåll tas bort ur
      filen, det döljs inte bara.
    alt: Maskeringen tillämpad och sparad — kontonumret är borttaget ur filen och den sparade filen är kontrollerad.
gallery:
  - alt: Startsidan i mörkt tema med snabbåtgärder, en tom lista med senaste filer och en yta för att släppa filer.
    caption: Startsidan, mörkt tema
  - alt: Dokumentvyn i mörkt tema med flikar, menyfliksområde, miniatyrer, arbetsyta och egenskapspanel.
    caption: Dokumentvyn, mörkt tema
  - alt: Dokumentvyn i ljust tema med flikar, menyfliksområde, miniatyrer, arbetsyta och egenskapspanel.
    caption: Dokumentvyn, ljust tema
  - alt: Kommandosökningen med Ctrl+K hittar Rotera höger efter att man skrivit ”rotera hö”.
    caption: Kommandosökning med Ctrl+K
  - alt: Sökpanelen för fritext med en markerad träff på sidan 4 och en banderoll om att filen är sparad och kontrollerad.
    caption: Fritextsökning med markerade träffar
  - alt: Ett område markerat för maskering över det syntetiska kontonumret SECRET-1234-5678.
    caption: Verklig maskering — området markerat
  - alt: Kontonumret borttaget ur den sparade filen, och den sparade filen kontrollerad.
    caption: Verklig maskering — borttaget och sparat
  - alt: Formulärpanelen fyller i ett textfält, en kryssruta och en lista i ett AcroForm-formulär, med ett påhittat namn.
    caption: Ifyllning av ett formulär
  - alt: Utskriftsdialogen med förhandsvisning, skrivare, sidor, antal kopior, orientering, skalning och sidor per ark.
    caption: Utskrift med förhandsvisning
  - alt: Startsidan i ljust tema med snabbåtgärder, en tom lista med senaste filer och en yta för att släppa filer.
    caption: Startsidan, ljust tema
features:
  - title: Läs och navigera
    description: >-
      Flikar, miniatyrer, gå till sida, zoom från 25 till 800 % och löpande rullning. Fritextsökningen markerar varje
      träff, och bokmärken, bilagor och dokumentegenskaper finns nära till hands.
  - title: Organisera sidor
    description: >-
      Ändra ordning med dra och släpp eller tangentbordet, rotera, infoga, duplicera, ta bort, extrahera, dela och
      sammanfoga. Lägg till beskärning, sidnummer, Bates-numrering eller vattenstämpel.
  - title: Redigera och kommentera
    description: >-
      Lägg till text, former, bilder, markeringar, anteckningar, stämplar och frihandsritning. Befintlig text kan
      redigeras ett textobjekt i taget när det inbäddade typsnittet har tecknen som behövs.
  - title: Formulär och signaturer
    description: >-
      Fyll i och platta till formulär. Lägg till och kontrollera digitala signaturer (CMS/SHA-256). Visuella
      signaturer finns också och är tydligt märkta som icke-kryptografiska.
  - title: Skydda på riktigt
    description: >-
      Kryptera med AES-256. Verklig maskering tar bort text, bilder, grafik, anteckningar, metadata och tidigare
      versioner i stället för att täcka över dem, och Sanera rensar bort dold information.
  - title: Konvertera, OCR och utskrift
    description: >-
      Bilder och text till PDF, och Office till PDF när Microsoft Office är installerat. OCR offline använder Windows
      OCR. Skriv ut med förhandsvisning, dubbelsidigt, flera sidor per ark och gråskala.
milestones:
  - title: Läsning, sökning och navigering
    note: Flikar, miniatyrer, zoom, fritextsökning, bokmärken och bilagor.
  - title: Sidhantering
    note: Ändra ordning, rotera, infoga, extrahera, dela, sammanfoga, beskära, sidnumrering, Bates-numrering och vattenstämpel.
  - title: Redigering, kommentarer och formulär
    note: Objekt, anteckningar med utseendeströmmar, redigering av enskilda textobjekt och ifyllning av formulär.
  - title: Signaturer, skydd och maskering
    note: Digitala signaturer med kontroll, AES-256-kryptering, verklig maskering och sanering.
  - title: Konvertering, OCR, utskrift och installationsprogram
    note: OCR offline, utskrift med förhandsvisning, kraschåterställning, ett installationsprogram per användare och en portabel version.
  - title: Automatisk verifiering
    note: 107 automatiska tester går igenom och kontrollerar sparade filer med en oberoende PDF-tolkare.
  - title: Tester utöver en enda dator
    note: Fysiska skrivare, skalning på 125–250 %, flera skärmar, högkontrast, Skärmläsaren och pekskärm.
  - title: Offentlig lansering
    note: Först när punkterna nedan är lösta och med ägarens godkännande. Inget datum är satt.
milestonesSource: PDF Studios funktionsöversikt, status och lanseringschecklista (version 0.9.0, november 2026)
beforeRelease:
  - Kodsignering, så att Windows inte visar en varning från SmartScreen.
  - Ett slutgiltigt produktnamn och en licens för projektet.
  - Manuella tester på mer hårdvara, fler skalningsnivåer och med hjälpmedelsteknik.
  - Engelska översättningar av de dialogrutor som fortfarande bara finns på svenska.
  - En vald distributionskanal.
requirements:
  - label: Operativsystem
    value: Windows 10 version 2004 (build 19041) eller senare. Windows 11 rekommenderas.
  - label: Arkitektur
    value: Endast x64. ARM64 byggs och testas inte.
  - label: Körmiljö
    value: Inget att installera — .NET 10 och Windows App SDK ingår.
  - label: Installation
    value: Per användare, utan administratörsrättigheter. Installationsprogrammet är cirka 140 MB och den portabla versionen cirka 100 MB.
  - label: Valfritt
    value: Microsoft Office för Office → PDF. Windows OCR-språkpaket för OCR på fler språk.
  - label: Nätverk
    value: Behövs inte. PDF Studio gör inga nätverksanrop.
aboutImage:
  alt: >-
    Dialogrutan Om PDF Studio i mörkt tema: PDF Studios egen ikon, namn och version, följt av Taren-symbolen,
    ”En Taren-app” och en länk till taren.se.
  caption: Om PDF Studio — PDF Studios egen identitet och därefter Taren som avsändare (svenskt gränssnitt, 0.9.0).
---

PDF Studio är ett Windows-program för både vardagligt och avancerat arbete med PDF-filer. Det är byggt med **WinUI 3
och .NET 10** och följer Windows 11:s Fluent-design, med Mica samt ljust, mörkt och högkontrastigt tema.

Dokumenten öppnas i flikar, och kommandosökningen med **Ctrl+K** hittar alla verktyg. Varje ändring går att ångra tills
du sparar, och sparandet sker atomärt, så ett misslyckat sparande skadar aldrig originalfilen.

Ändra ordning på, rotera, infoga, extrahera, dela och sammanfoga sidor. Lägg till text, former, bilder, markeringar,
anteckningar, stämplar och frihandskommentarer, och fyll i formulär. Gör skannade sidor sökbara med OCR offline.
Kryptera filer med AES-256 och ta bort känsligt innehåll permanent med **verklig maskering**, som raderar innehållet i
stället för att täcka över det. PDF Studio kan också lägga till och kontrollera digitala signaturer.

Allt körs lokalt. PDF Studio gör inga nätverksanrop och samlar inte in någon telemetri, och loggarna innehåller aldrig
dokumentinnehåll eller filnamn.

PDF Studio är under utveckling. Version 0.9.0 är en förhandsversion som inte har släppts, och uppgifterna på den här
sidan kan ändras.
