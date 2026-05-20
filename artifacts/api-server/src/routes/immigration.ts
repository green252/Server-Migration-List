import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, applicationsTable } from "@workspace/db";
import {
  CreateApplicationBody,
  GetApplicationParams,
  DeleteApplicationParams,
  ListApplicationsResponse,
  GetApplicationResponse,
  DeleteApplicationResponse,
  GetStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/immigration/applications", async (req, res): Promise<void> => {
  const applications = await db
    .select()
    .from(applicationsTable)
    .orderBy(applicationsTable.createdAt);

  const parsed = ListApplicationsResponse.parse(
    applications.map((a) => ({
      ...a,
      combatPower: Number(a.combatPower),
      createdAt: a.createdAt.toISOString(),
    }))
  );
  res.json(parsed);
});

router.post("/immigration/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.uid, parsed.data.uid));

  if (existing.length > 0) {
    res.status(409).json({ error: "UID already submitted" });
    return;
  }

  const [application] = await db
    .insert(applicationsTable)
    .values({
      uid: parsed.data.uid,
      nickname: parsed.data.nickname,
      allianceName: parsed.data.allianceName,
      nationality: parsed.data.nationality,
      gender: parsed.data.gender,
      grade: parsed.data.grade,
      towerLevel: parsed.data.towerLevel,
      combatPower: String(parsed.data.combatPower),
      desiredAlliance: parsed.data.desiredAlliance,
    })
    .returning();

  res.status(201).json(
    GetApplicationResponse.parse({
      ...application,
      combatPower: Number(application.combatPower),
      createdAt: application.createdAt.toISOString(),
    })
  );
});

router.get("/immigration/applications/:uid", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [application] = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.uid, params.data.uid));

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(
    GetApplicationResponse.parse({
      ...application,
      combatPower: Number(application.combatPower),
      createdAt: application.createdAt.toISOString(),
    })
  );
});

router.delete("/immigration/applications/:uid", async (req, res): Promise<void> => {
  const params = DeleteApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(applicationsTable)
    .where(eq(applicationsTable.uid, params.data.uid))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(DeleteApplicationResponse.parse({ success: true }));
});

router.get("/immigration/stats", async (_req, res): Promise<void> => {
  const [totalResult] = await db
    .select({ count: count() })
    .from(applicationsTable);

  const gradeRows = await db
    .select({ grade: applicationsTable.grade, count: count() })
    .from(applicationsTable)
    .groupBy(applicationsTable.grade);

  const genderRows = await db
    .select({ gender: applicationsTable.gender, count: count() })
    .from(applicationsTable)
    .groupBy(applicationsTable.gender);

  const byGrade = { normal: 0, intermediate: 0, advanced: 0, special: 0 };
  for (const row of gradeRows) {
    if (row.grade === "normal") byGrade.normal = row.count;
    else if (row.grade === "intermediate") byGrade.intermediate = row.count;
    else if (row.grade === "advanced") byGrade.advanced = row.count;
    else if (row.grade === "special") byGrade.special = row.count;
  }

  const byGender = { male: 0, female: 0 };
  for (const row of genderRows) {
    if (row.gender === "male") byGender.male = row.count;
    else if (row.gender === "female") byGender.female = row.count;
  }

  res.json(
    GetStatsResponse.parse({
      total: totalResult.count,
      byGrade,
      byGender,
    })
  );
});

export default router;
