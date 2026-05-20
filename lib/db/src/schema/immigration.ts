import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  nickname: text("nickname").notNull(),
  allianceName: text("alliance_name").notNull(),
  nationality: text("nationality").notNull(),
  gender: text("gender").notNull(),
  grade: text("grade").notNull(),
  towerLevel: text("tower_level").notNull(),
  combatPower: numeric("combat_power", { precision: 10, scale: 2 }).notNull(),
  desiredAlliance: text("desired_alliance").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
