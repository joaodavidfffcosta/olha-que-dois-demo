/**
 * Opening-hours logic, always in Europe/Lisbon time.
 *
 * Test cases for openStatus (with the current hours):
 *   Tue 10:00  open     "Aberto agora · fecha às 23h00"
 *   Tue 23:30  closed   "Fechado · abre amanhã às 07h00"
 *   Mon any    pending  "Horário a confirmar"
 *   Sun 06:30  closed   "Fechado · abre hoje às 07h00"
 *   Sun 23:30  closed   "Fechado · segunda a confirmar"
 */

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const lisbonFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Lisbon",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** The current weekday and minutes since midnight in Lisbon. */
export function lisbonClock(date = new Date()) {
  const parts = Object.fromEntries(lisbonFormat.formatToParts(date).map((part) => [part.type, part.value]));
  return { day: WEEKDAYS[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const formatTime = (time) => time.replace(":", "h");

export function openStatus(hours, clock) {
  const today = hours.find((entry) => entry.day === clock.day);

  if (!today.open) return { state: "pending", label: "Horário a confirmar" };

  if (clock.minutes < toMinutes(today.open)) {
    return { state: "closed", label: `Fechado · abre hoje às ${formatTime(today.open)}` };
  }

  if (clock.minutes < toMinutes(today.close)) {
    return { state: "open", label: `Aberto agora · fecha às ${formatTime(today.close)}` };
  }

  const tomorrow = hours.find((entry) => entry.day === (clock.day + 1) % 7);

  if (!tomorrow.open) return { state: "closed", label: `Fechado · ${tomorrow.short} a confirmar` };

  return { state: "closed", label: `Fechado · abre amanhã às ${formatTime(tomorrow.open)}` };
}
