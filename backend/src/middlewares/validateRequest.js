import createError from "http-errors";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    console.log(req.body);
    try {
      schema.parse({
        body: req?.body,
      });

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        // Достаем только путь к полю и сообщение
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join(".").replace("body.", ""), // Убираем 'body.', чтобы осталось просто 'password'
          message: issue.message,
        }));

        // Аккуратный лог в терминал бэкенда (без мусора)
        console.log("❌ Ошибка валидации:", formattedErrors[0].message);

        throw createError(
          400,
          formattedErrors[0].message || "Validation failed",
        );
      } else {
        console.log({ error });
        throw createError(400, error?.message || "Validation failed");
      }
    }
  };
};
