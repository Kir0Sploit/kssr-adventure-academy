"use client";
/**
 * Game-mode registry. Adding a new mode = implement a component with
 * GameModeProps and register it here. The picker and player are data-driven.
 */
import type { ComponentType } from "react";
import type { Localized } from "@kssr/shared";
import type { GameModeProps } from "./gameUtils";
import QuizGame from "@/components/games/QuizGame";
import BubbleGame from "@/components/games/BubbleGame";
import MemoryGame from "@/components/games/MemoryGame";
import GameCanvas from "@/components/GameCanvas";

export interface GameModeDef {
  id: string;
  name: Localized;
  desc: Localized;
  icon: string;
  color: string;
  Component: ComponentType<GameModeProps>;
}

export const GAME_MODES: GameModeDef[] = [
  {
    id: "quiz",
    name: { en: "Quiz", ms: "Kuiz" },
    desc: { en: "Answer the questions", ms: "Jawab soalan" },
    icon: "❓",
    color: "#3b82f6",
    Component: QuizGame,
  },
  {
    id: "bubble",
    name: { en: "Bubble Pop", ms: "Pop Buih" },
    desc: { en: "Tap the correct bubble", ms: "Ketik buih betul" },
    icon: "🫧",
    color: "#06b6d4",
    Component: BubbleGame,
  },
  {
    id: "memory",
    name: { en: "Memory Match", ms: "Padanan Ingatan" },
    desc: { en: "Match questions to answers", ms: "Padan soalan & jawapan" },
    icon: "🧩",
    color: "#ec4899",
    Component: MemoryGame,
  },
  {
    id: "runner",
    name: { en: "Endless Runner", ms: "Pelari Tanpa Henti" },
    desc: { en: "Run into the answer lane", ms: "Lari ke lorong jawapan" },
    icon: "🏃",
    color: "#8b5cf6",
    Component: GameCanvas,
  },
];

export function getMode(id: string): GameModeDef | undefined {
  return GAME_MODES.find((m) => m.id === id);
}
