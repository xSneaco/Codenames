CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobby_id" varchar(6) NOT NULL,
	"words" json NOT NULL,
	"word_colors" json NOT NULL,
	"revealed_words" json NOT NULL,
	"current_turn" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"starting_team" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lobbies" (
	"id" varchar(6) PRIMARY KEY NOT NULL,
	"host_id" integer,
	"wordlist_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'waiting' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobby_id" varchar(6) NOT NULL,
	"name" varchar(50) NOT NULL,
	"team" varchar(10),
	"role" varchar(20),
	"socket_id" varchar(100),
	"is_host" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wordlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"lobby_id" varchar(6),
	"words" json NOT NULL,
	"uploaded_by" varchar(50),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wordlists" ADD CONSTRAINT "wordlists_lobby_id_lobbies_id_fk" FOREIGN KEY ("lobby_id") REFERENCES "public"."lobbies"("id") ON DELETE no action ON UPDATE no action;