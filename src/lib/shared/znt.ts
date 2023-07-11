import { err, ok, type Result } from "neverthrow";
import type { ParseParams, ZodError, ZodSchema, ZodTypeDef } from "zod";

export type ZodSchemaNeverThrow<
  O,
  D extends ZodTypeDef = ZodTypeDef,
  I = unknown
> = ZodSchema<O, D, I> & {
  parseNt: (
    data: unknown,
    params?: Partial<ParseParams>
  ) => Result<O, ZodError<I>>;
};

export function znt<O, D extends ZodTypeDef, I>(
  schema: ZodSchema<O, D, I>
): ZodSchemaNeverThrow<O, D, I> {
  return new Proxy(schema, {
    get(
      target: ZodSchema<O, D, I>,
      prop: "parseNt" | keyof ZodSchema<O, D, I>
    ) {
      if (prop === "parseNt") {
        return (data: unknown, params?: Partial<ParseParams>) => {
          const validated = target.safeParse(data, params);
          if (validated.success) {
            return ok(validated.data);
          } else {
            return err(validated.error);
          }
        };
      } else {
        return target[prop];
      }
    },
  }) as ZodSchemaNeverThrow<O, D, I>;
}
