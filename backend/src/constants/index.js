/**
 * ====================================================
 * Global Constants / Application Enums
 * English: Mapping of database IDs and types to readable constants.
 * Czech: Mapování ID z databáze a typů na čitelné konstanty.
 * ====================================================
 */

// Role uživatelů: Odpovídá ID v tabulce 'user_roles'
export const USER_ROLES = {
  ADMIN: 1,
  DRIVER: 2,
  MANAGER: 3,
};

// Typy vozidel: Musí odpovídat ENUMu definovanému v Postgresu
export const VEHICLE_TYPES = {
  TRUCK: "truck",
  TRAILER: "trailer",
};

// Stavy souprav: Odpovídá ID v tabulce 'composition_statuses'
export const COMPOSITION_STATUSES = {
  ACTIVE: 1,
  INACTIVE: 2,
  MAINTENANCE: 3,
};

// Stavy objednávek: Odpovídá ID v tabulce 'order_statuses'
export const ORDER_STATUSES = {
  CREATED: 1,
  ASSIGN: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};
