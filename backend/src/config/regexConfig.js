/**
 * ====================================================
 * Validation Regex Patterns
 * English: Rules for password strength and phone format.
 * Czech: Pravidla pro sílu hesla a formát telefonního čísla.
 * ====================================================
 */

// Pravidla pro heslo: min. 8 znaků, aspoň jedno velké písmeno, jedno malé, jedna číslice a jeden speciální znak.
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Formát telefonu: volitelné '+' na začátku a 7 až 15 číslic.
export const mobileRegex = /^\+?[0-9]{7,15}$/;
