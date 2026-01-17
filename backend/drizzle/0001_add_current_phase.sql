-- Add current_phase column to games table
ALTER TABLE "games" ADD COLUMN "current_phase" varchar(20) DEFAULT 'hint' NOT NULL;
