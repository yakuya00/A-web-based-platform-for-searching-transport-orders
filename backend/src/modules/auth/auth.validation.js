import z from "zod";
import { mobileRegex, passwordRegex} from "../../config/regexConfig.js";


export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(1).trim(),
        surname: z.string().min(1).trim(),
        birthday: z.iso.date(),
        phone: z.string().regex(mobileRegex),
        email: z.email(),
        password: z.string().regex(passwordRegex),
        company_id: z.number().int(),
        role_id: z.number().int(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().regex(passwordRegex),
    }),
});