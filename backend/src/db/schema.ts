import {
  pgTable,
  varchar,
  serial,
  timestamp,
  json,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Lobbies table
export const lobbies = pgTable('lobbies', {
  id: varchar('id', { length: 6 }).primaryKey(),
  hostId: integer('host_id'),
  wordlistId: integer('wordlist_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: varchar('status', { length: 20 }).default('waiting').notNull(),
});

// Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  lobbyId: varchar('lobby_id', { length: 6 })
    .references(() => lobbies.id)
    .notNull(),
  words: json('words').$type<string[]>().notNull(),
  wordColors: json('word_colors').$type<string[]>().notNull(),
  revealedWords: json('revealed_words').$type<boolean[]>().notNull(),
  currentTurn: varchar('current_turn', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('in_progress').notNull(),
  startingTeam: varchar('starting_team', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Players table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  lobbyId: varchar('lobby_id', { length: 6 })
    .references(() => lobbies.id)
    .notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  team: varchar('team', { length: 10 }),
  role: varchar('role', { length: 20 }),
  socketId: varchar('socket_id', { length: 100 }),
  isHost: boolean('is_host').default(false).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Wordlists table
export const wordlists = pgTable('wordlists', {
  id: serial('id').primaryKey(),
  lobbyId: varchar('lobby_id', { length: 6 }).references(() => lobbies.id),
  words: json('words').$type<string[]>().notNull(),
  uploadedBy: varchar('uploaded_by', { length: 50 }),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// Type inferences for lobbies
export type Lobby = InferSelectModel<typeof lobbies>;
export type NewLobby = InferInsertModel<typeof lobbies>;

// Type inferences for games
export type Game = InferSelectModel<typeof games>;
export type NewGame = InferInsertModel<typeof games>;

// Type inferences for players
export type Player = InferSelectModel<typeof players>;
export type NewPlayer = InferInsertModel<typeof players>;

// Type inferences for wordlists
export type Wordlist = InferSelectModel<typeof wordlists>;
export type NewWordlist = InferInsertModel<typeof wordlists>;
