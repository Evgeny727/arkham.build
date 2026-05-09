import {
  ErrataSchema,
  FaqSchema,
  GrimoireResponseSchema,
} from "@arkham-build/shared";
import { Hono } from "hono";
import {
  getAllErrata,
  getAllFaq,
  getAllGlossary,
  getErrataForCard,
  getFaqForCard,
} from "../db/queries/grimoire.ts";
import type { HonoEnv } from "../lib/hono-env.ts";

const router = new Hono<HonoEnv>();

router.get("/faq/card/:code", async (c) => {
  const data = await getFaqForCard(c.get("db"), c.req.param("code"));
  const faqs = data.map((entry) => FaqSchema.parse(entry));
  c.header("Cache-Control", "public, max-age=86400");
  return c.json(faqs);
});

router.get("/errata/card/:code", async (c) => {
  const data = await getErrataForCard(c.get("db"), c.req.param("code"));
  const errata = data.map((entry) => ErrataSchema.parse(entry));
  c.header("Cache-Control", "public, max-age=86400");
  return c.json(errata);
});

export default router;

router.get("/grimoire", async (c) => {
  const [errata, faq, glossary] = await Promise.all([
    getAllErrata(c.get("db")),
    getAllFaq(c.get("db")),
    getAllGlossary(c.get("db")),
  ]);

  const data = GrimoireResponseSchema.parse({
    errata,
    faq,
    glossary,
  });

  c.header("Cache-Control", "public, max-age=86400");
  return c.json(data);
});
