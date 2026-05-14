/**
 * Globální konfigurace rolí a oprávnění (RBAC).
 * Tento soubor slouží jako jediný zdroj pravdy (Single Source of Truth) pro řízení přístupu v aplikaci.
 * @module config/permissions
 */

/**
 * Typy společností registrovaných v systému.
 * Určuje základní byznys logiku (kdo nabízí náklad vs. kdo nabízí dopravu).
 * @enum {number}
 */
export const COMPANY_ROLES = {
  CARRIER: 1, // Dopravce (hledá náklady, vlastní vozidla)
  SHIPPER: 2, // Odesílatel (vytváří objednávky nákladu)
  WAREHOUSE: 3, // Sklad/Logistické centrum (může obojí)
};

/**
 * Uživatelské role v rámci jedné společnosti.
 * Určuje, jaké rozhraní uživatel uvidí.
 * @enum {number}
 */
export const USER_ROLES = {
  ADMIN: 1, // Majitel/Správce firmy (plný přístup)
  DRIVER: 2, // Řidič (přístup pouze k mobilní aplikaci)
  MANAGER: 3, // Dispečer (správa zakázek a vozidel, bez správy uživatelů)
};

/**
 * Matice oprávnění (Permissions Matrix).
 * Definuje, které role (firemní i uživatelské) mají přístup ke konkrétním akcím.
 * Pokud se v budoucnu přidá nová role, upravuje se pouze toto místo.
 */
export const PERMISSIONS = {
  // --- Oprávnění na úrovni typu společnosti ---
  CAN_SEE_FREIGHTS: [COMPANY_ROLES.CARRIER, COMPANY_ROLES.WAREHOUSE],
  CAN_ADD_FREIGHT: [COMPANY_ROLES.SHIPPER, COMPANY_ROLES.WAREHOUSE],
  CAN_ADD_VEHICLE: [COMPANY_ROLES.CARRIER, COMPANY_ROLES.WAREHOUSE],

  // --- Oprávnění na úrovni zaměstnance ---
  CAN_MANAGE_COMPANY: [USER_ROLES.ADMIN],
  ACCESS_WEB_DASHBOARD: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  ACCESS_DRIVER_APP: [USER_ROLES.DRIVER],
};
