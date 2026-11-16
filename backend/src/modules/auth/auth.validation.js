/**
 * Validační schémata pro autentizaci a registraci uživatelů/firem.
 * @module modules/auth/auth.validation
 */

import z from "zod";
import { mobileRegex, passwordRegex } from "../../config/regexConfig.js";

/**
 * Schéma pro základní registraci uživatele administrátorem.
 * @const {z.ZodObject}
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1).trim(),
    surname: z.string().min(1).trim(),
    birthday: z.iso.date(),
    phone: z.string().regex(mobileRegex),
    email: z.email(),
    password: z.string().regex(passwordRegex),
    company_id: z.number().int().optional(),
    role_id: z.number().int(),
  }),
});

/**
 * Schéma pro přihlášení uživatele.
 * @const {z.ZodObject}
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

/**
 * Schéma pro kompletní registraci firmy (včetně adres a identifikátorů).
 * @const {z.ZodObject}
 */
export const fullRegisterSchema = z.object({
  body: z.object({
    company_name: z.string().min(1),
    company_role_id: z.number(),
    identifiers: z
      .array(
        z.object({
          identifier_type_id: z.number().int(),
          identifier_value: z.string().min(1),
        }),
      )
      .min(1),
    addresses: z
      .array(
        z.object({
          address_type_id: z.number().int(),
          nominatium_data: z.any(),
        }),
      )
      .min(1),
    name: z.string().min(1).trim(),
    surname: z.string().min(1).trim(),
    email: z.email(),
    password: z
      .string()
      .regex(
        passwordRegex,
        "The password must be at least 8 characters long and contain upper and lower case letters, a number, and a special character (@$!%*?&).",
      ),
    role_id: z.number().int(),
    phone: z.string().regex(mobileRegex),
    birthday: z.iso.date(),
  }),
});
