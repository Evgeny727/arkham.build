import {
  CardErrataResponseSchema,
  CardFaqResponseSchema,
} from "@arkham-build/shared";
import { Hono } from "hono";
import { getErrataForCard, getFaqForCard } from "../db/queries/grimoire.ts";
import type { HonoEnv } from "../lib/hono-env.ts";

const router = new Hono<HonoEnv>();

router.get("/faq/card/:code", async (c) => {
  const faq = await getFaqForCard(c.get("db"), c.req.param("code"));
  const data = CardFaqResponseSchema.parse(faq);

  c.header("Cache-Control", "public, max-age=86400");

  return c.json(data);
});

router.get("/errata/card/:code", async (c) => {
  const errata = await getErrataForCard(c.get("db"), c.req.param("code"));
  const data = CardErrataResponseSchema.parse(errata);

  c.header("Cache-Control", "public, max-age=86400");

  return c.json(data);
});

export default router;
