/**
 * Lost Signal - Scenes Data
 * "Den dag Taren ringde tillbaka"
 */

export const scenes = {
    "pier": {
        "id": "pier",
        "name": {
            "en": "The Old Pier",
            "sv": "Den Gamla Piren"
        },
        "background": "assets/images/scenes/scene-01-old-pier.webp",
        "description": {
            "en": "The air smells of salt and ancient bureaucracy.",
            "sv": "Luften doftar av salt och uråldrig byråkrati."
        },
        "hotspots": [
            {
                "id": "old_sign",
                "name": { "en": "Old Sign", "sv": "Gammal Skylt" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 41.13, "y": 37.89 }, { "x": 41.35, "y": 45.31 }, { "x": 42.88, "y": 45.31 }, { "x": 42.88, "y": 37.89 }
                ],
                "look": {
                    "en": "The sign says: 'TAREN SIGNAL STATION. OPEN WHEN NEEDED. NEED DETERMINED BY THE STATION.' It seems quite firm about it.",
                    "sv": "Skylten har överlevt regn, salt och flera tveksamma beslut."
                }
            },
            {
                "id": "toolbox",
                "name": { "en": "Toolbox", "sv": "Verktygslåda" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 63.44, "y": 67.45 }, { "x": 60.9, "y": 76.17 }, { "x": 60.9, "y": 84.38 }, { "x": 72.89, "y": 90.63 }, { "x": 77.69, "y": 88.02 }, { "x": 77.69, "y": 78.65 }, { "x": 75.65, "y": 71.09 }
                ],
                "look": {
                    "en": "An abandoned toolbox. It looks like it retired years ago.",
                    "sv": "Verktygslådan verkar ha legat här länge nog för att utveckla egna åsikter."
                },
                "interact": {
                    "action": "pickup",
                    "itemId": "rusty_fuse",
                    "success": {
                        "en": "You found a Rusty Fuse. It looks surprisingly judgmental.",
                        "sv": "Du hittade en rostig säkring. Den ser förvånansvärt dömande ut."
                    },
                    "condition": "not_has_fuse"
                }
            },
            {
                "id": "loose_plank",
                "name": { "en": "Loose Plank", "sv": "Lös Planka" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 44.48, "y": 71.22 }, { "x": 19.48, "y": 90.49 }, { "x": 19.4, "y": 93.1 }, { "x": 28.78, "y": 95.83 }, { "x": 51.09, "y": 73.05 }
                ],
                "look": {
                    "en": "A plank that has decided to stop being part of the pier's collective identity.",
                    "sv": "Plankan sitter löst, men på ett sätt som antyder att den väntat på rätt sorts nyfikenhet."
                },
                "interact": {
                    "action": "pickup",
                    "itemId": "rag",
                    "success": {
                        "en": "Under the plank you find an old rag. It is remarkably good at being a piece of cloth.",
                        "sv": "Under plankan hittar du en gammal trasa. Den är anmärkningsvärt bra på att vara just en bit tyg."
                    },
                    "condition": "not_has_rag"
                }
            },
            {
                "id": "dark_water",
                "name": { "en": "Dark Water", "sv": "Mörkt Vatten" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 9.01, "y": 82.29 }, { "x": 8.07, "y": 80.99 }, { "x": 7.78, "y": 63.67 }, { "x": 3.63, "y": 63.28 }, { "x": 0.65, "y": 64.45 }, { "x": 0.07, "y": 58.07 }, { "x": 6.61, "y": 57.16 }, { "x": 12.06, "y": 57.94 }, { "x": 16.28, "y": 57.68 }, { "x": 18.1, "y": 55.34 }, { "x": 22.46, "y": 55.34 }, { "x": 22.6, "y": 67.45 }, { "x": 25.51, "y": 70.44 }, { "x": 29.58, "y": 75.65 }, { "x": 29.65, "y": 78.13 }, { "x": 25.94, "y": 79.17 }, { "x": 17.15, "y": 80.47 }
                ],
                "look": {
                    "en": "The water moves slowly under the pier. For a moment, it looks like it is trying to remember your face.",
                    "sv": "Vattnet rör sig långsamt under bryggan. För ett ögonblick ser det ut som om det försöker minnas ditt ansikte."
                }
            },
            {
                "id": "station_door",
                "name": { "en": "Signal Station", "sv": "Signalstation" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 49.35, "y": 36.2 }, { "x": 49.2, "y": 55.08 }, { "x": 53.27, "y": 54.69 }, { "x": 53.42, "y": 36.33 }
                ],
                "look": {
                    "en": "The station stands there, waiting for a reason to exist.",
                    "sv": "Stationen står där och väntar på en anledning att finnas till."
                },
                "interact": {
                    "action": "transition",
                    "target": "exterior"
                }
            },
            {
                "id": "station_bell",
                "name": { "en": "Station Bell", "sv": "Ringklocka" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 69.04, "y": 13.02 }, { "x": 68.53, "y": 17.84 }, { "x": 67.37, "y": 20.96 }, { "x": 70.2, "y": 22.14 }, { "x": 70.57, "y": 36.72 }, { "x": 71, "y": 21.74 }, { "x": 74.2, "y": 20.83 }, { "x": 72.24, "y": 12.5 }, { "x": 70.71, "y": 11.59 }
                ],
                "look": {
                    "en": "A heavy iron bell. It looks like it would make a very final sort of sound.",
                    "sv": "Klockan har tre instruktioner: ring en gång för besök, två gånger för ursäkt, och aldrig tre gånger. Det känns oroväckande specifikt."
                }
            },
            {
                "id": "hanging_cable",
                "name": { "en": "Hanging Cable", "sv": "Hängande Kabel" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 64.32, "y": 0.52 }, { "x": 64.32, "y": 8.07 }, { "x": 64.53, "y": 13.41 }, { "x": 64.39, "y": 20.44 }, { "x": 63.95, "y": 26.95 }, { "x": 63.81, "y": 31.12 }, { "x": 64.32, "y": 37.24 }, { "x": 64.97, "y": 43.49 }
                ],
                "look": {
                    "en": "A cable swaying in the wind. It's whispering secrets to the salt air.",
                    "sv": "Kabeln hänger slappt från väggen. Den ser ut som om den sagt upp sig men fortfarande väntar på bekräftelse."
                }
            },
            {
                "id": "station_window",
                "name": { "en": "Station Window", "sv": "Stationsfönster" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 55.16, "y": 37.24 }, { "x": 54.87, "y": 43.36 }, { "x": 56.9, "y": 43.36 }, { "x": 56.98, "y": 37.24 }
                ],
                "look": {
                    "en": "The glass is dark and thick. It's hard to tell if someone is looking out, or if the room is just very good at hiding.",
                    "sv": "Ett svagt ljus vilar bakom glaset. Stationen sover kanske inte helt."
                }
            },
            {
                "id": "fuse_box",
                "name": { "en": "Fuse Box", "sv": "Säkringsbox" },
                "shape": "polygon",
                "pointsPercent": [
                    { "x": 83.43, "y": 44.14 }, { "x": 83.5, "y": 65.49 }, { "x": 90.41, "y": 68.1 }, { "x": 90.7, "y": 44.53 }
                ],
                "look": {
                    "en": "A fuse box on the wall. It seems to be for the external station lights.",
                    "sv": "Säkringsboxen saknar något. Den försöker se oberörd ut, men lyckas dåligt."
                }
            }
        ]
    },
    "exterior": {
        "id": "exterior",
        "name": {
            "en": "Station Exterior",
            "sv": "Stationens Utsida"
        },
        "background": "assets/images/scenes/scene-02-station-exterior.webp",
        "description": {
            "en": "The station looks like it was designed by someone who really liked sharp corners and long waits.",
            "sv": "Stationen ser ut att ha designats av någon som verkligen gillade skarpa hörn och lång väntan."
        },
        "hotspots": [
            {
                "id": "locked_door",
                "x": 40, "y": 40, "w": 20, "h": 50,
                "name": { "en": "Station Door", "sv": "Stationsdörr" },
                "look": {
                    "en": "The door is locked in a way that feels less mechanical and more personal.",
                    "sv": "Dörren är låst på ett sätt som känns mindre mekaniskt och mer personligt."
                },
                "interact": {
                    "action": "use_item",
                    "success": {
                        "en": "The door remains unimpressed.",
                        "sv": "Dörren förblir opåverkad."
                    }
                }
            },
            {
                "id": "fuse_box",
                "x": 70, "y": 50, "w": 10, "h": 15,
                "name": { "en": "Fuse Box", "sv": "Säkringsbox" },
                "look": {
                    "en": "The fuse box looks old, rusty and surprisingly judgmental. It is missing a fuse.",
                    "sv": "Säkringsboxen saknar något. Den försöker se oberörd ut, men lyckas dåligt."
                },
                "interact": {
                    "action": "puzzle",
                    "id": "fuse_puzzle"
                }
            },
            {
                "id": "path_pier",
                "x": 0, "y": 80, "w": 20, "h": 20,
                "name": { "en": "Back to Pier", "sv": "Tillbaka till piren" },
                "interact": {
                    "action": "transition",
                    "target": "pier"
                }
            }
        ]
    },
    "control_room": {
        "id": "control_room",
        "name": {
            "en": "Control Room",
            "sv": "Kontrollrummet"
        },
        "background": "assets/images/scenes/scene-03-control-room.webp",
        "description": {
            "en": "The heart of the station. It beats with the rhythm of clicking relays and forgotten frequencies.",
            "sv": "Stationens hjärta. Det slår i takt med klickande reläer och glömda frekvenser."
        },
        "hotspots": [
            {
                "id": "radio",
                "x": 20, "y": 40, "w": 25, "h": 20,
                "name": { "en": "Radio", "sv": "Radio" },
                "look": {
                    "en": "An old radio receiver. It's currently hissing with static and existential dread.",
                    "sv": "En gammal radiomottagare. Den fräser för tillfället av brus och existentiell ångest."
                },
                "interact": {
                    "action": "dialogue",
                    "text": {
                        "en": "...is... anyone... still... there...?",
                        "sv": "...är... någon... kvar... där...?"
                    }
                }
            },
            {
                "id": "printer",
                "x": 55, "y": 45, "w": 15, "h": 15,
                "name": { "en": "Printer", "sv": "Skrivare" },
                "look": {
                    "en": "A printer that prefers to think before it speaks.",
                    "sv": "En skrivare som föredrar att tänka innan den talar."
                },
                "interact": {
                    "action": "printer_output"
                }
            },
            {
                "id": "blue_button",
                "x": 45, "y": 55, "w": 5, "h": 5,
                "name": { "en": "Blue Button", "sv": "Blå Knapp" },
                "look": {
                    "en": "The button appears to know exactly how interesting it is.",
                    "sv": "Knappen verkar veta exakt hur intressant den är."
                },
                "interact": {
                    "action": "funny_button"
                }
            },
            {
                "id": "map",
                "x": 75, "y": 30, "w": 20, "h": 30,
                "name": { "en": "Map", "sv": "Karta" },
                "look": {
                    "en": "A map of Taren. Most of it is marked as 'UNCERTAIN' or 'DO NOT TOUCH'.",
                    "sv": "En karta över Taren. Det mesta är markerat som 'OSÄKERT' eller 'RÖR EJ'."
                }
            }
        ]
    }
};
