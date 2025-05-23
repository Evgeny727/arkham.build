import * as z from "zod/v4-mini";
import { FanMadeProjectSchema } from "../src/store/lib/fan-made-content.schemas";

console.log(
  JSON.stringify(
    z.toJSONSchema(FanMadeProjectSchema, {
      metadata: z.globalRegistry,
    }),
    null,
    2,
  ),
);
