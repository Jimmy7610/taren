// _schedule_data.ts – Authoritative Paralympics Milano Cortina 2026 schedule
// Source: Official IPC/Olympics.com competition schedule V9 + Parasport Sverige + World Curling Federation
// All times CET (Europe/Stockholm = +01:00 in March 2026)

import type { Event, Participant } from './_shared';

// ── Canonical sports list ──
export const PARALYMPIC_SPORTS = [
    'Alpint',
    'Skidskytte',
    'Längdskidåkning',
    'Paraishockey',
    'Snowboard',
    'Rullstolscurling',
];

// ── Helper ──
function ev(
    id: string, date: string, time: string, status: Event['status'],
    sport: string, discipline: string, venue: string,
    participants: Participant[], isSWE: boolean,
    resultSummary?: string,
): Event {
    const startTime = `${date}T${time}:00+01:00`;
    const nations = [...new Set(participants.map(p => p.nation).filter(Boolean))];
    if (isSWE && !nations.includes('SWE')) nations.push('SWE');
    return {
        id, startTime, endTime: null, status, sport, discipline, venue,
        participants, nations, isSWE,
        resultSummary: resultSummary || null,
        links: [],
    };
}

function athlete(name: string, nation: string): Participant {
    return { name, nation, role: 'athlete', bib: null };
}

// ── Full schedule by day ──
export function getScheduleForDate(date: string): Event[] {
    const schedule: Record<string, Event[]> = {

        // ── Mar 4 (Tue) – Wheelchair curling mixed doubles starts ──
        '2026-03-04': [
            ev('pk-0304-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
            ev('pk-0304-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
        ],

        // ── Mar 5 (Wed) – Curling mixed doubles continues ──
        '2026-03-05': [
            ev('pk-0305-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
            ev('pk-0305-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
        ],

        // ── Mar 6 (Fri) – Opening Ceremony ──
        '2026-03-06': [
            ev('pk-0306-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
            ev('pk-0306-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Mixed Doubles, gruppspel', 'Cortina', [], false),
            ev('pk-0306-open', date, '20:00', 'upcoming', 'Ceremoni', 'Invigningsceremoni', 'Arena di Verona', [], false),
        ],

        // ── Mar 7 (Sat) – First medals! ──
        '2026-03-07': [
            // Alpine – Downhill
            ev('pk-0307-alp1', date, '09:30', 'upcoming', 'Alpint', 'Störtlopp, synnedsättning', 'Tofane, Cortina',
                [athlete('Ebba Årsjö', 'SWE')], true),
            ev('pk-0307-alp2', date, '11:00', 'upcoming', 'Alpint', 'Störtlopp, stående', 'Tofane, Cortina', [], false),
            ev('pk-0307-alp3', date, '12:30', 'upcoming', 'Alpint', 'Störtlopp, sittande', 'Tofane, Cortina', [], false),
            // Biathlon – Sprint
            ev('pk-0307-bth1', date, '10:00', 'upcoming', 'Skidskytte', 'Sprint, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            ev('pk-0307-bth2', date, '11:30', 'upcoming', 'Skidskytte', 'Sprint, stående', 'Tesero', [], false),
            ev('pk-0307-bth3', date, '13:00', 'upcoming', 'Skidskytte', 'Sprint, sittande', 'Tesero', [], false),
            // Snowboard – Cross seeding
            ev('pk-0307-sb1', date, '11:00', 'upcoming', 'Snowboard', 'Snowboardcross, seeding', 'Cortina', [], false),
            // Wheelchair curling – Team round robin
            ev('pk-0307-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel: NOR–SWE', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0307-cur2', date, '18:35', 'upcoming', 'Rullstolscurling', 'Gruppspel: SWE–KOR', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            // Hockey
            ev('pk-0307-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
            ev('pk-0307-hoc2', date, '16:30', 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],

        // ── Mar 8 (Sun) ──
        '2026-03-08': [
            // Alpine – Super-G
            ev('pk-0308-alp1', date, '09:30', 'upcoming', 'Alpint', 'Super-G, synnedsättning', 'Tofane, Cortina',
                [athlete('Ebba Årsjö', 'SWE')], true),
            ev('pk-0308-alp2', date, '11:00', 'upcoming', 'Alpint', 'Super-G, stående', 'Tofane, Cortina', [], false),
            ev('pk-0308-alp3', date, '12:30', 'upcoming', 'Alpint', 'Super-G, sittande', 'Tofane, Cortina', [], false),
            // Biathlon – Pursuit
            ev('pk-0308-bth1', date, '10:00', 'upcoming', 'Skidskytte', 'Jaktstart, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            ev('pk-0308-bth2', date, '11:30', 'upcoming', 'Skidskytte', 'Jaktstart, stående', 'Tesero', [], false),
            ev('pk-0308-bth3', date, '13:00', 'upcoming', 'Skidskytte', 'Jaktstart, sittande', 'Tesero', [], false),
            // Snowboard – Cross finals
            ev('pk-0308-sb1', date, '11:00', 'upcoming', 'Snowboard', 'Snowboardcross, final', 'Cortina', [], false),
            // Curling
            ev('pk-0308-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0308-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], false),
            // Hockey
            ev('pk-0308-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
            ev('pk-0308-hoc2', date, '16:30', 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],

        // ── Mar 9 (Mon) ──
        '2026-03-09': [
            // Alpine – Combined
            ev('pk-0309-alp1', date, '09:00', 'upcoming', 'Alpint', 'Kombination, Super-G', 'Tofane, Cortina', [], false),
            ev('pk-0309-alp2', date, '13:00', 'upcoming', 'Alpint', 'Kombination, Slalom', 'Tofane, Cortina', [], false),
            // Curling
            ev('pk-0309-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0309-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], false),
            // Hockey
            ev('pk-0309-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Gruppspel', 'Milano', [], false),
        ],

        // ── Mar 10 (Tue) ──
        '2026-03-10': [
            // Alpine – Giant Slalom (Women)
            ev('pk-0310-alp1', date, '09:00', 'upcoming', 'Alpint', 'Storslalom, åk 1 (damer)', 'Tofane, Cortina', [], false),
            ev('pk-0310-alp2', date, '12:30', 'upcoming', 'Alpint', 'Storslalom, åk 2 (damer)', 'Tofane, Cortina', [], false),
            // XC Skiing – 10 km
            ev('pk-0310-xc1', date, '09:45', 'upcoming', 'Längdskidåkning', '10 km klassiskt, sittande', 'Tesero',
                [athlete('Arnt-Christian Furuberg', 'SWE')], true),
            ev('pk-0310-xc2', date, '11:30', 'upcoming', 'Längdskidåkning', '10 km klassiskt, stående', 'Tesero',
                [athlete('Ellen Westerlund', 'SWE'), athlete('Alice Morelius', 'SWE')], true),
            ev('pk-0310-xc3', date, '13:30', 'upcoming', 'Längdskidåkning', '10 km klassiskt, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            // Curling
            ev('pk-0310-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0310-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], false),
            // Hockey
            ev('pk-0310-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Kvartsfinal', 'Milano', [], false),
        ],

        // ── Mar 11 (Wed) ──
        '2026-03-11': [
            // Alpine – Giant Slalom (Men)
            ev('pk-0311-alp1', date, '09:00', 'upcoming', 'Alpint', 'Storslalom, åk 1 (herrar)', 'Tofane, Cortina', [], false),
            ev('pk-0311-alp2', date, '12:30', 'upcoming', 'Alpint', 'Storslalom, åk 2 (herrar)', 'Tofane, Cortina', [], false),
            // Biathlon – Middle distance
            ev('pk-0311-bth1', date, '10:00', 'upcoming', 'Skidskytte', 'Medeldistans, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            ev('pk-0311-bth2', date, '11:30', 'upcoming', 'Skidskytte', 'Medeldistans, stående', 'Tesero', [], false),
            ev('pk-0311-bth3', date, '13:00', 'upcoming', 'Skidskytte', 'Medeldistans, sittande', 'Tesero', [], false),
            // XC Skiing – Sprint
            ev('pk-0311-xc1', date, '10:00', 'upcoming', 'Längdskidåkning', 'Sprint, sittande', 'Tesero', [], false),
            ev('pk-0311-xc2', date, '11:00', 'upcoming', 'Längdskidåkning', 'Sprint, stående', 'Tesero',
                [athlete('Ellen Westerlund', 'SWE')], true),
            ev('pk-0311-xc3', date, '12:00', 'upcoming', 'Längdskidåkning', 'Sprint, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            // Curling
            ev('pk-0311-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0311-cur2', date, '18:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], false),
        ],

        // ── Mar 12 (Thu) ──
        '2026-03-12': [
            // Curling – semifinals begin
            ev('pk-0312-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
            ev('pk-0312-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Gruppspel', 'Cortina', [], false),
            // Hockey
            ev('pk-0312-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Semifinal', 'Milano', [], false),
            ev('pk-0312-hoc2', date, '16:30', 'upcoming', 'Paraishockey', 'Semifinal', 'Milano', [], false),
        ],

        // ── Mar 13 (Fri) ──
        '2026-03-13': [
            // Alpine – Slalom (Women)
            ev('pk-0313-alp1', date, '09:00', 'upcoming', 'Alpint', 'Slalom, åk 1 (damer)', 'Tofane, Cortina', [], false),
            ev('pk-0313-alp2', date, '13:00', 'upcoming', 'Alpint', 'Slalom, åk 2 (damer)', 'Tofane, Cortina', [], false),
            // Biathlon – Individual
            ev('pk-0313-bth1', date, '10:00', 'upcoming', 'Skidskytte', 'Individuellt, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            ev('pk-0313-bth2', date, '11:30', 'upcoming', 'Skidskytte', 'Individuellt, stående', 'Tesero', [], false),
            ev('pk-0313-bth3', date, '13:00', 'upcoming', 'Skidskytte', 'Individuellt, sittande', 'Tesero', [], false),
            // Curling
            ev('pk-0313-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Semifinal', 'Cortina',
                [athlete('Ronny Persson', 'SWE')], true),
        ],

        // ── Mar 14 (Sat) ──
        '2026-03-14': [
            // Alpine – Slalom (Men)
            ev('pk-0314-alp1', date, '09:00', 'upcoming', 'Alpint', 'Slalom, åk 1 (herrar)', 'Tofane, Cortina', [], false),
            ev('pk-0314-alp2', date, '12:00', 'upcoming', 'Alpint', 'Slalom, åk 2 (herrar)', 'Tofane, Cortina', [], false),
            // XC Skiing – Relay
            ev('pk-0314-xc1', date, '10:00', 'upcoming', 'Längdskidåkning', '4×2.5 km stafett, mixed', 'Tesero',
                [athlete('Ellen Westerlund', 'SWE'), athlete('Alice Morelius', 'SWE')], true),
            ev('pk-0314-xc2', date, '11:15', 'upcoming', 'Längdskidåkning', '4×2.5 km stafett, öppen', 'Tesero', [], false),
            // Snowboard – Banked Slalom
            ev('pk-0314-sb1', date, '10:00', 'upcoming', 'Snowboard', 'Banked Slalom, åk 1', 'Cortina', [], false),
            ev('pk-0314-sb2', date, '12:00', 'upcoming', 'Snowboard', 'Banked Slalom, åk 2', 'Cortina', [], false),
            ev('pk-0314-sb3', date, '14:00', 'upcoming', 'Snowboard', 'Banked Slalom, åk 3', 'Cortina', [], false),
            // Curling – Finals
            ev('pk-0314-cur1', date, '09:35', 'upcoming', 'Rullstolscurling', 'Bronsmatch', 'Cortina', [], false),
            ev('pk-0314-cur2', date, '14:35', 'upcoming', 'Rullstolscurling', 'Final', 'Cortina', [], false),
            // Hockey
            ev('pk-0314-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Bronsmatch', 'Milano', [], false),
        ],

        // ── Mar 15 (Sun) – Final day ──
        '2026-03-15': [
            // XC Skiing – 20 km
            ev('pk-0315-xc1', date, '09:00', 'upcoming', 'Längdskidåkning', '20 km fritt, sittande', 'Tesero', [], false),
            ev('pk-0315-xc2', date, '10:30', 'upcoming', 'Längdskidåkning', '20 km fritt, stående', 'Tesero',
                [athlete('Ellen Westerlund', 'SWE'), athlete('Alice Morelius', 'SWE')], true),
            ev('pk-0315-xc3', date, '12:30', 'upcoming', 'Längdskidåkning', '20 km fritt, synnedsättning', 'Tesero',
                [athlete('Zebastian Modin', 'SWE')], true),
            // Hockey – Gold medal game
            ev('pk-0315-hoc1', date, '12:00', 'upcoming', 'Paraishockey', 'Guldmatch', 'Milano', [], false),
            // Closing ceremony
            ev('pk-0315-close', date, '18:00', 'upcoming', 'Ceremoni', 'Avslutningsceremoni', 'Cortina Olympic Ice Stadium', [], false),
        ],
    };

    return schedule[date] || [];
}

// Get events for "today" view
export function getTodayEvents(todayDate: string): Event[] {
    const gameStart = '2026-03-04'; // curling starts Mar 4
    const gameEnd = '2026-03-15';

    if (todayDate < gameStart) {
        // Pre-games: show preview of opening day (Mar 7 first medal day)
        return getScheduleForDate('2026-03-07');
    }

    if (todayDate > gameEnd) {
        return []; // Games are over
    }

    return getScheduleForDate(todayDate);
}
