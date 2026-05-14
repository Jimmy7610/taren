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
                "x": 15, "y": 35, "w": 12, "h": 15,
                "name": { "en": "Old Sign", "sv": "Gammal Skylt" },
                "look": {
                    "en": "The sign says: 'TAREN SIGNAL STATION. OPEN WHEN NEEDED. NEED DETERMINED BY THE STATION.' It seems quite firm about it.",
                    "sv": "Skylten lyder: 'TAREN SIGNALSTATION. ÖPPEN VID BEHOV. BEHOV FASTSTÄLLS AV STATIONEN.' Den verkar mena allvar."
                }
            },
            {
                "id": "toolbox",
                "x": 45, "y": 75, "w": 10, "h": 8,
                "name": { "en": "Toolbox", "sv": "Verktygslåda" },
                "look": {
                    "en": "An abandoned toolbox. It looks like it retired years ago.",
                    "sv": "En bortglömd verktygslåda. Den ser ut att ha gått i pension för flera år sedan."
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
                "x": 30, "y": 85, "w": 15, "h": 5,
                "name": { "en": "Loose Plank", "sv": "Lös Planka" },
                "look": {
                    "en": "A plank that has decided to stop being part of the pier's collective identity.",
                    "sv": "En planka som har bestämt sig för att sluta vara en del av pirens kollektiva identitet."
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
                "x": 60, "y": 80, "w": 40, "h": 20,
                "name": { "en": "Dark Water", "sv": "Mörkt Vatten" },
                "look": {
                    "en": "The water moves slowly under the pier. For a moment, it looks like it is trying to remember your face.",
                    "sv": "Vattnet rör sig långsamt under piren. För ett ögonblick ser det ut som om det försöker komma ihåg ditt ansikte."
                }
            },
            {
                "id": "path_station",
                "x": 75, "y": 40, "w": 20, "h": 40,
                "name": { "en": "Signal Station", "sv": "Signalstation" },
                "look": {
                    "en": "The station stands there, waiting for a reason to exist.",
                    "sv": "Stationen står där och väntar på en anledning att finnas till."
                },
                "interact": {
                    "action": "transition",
                    "target": "exterior"
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
                    "sv": "Säkringsboxen ser gammal ut, rostig och förvånansvärt dömande. Det saknas en säkring."
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
