---
# Swedish text for src/content/products/lumen-capture.md. Only translatable fields; lists must match the source
# item by item (validated at build time, src/lib/product-i18n.ts). Product and brand names are never translated.
slug: lumen-capture
locale: sv
tagline: Spela in allt. Redigera direkt. Sänd live.
description: >-
  En skärminspelare för Windows med inbyggd redigerare, livesändning och AI som körs på din egen dator. En liten app,
  inga konton.
statusNote: >-
  Öppen beta 2.9.0-beta.2 för Windows, släppt 20 november 2026. Installationsprogrammet är ännu inte kodsignerat,
  så Windows SmartScreen kan visa en varning.
iconAlt: Lumen Captures appikon — en vit ring med en röd inspelningsprick på en blåviolett kvadrat med rundade hörn.
heroImageAlt: >-
  Lumen Captures inspelningssida i mörkt tema: källorna Full screen, Window och Region, en liveförhandsvisning,
  inställningar för bildfrekvens och kvalitet samt knapparna Start recording, Screenshot och Go live.
screenshotsNote: >-
  Riktiga skärmbilder av Lumen Capture — version 2.8 (inspelning, inställningar, Om) och version 2.5 (redigerare,
  export, live). De är renderade under Wine på Linux, så typsnittet skiljer sig från Windows Segoe UI. Appens
  gränssnitt visas på engelska.
facts:
  - label: Typ
    value: Skärminspelare och redigerare
  - label: Körs på
    value: Windows 10 (2004+) och 11, x64
  - label: Konto
    value: Inget konto behövs
  - label: Språk
    value: Sex språk i gränssnittet
  - label: AI på enheten
    value: Textning och brusreducering
  - label: Byggd med
    value: C++ · Direct3D 11
  - label: Grafik
    value: Grafikkort med DirectX 11
  - label: Version
    value: 2.9.0-beta.2 · öppen beta
stepsEyebrow: Så fungerar det
stepsTitle: Spela in, redigera, dela — i en och samma app
steps:
  - title: Spela in det du behöver
    description: >-
      Hela skärmen, ett fönster eller ett område, med systemljud, mikrofon och kamera. Det du ser i
      förhandsvisningen är det som spelas in.
    alt: Inspelningssidan med val av källa, en liveförhandsvisning och inställningar för inspelningen.
  - title: Redigera på en tidslinje
    description: >-
      Klipp, zooma, lägg till anteckningar och bild-i-bild på en och samma tidslinje. Redigeringarna ändrar aldrig
      originalet, och Ctrl+Z ångrar allt.
    alt: Den inbyggda redigeraren med videoförhandsvisning, en inspektörspanel och en tidslinje med flera spår (version 2.5).
  - title: Exportera eller sänd live
    description: >-
      Exportera MP4, GIF eller ljud — redigeringar som bara består av klipp kopieras utan omkodning — eller sänd till
      Twitch, YouTube eller Kick via krypterad RTMPS.
    alt: Redigerarens exportflik med alternativen MP4, Fast, GIF och Sound (version 2.5).
gallery:
  - alt: Inspelningssidan i mörkt tema (version 2.8).
    caption: Inspelningssidan, mörkt tema · 2.8
  - alt: Inspelningssidan i ljust tema (version 2.8).
    caption: Inspelningssidan, ljust tema · 2.8
  - alt: Den inbyggda redigeraren med förhandsvisning, inspektör och tidslinje (version 2.5).
    caption: Den inbyggda redigeraren · 2.5
  - alt: Exportalternativ i redigeraren, bland annat snabb export utan omkodning (version 2.5).
    caption: Export, inklusive snabb export · 2.5
  - alt: Inställningar för kameralayout med scener för skärm och kamera samt bakgrundsoskärpa (version 2.5).
    caption: Kameralayouter och bakgrundsoskärpa · 2.5
  - alt: Inställningar för livesändning med Twitch, YouTube, Kick och egna servrar (version 2.5).
    caption: Livesändning · 2.5
  - alt: Inställningar för tema, språk, nedräkning och omedelbar repris (version 2.8).
    caption: Inställningar · 2.8
  - alt: Om och hjälp, med ”A Taren App”, Taren-symbolen och en länk till taren.se (version 2.8).
    caption: Om och hjälp — ”A Taren App” · 2.8
features:
  - title: Skärm, fönster eller område
    description: >-
      Spela in valfri skärm, ett enskilt fönster (även när det är skymt) eller ett område, med systemljud,
      mikrofoner och kamera. H.264 eller HEVC, hårdvarukodat där grafikkortet stöder det.
  - title: En riktig redigerare, inbyggd
    description: >-
      Klipp, zoomningar, anteckningar, bild-i-bild, hastighet per klipp och borttagning av tystnad — allt utan att
      originalet ändras, och allt går att ångra.
  - title: Sänd live utan extra program
    description: >-
      En egen krypterad RTMPS-klient med scener som du kan byta mellan under sändningen, namnskylt och
      bakgrundsoskärpa. Du kan spara en lokal inspelning samtidigt som du sänder.
  - title: AI på din egen dator
    description: >-
      Textning med Whisper och brusreducering för mikrofonen med RNNoise körs lokalt. Efter en engångsnedladdning av
      modellen lämnar ljudet aldrig datorn.
  - title: Snabb och flexibel export
    description: >-
      MP4, GIF, M4A eller WAV. Redigeringar som bara består av klipp kopieras utan omkodning, så de exporteras på
      några sekunder utan kvalitetsförlust.
  - title: Gjord för alla
    description: >-
      Sex språk, ljust och mörkt tema, stöd för skärmläsare, högkontrastläge och fullständig tangentbordsnavigering.
milestones:
  - title: Nytt gränssnitt, teman och bibliotek
    note: Version 0.2.
  - title: Inspelningsmotor 2
    note: Fönsterinspelning, HDR, roterade skärmar, omedelbar repris, webbkamera och ljud per app (0.3).
  - title: Inbyggd redigerare
    note: Trimning, klipp, zoom, GIF-export och kapitelmarkörer (0.4).
  - title: Livesändning och scener
    note: RTMP-sändning, kameralayouter, schemalagd inspelning och anteckningar under sändning (0.5).
  - title: AI-textning, tillägg och installationsprogram
    note: Lokal textning med Whisper, brusreducering, ett API för tillägg och ett installationsprogram (1.0).
  - title: Version 1.1 till 2.8
    note: Tillgänglighet, överlägg, snabb export, sex språk, storleksändring samt Om och hjälp med en utskrivbar manual.
  - title: Offentlig lansering
    note: Den öppna betan 2.9.0-beta.2 är släppt (november 2026). En slutlig version kräver fortfarande ett kodsignerat installationsprogram.
milestonesSource: Lumen Captures README, färdplan och ändringslogg (version 2.8.0, november 2026)
---

Lumen Capture är en skärminspelare för Windows, skriven i C++ med Win32, Direct2D, DXGI, Media Foundation och WASAPI.
Den spelar in skärmen, ett fönster eller ett område med ljud, mikrofon och kamera — och låter dig sedan **redigera
videon direkt** och dela den eller sända den live.

Allt körs på din egen dator. Det finns inga konton, och ingenting laddas upp om du inte själv väljer att sända. Även
AI-funktionerna — textning och brusreducering för mikrofonen — körs lokalt.

Inspelningen använder DXGI Desktop Duplication på grafikkortet och Media Foundations hårdvarukodare, så den belastar
datorn lite medan du arbetar. Den inbyggda redigeraren ändrar aldrig originalinspelningen.

Lumen Capture finns som öppen beta (version 2.9.0-beta.2). Skärmbilderna visar version 2.8 och 2.5; uppgifterna kan
ändras före den slutliga versionen.
