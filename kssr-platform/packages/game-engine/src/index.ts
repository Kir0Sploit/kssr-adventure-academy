/**
 * @kssr/game-engine — Phaser 3 educational endless runner.
 *
 * Content-agnostic: the host injects a `nextChallenge()` provider (wired to
 * @kssr/curriculum) and receives typed callbacks for answers, rewards and
 * completion. Mount it into any DOM element from a React/Next.js client.
 */
import * as Phaser from "phaser";
import { RunnerScene } from "./RunnerScene.js";
import type { RunnerConfig, RunnerHandle } from "./types.js";

export type {
  RunnerConfig,
  RunnerHandle,
  RunnerCallbacks,
  AnswerResult,
  RunSummary,
} from "./types.js";

/**
 * Creates and mounts an endless-runner game into `config.parent`.
 * Returns an imperative handle for lifecycle + live controls.
 */
export function mountRunner(config: RunnerConfig): RunnerHandle {
  const parent = config.parent;
  const width = parent.clientWidth || 360;
  const height = parent.clientHeight || 640;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#0b1020",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width,
      height,
    },
    physics: { default: "arcade" },
    audio: { noAudio: true },
    render: { antialias: true },
  });

  // Add + auto-start the scene WITH config as init data (avoids a dataless
  // auto-start that would crash create()).
  game.scene.add("RunnerScene", RunnerScene, true, config);

  // Keep the canvas sized to its container as it (and the viewport) changes.
  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w > 0 && h > 0) game.scale.resize(w, h);
    });
    ro.observe(parent);
  }

  const sceneOf = (): RunnerScene | undefined =>
    game.scene.getScene("RunnerScene") as RunnerScene | undefined;

  return {
    destroy: () => {
      ro?.disconnect();
      game.destroy(true);
    },
    pause: () => game.scene.pause("RunnerScene"),
    resume: () => game.scene.resume("RunnerScene"),
    setLocale: (locale) => sceneOf()?.setLocaleLive(locale),
    hint: () => sceneOf()?.hintCurrent(),
  };
}

export { RunnerScene };
