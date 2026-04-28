export const COMPANY_ROLES = {
  CARRIER: 1,
  SHIPPER: 2,
  WAREHOUSE: 3,
};

export const USER_ROLES = {
  ADMIN: 1,
  // DISPATCHER: 2,
  DRIVER: 2,
  MANAGER: 3,
};

// 2. МАТРИЦА ПРАВ (Что кому можно делать)
// Если добавится новая роль, ты впишешь ее ТОЛЬКО сюда!
export const PERMISSIONS = {
  // Права компаний
  CAN_ADD_FREIGHT: [COMPANY_ROLES.SHIPPER, COMPANY_ROLES.WAREHOUSE],
  CAN_ADD_VEHICLE: [
    COMPANY_ROLES.CARRIER,
    COMPANY_ROLES.WAREHOUSE,
    COMPANY_ROLES.SHIPPER,
  ],

  // Права сотрудников внутри компании
  CAN_MANAGE_COMPANY: [USER_ROLES.ADMIN],
  CAN_SEE_FINANCES: [USER_ROLES.ADMIN],

  ACCESS_WEB_DASHBOARD: [USER_ROLES.ADMIN, USER_ROLES.MANAGER],
  ACCESS_DRIVER_APP: [USER_ROLES.DRIVER],
};
