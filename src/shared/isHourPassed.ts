import { DateTime } from "luxon";

/**
 * Verifica se è passata un'ora tra la data fornita e l'ora attuale.
 * @param dbDate - La data fornita dal database (in formato ISO 8601 o simile).
 * @returns {boolean} - True se è passata almeno un'ora, False altrimenti.
 */
export default function isHourPassed(dbDate: string): boolean {
  try {
    // Parsing della data fornita in Luxon DateTime
    const inputDate = DateTime.fromISO(dbDate, { zone: "utc" });

    if (!inputDate.isValid) {
      throw new Error("La data fornita non è valida.");
    }

    // Ottieni la data attuale in UTC
    const now = DateTime.utc();

    // Calcola la differenza in ore
    const diffInHours = now.diff(inputDate, "hours").hours;

    // Restituisce true se è passata almeno un'ora
    return diffInHours >= 24;
  } catch (error) {
    console.error("Errore nel confronto delle date:", error);
    return false;
  }
}