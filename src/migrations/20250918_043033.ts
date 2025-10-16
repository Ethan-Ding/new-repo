import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_surface_types_category" AS ENUM('wall', 'ceiling', 'door', 'linear');
  CREATE TYPE "public"."enum_paint_qualities_level" AS ENUM('basic', 'standard', 'premium', 'luxury');
  CREATE TABLE "paintcolor" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"paint_color" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "paint_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "surface_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_surface_types_category" NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "paint_qualities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"level" "enum_paint_qualities_level" NOT NULL,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "surface_conditions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"prep_time_wall" numeric NOT NULL,
  	"prep_time_ceiling" numeric NOT NULL,
  	"prep_time_door" numeric NOT NULL,
  	"prep_time_linear" numeric NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "paint_data" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"paint_type_id" integer NOT NULL,
  	"surface_type_id" integer NOT NULL,
  	"paint_quality_id" integer NOT NULL,
  	"cost_per_m2" numeric NOT NULL,
  	"coverage" numeric NOT NULL,
  	"notes" varchar,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "labor_rates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"region" varchar,
  	"hourly_rate" numeric NOT NULL,
  	"overhead_rate" numeric NOT NULL,
  	"profit_margin" numeric NOT NULL,
  	"total_rate" numeric,
  	"effective_date" timestamp(3) with time zone NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paintcolor_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paint_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "surface_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paint_qualities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "surface_conditions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "paint_data_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "labor_rates_id" integer;
  ALTER TABLE "paint_data" ADD CONSTRAINT "paint_data_paint_type_id_paint_types_id_fk" FOREIGN KEY ("paint_type_id") REFERENCES "public"."paint_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paint_data" ADD CONSTRAINT "paint_data_surface_type_id_surface_types_id_fk" FOREIGN KEY ("surface_type_id") REFERENCES "public"."surface_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paint_data" ADD CONSTRAINT "paint_data_paint_quality_id_paint_qualities_id_fk" FOREIGN KEY ("paint_quality_id") REFERENCES "public"."paint_qualities"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "paintcolor_updated_at_idx" ON "paintcolor" USING btree ("updated_at");
  CREATE INDEX "paintcolor_created_at_idx" ON "paintcolor" USING btree ("created_at");
  CREATE INDEX "paint_types_updated_at_idx" ON "paint_types" USING btree ("updated_at");
  CREATE INDEX "paint_types_created_at_idx" ON "paint_types" USING btree ("created_at");
  CREATE INDEX "surface_types_updated_at_idx" ON "surface_types" USING btree ("updated_at");
  CREATE INDEX "surface_types_created_at_idx" ON "surface_types" USING btree ("created_at");
  CREATE INDEX "paint_qualities_updated_at_idx" ON "paint_qualities" USING btree ("updated_at");
  CREATE INDEX "paint_qualities_created_at_idx" ON "paint_qualities" USING btree ("created_at");
  CREATE INDEX "surface_conditions_updated_at_idx" ON "surface_conditions" USING btree ("updated_at");
  CREATE INDEX "surface_conditions_created_at_idx" ON "surface_conditions" USING btree ("created_at");
  CREATE INDEX "paint_data_paint_type_idx" ON "paint_data" USING btree ("paint_type_id");
  CREATE INDEX "paint_data_surface_type_idx" ON "paint_data" USING btree ("surface_type_id");
  CREATE INDEX "paint_data_paint_quality_idx" ON "paint_data" USING btree ("paint_quality_id");
  CREATE INDEX "paint_data_updated_at_idx" ON "paint_data" USING btree ("updated_at");
  CREATE INDEX "paint_data_created_at_idx" ON "paint_data" USING btree ("created_at");
  CREATE UNIQUE INDEX "paintType_surfaceType_paintQuality_idx" ON "paint_data" USING btree ("paint_type_id","surface_type_id","paint_quality_id");
  CREATE INDEX "labor_rates_updated_at_idx" ON "labor_rates" USING btree ("updated_at");
  CREATE INDEX "labor_rates_created_at_idx" ON "labor_rates" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paintcolor_fk" FOREIGN KEY ("paintcolor_id") REFERENCES "public"."paintcolor"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paint_types_fk" FOREIGN KEY ("paint_types_id") REFERENCES "public"."paint_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_surface_types_fk" FOREIGN KEY ("surface_types_id") REFERENCES "public"."surface_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paint_qualities_fk" FOREIGN KEY ("paint_qualities_id") REFERENCES "public"."paint_qualities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_surface_conditions_fk" FOREIGN KEY ("surface_conditions_id") REFERENCES "public"."surface_conditions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paint_data_fk" FOREIGN KEY ("paint_data_id") REFERENCES "public"."paint_data"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_labor_rates_fk" FOREIGN KEY ("labor_rates_id") REFERENCES "public"."labor_rates"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_paintcolor_id_idx" ON "payload_locked_documents_rels" USING btree ("paintcolor_id");
  CREATE INDEX "payload_locked_documents_rels_paint_types_id_idx" ON "payload_locked_documents_rels" USING btree ("paint_types_id");
  CREATE INDEX "payload_locked_documents_rels_surface_types_id_idx" ON "payload_locked_documents_rels" USING btree ("surface_types_id");
  CREATE INDEX "payload_locked_documents_rels_paint_qualities_id_idx" ON "payload_locked_documents_rels" USING btree ("paint_qualities_id");
  CREATE INDEX "payload_locked_documents_rels_surface_conditions_id_idx" ON "payload_locked_documents_rels" USING btree ("surface_conditions_id");
  CREATE INDEX "payload_locked_documents_rels_paint_data_id_idx" ON "payload_locked_documents_rels" USING btree ("paint_data_id");
  CREATE INDEX "payload_locked_documents_rels_labor_rates_id_idx" ON "payload_locked_documents_rels" USING btree ("labor_rates_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "paintcolor" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paint_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surface_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paint_qualities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "surface_conditions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "paint_data" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "labor_rates" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "paintcolor" CASCADE;
  DROP TABLE "paint_types" CASCADE;
  DROP TABLE "surface_types" CASCADE;
  DROP TABLE "paint_qualities" CASCADE;
  DROP TABLE "surface_conditions" CASCADE;
  DROP TABLE "paint_data" CASCADE;
  DROP TABLE "labor_rates" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paintcolor_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paint_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_surface_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paint_qualities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_surface_conditions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_paint_data_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_labor_rates_fk";
  
  DROP INDEX "payload_locked_documents_rels_paintcolor_id_idx";
  DROP INDEX "payload_locked_documents_rels_paint_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_surface_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_paint_qualities_id_idx";
  DROP INDEX "payload_locked_documents_rels_surface_conditions_id_idx";
  DROP INDEX "payload_locked_documents_rels_paint_data_id_idx";
  DROP INDEX "payload_locked_documents_rels_labor_rates_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paintcolor_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paint_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "surface_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paint_qualities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "surface_conditions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "paint_data_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "labor_rates_id";
  DROP TYPE "public"."enum_surface_types_category";
  DROP TYPE "public"."enum_paint_qualities_level";`)
}
