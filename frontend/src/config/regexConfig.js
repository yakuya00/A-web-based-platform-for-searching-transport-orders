/**
 * Globální validační konstanty pro vstupy uživatelů.
 * Tyto regulární výrazy zajišťují konzistenci dat mezi frontendem a backendem.
 * @module config/regexConfig
 */

/**
 * Regulární výraz pro validaci bezpečného hesla.
 * Splňuje následující kritéria:
 * - Minimálně 8 znaků dlouhé
 * - Alespoň jedno malé písmeno [a-z]
 * - Alespoň jedno velké písmeno [A-Z]
 * - Alespoň jedna číslice [\d]
 * - Alespoň jeden speciální znak [@$!%*?&]
 * @constant {RegExp}
 */
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Regulární výraz pro validaci mezinárodního formátu telefonního čísla.
 * Splňuje následující kritéria:
 * - Volitelné znaménko plus (+) na začátku
 * - Pouze číslice [0-9]
 * - Celková délka 7 až 15 znaků (v souladu se standardem E.164)
 * @constant {RegExp}
 */
export const mobileRegex = /^\+?[0-9]{7,15}$/;
