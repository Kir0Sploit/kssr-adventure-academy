import * as Phaser from "phaser";
import { PRAISE, ENCOURAGE } from "@kssr/shared";
import type { Challenge, ChallengeOption, Locale, Localized } from "@kssr/shared";
import type { RunnerConfig } from "./types.js";

const LANES = 3;

function label(opt: ChallengeOption, locale: Locale): string {
  const l = opt.label as Localized | string;
  return typeof l === "string" ? l : l[locale];
}
function prompt(c: Challenge, locale: Locale): string {
  return c.prompt[locale];
}
function rand<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

interface GateLane {
  container: Phaser.GameObjects.Container;
  correct: boolean;
  dimmed: boolean;
}

/**
 * Educational endless-runner scene. The player auto-runs at the bottom while
 * "answer gates" approach from the top. The learner switches lanes to run
 * through the lane holding the correct answer. Positive-only: a wrong choice
 * is gently re-presented, never punished.
 */
export class RunnerScene extends Phaser.Scene {
  private cfg!: RunnerConfig;
  private locale: Locale = "en";
  private accent = 0x7c3aed;

  private W = 360;
  private H = 640;
  private laneX: number[] = [];
  private currentLane = 1;
  private playerY = 0;
  private player!: Phaser.GameObjects.Container;
  private playerGlow!: Phaser.GameObjects.Arc;

  private bg!: Phaser.GameObjects.Graphics;
  private roadLines: Phaser.GameObjects.Rectangle[] = [];
  private promptText!: Phaser.GameObjects.Text;
  private hudText!: Phaser.GameObjects.Text;

  private speed = 240;
  private scroll = 0;
  private gatesTotal = 8;
  private cleared = 0;

  private gate: Phaser.GameObjects.Container | null = null;
  private gateLanes: GateLane[] = [];
  private gateY = 0;
  private gateChallenge: Challenge | null = null;
  private gateAttempts = 0;
  private gateHintUsed = false;
  private gateStart = 0;
  private evaluating = false;
  private spawning = false;
  private finished = false;
  private repeatChallenge: Challenge | null = null;

  constructor() {
    super("RunnerScene");
  }

  init(cfg: RunnerConfig): void {
    this.cfg = cfg;
    this.locale = cfg?.locale ?? "en";
    this.gatesTotal = cfg?.gates ?? 8;
    if (cfg?.accent) this.accent = Phaser.Display.Color.HexStringToColor(cfg.accent).color;
    // reset transient state (scene may restart)
    this.speed = 240;
    this.scroll = 0;
    this.cleared = 0;
    this.currentLane = 1;
    this.finished = false;
    this.evaluating = false;
    this.spawning = false;
    this.gate = null;
    this.gateLanes = [];
    this.repeatChallenge = null;
  }

  create(): void {
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.bg = this.add.graphics().setDepth(0);
    this.buildRoadLines();
    this.computeLayout();
    this.drawBackground();
    this.createPlayer();

    this.promptText = this.add
      .text(this.W / 2, 50, "", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: this.W - 36 },
        stroke: "#0b1020",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(25);

    this.hudText = this.add
      .text(14, 14, "", { fontFamily: "system-ui, sans-serif", fontSize: "18px", fontStyle: "bold", color: "#e2e8f0" })
      .setDepth(25);

    this.setupInput();
    this.updateHud();

    if (!this.cfg || typeof this.cfg.nextChallenge !== "function") {
      this.promptText.setText("…");
      return;
    }

    this.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this));

    this.spawnGate();
  }

  private computeLayout(): void {
    this.playerY = this.H - 110;
    for (let i = 0; i < LANES; i++) this.laneX[i] = (this.W / LANES) * (i + 0.5);
  }

  private buildRoadLines(): void {
    // dashed centre lines that scroll downward to convey speed
    this.roadLines.forEach((r) => r.destroy());
    this.roadLines = [];
    for (let i = 1; i < LANES; i++) {
      const x = (this.W / LANES) * i;
      for (let y = -40; y < this.H + 80; y += 70) {
        const r = this.add.rectangle(x, y, 5, 34, 0xffffff, 0.12).setDepth(2);
        this.roadLines.push(r);
      }
    }
  }

  private drawBackground(): void {
    const g = this.bg;
    g.clear();
    // vertical gradient sky -> ground
    g.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x0b1020, 0x0b1020, 1);
    g.fillRect(0, 0, this.W, this.H);
    // lane tint columns
    for (let i = 0; i < LANES; i++) {
      const x = (this.W / LANES) * i;
      g.fillStyle(i % 2 === 0 ? 0x111634 : 0x0e1430, 0.5);
      g.fillRect(x, 0, this.W / LANES, this.H);
    }
    // accent finish strip at player line
    g.fillStyle(this.accent, 0.18).fillRect(0, this.playerY - 8, this.W, 16);
  }

  private createPlayer(): void {
    this.playerGlow = this.add.circle(0, 0, 40, this.accent, 0.25);
    const g = this.add.graphics();
    g.fillStyle(this.accent, 1).fillRoundedRect(-26, -26, 52, 52, 16);
    g.lineStyle(3, 0xffffff, 0.8).strokeRoundedRect(-26, -26, 52, 52, 16);
    const face = this.add.text(0, 0, "🦸", { fontSize: "34px" }).setOrigin(0.5);
    this.player = this.add
      .container(this.laneX[this.currentLane], this.playerY, [this.playerGlow, g, face])
      .setDepth(15);
    this.tweens.add({ targets: this.playerGlow, scale: 1.15, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
  }

  private setupInput(): void {
    const kb = this.input.keyboard;
    if (kb) {
      kb.on("keydown-LEFT", () => this.moveLane(-1));
      kb.on("keydown-RIGHT", () => this.moveLane(1));
      kb.on("keydown-A", () => this.moveLane(-1));
      kb.on("keydown-D", () => this.moveLane(1));
    }
    let downX = 0;
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => (downX = p.x));
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      const dx = p.x - downX;
      if (Math.abs(dx) > 36) this.moveLane(dx > 0 ? 1 : -1);
      else this.moveLane(p.x < this.W / 2 ? -1 : 1);
    });
  }

  private onResize(gameSize: Phaser.Structs.Size): void {
    this.W = gameSize.width;
    this.H = gameSize.height;
    this.computeLayout();
    this.drawBackground();
    this.buildRoadLines();
    this.promptText.setPosition(this.W / 2, 50).setWordWrapWidth(this.W - 36);
    this.player.setPosition(this.laneX[this.currentLane]!, this.playerY);
  }

  private moveLane(dir: number): void {
    if (this.finished) return;
    const next = Phaser.Math.Clamp(this.currentLane + dir, 0, LANES - 1);
    if (next === this.currentLane) return;
    this.currentLane = next;
    this.tweens.add({ targets: this.player, x: this.laneX[this.currentLane]!, duration: 110, ease: "Quad.easeOut" });
  }

  private updateHud(): void {
    this.hudText.setText(`⭐ ${this.cleared}/${this.gatesTotal}`);
  }

  private spawnGate(): void {
    if (this.finished) return;
    this.spawning = false;
    this.evaluating = false;
    this.gateAttempts = 0;
    this.gateHintUsed = false;
    this.gateStart = this.time.now;

    const challenge = this.repeatChallenge ?? this.cfg.nextChallenge();
    this.repeatChallenge = null;
    this.gateChallenge = challenge;
    this.promptText.setText(prompt(challenge, this.locale));

    // shuffle options so the correct lane varies, then pad to LANES
    const opts: ChallengeOption[] = shuffle([...challenge.options]);
    while (opts.length < LANES) opts.push({ id: `pad-${opts.length}`, label: "—", correct: false });
    const chosen = opts.slice(0, LANES);

    this.gate = this.add.container(0, 0).setDepth(10);
    this.gateLanes = [];
    const panelW = this.W / LANES - 16;
    chosen.forEach((opt, i) => {
      const x = this.laneX[i]!;
      const bg = this.add.graphics();
      const color = opt.correct ? 0x16a34a : 0x3b3f5c;
      bg.fillStyle(0x000000, 0.25).fillRoundedRect(-panelW / 2 + 3, -36, panelW, 76, 18);
      bg.fillStyle(color, 0.95).fillRoundedRect(-panelW / 2, -40, panelW, 76, 18);
      bg.lineStyle(3, 0xffffff, 0.4).strokeRoundedRect(-panelW / 2, -40, panelW, 76, 18);
      const txt = this.add
        .text(0, 0, label(opt, this.locale), {
          fontFamily: "system-ui, sans-serif",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#ffffff",
          align: "center",
          wordWrap: { width: panelW - 20 },
        })
        .setOrigin(0.5);
      const lane = this.add.container(x, 0, [bg, txt]);
      this.gate!.add(lane);
      this.gateLanes.push({ container: lane, correct: opt.correct, dimmed: false });
    });

    this.gateY = -80;
    this.gate.setY(this.gateY);
  }

  hintCurrent(): void {
    if (!this.gate || this.evaluating) return;
    const wrong = this.gateLanes.filter((l) => !l.correct && !l.dimmed);
    if (wrong.length <= 1) return;
    const pick = rand(wrong);
    pick.dimmed = true;
    this.tweens.add({ targets: pick.container, alpha: 0.25, duration: 200 });
    this.gateHintUsed = true;
  }

  setLocaleLive(locale: Locale): void {
    this.locale = locale;
    if (this.gateChallenge) this.promptText.setText(prompt(this.gateChallenge, locale));
  }

  override update(_t: number, delta: number): void {
    const d = delta / 1000;
    // scroll the road lines for a sense of motion even between gates
    this.scroll += this.speed * d;
    for (const r of this.roadLines) {
      r.y += this.speed * d;
      if (r.y > this.H + 40) r.y -= this.H + 120;
    }
    if (this.finished || !this.gate || this.spawning) return;
    this.gateY += this.speed * d;
    this.gate.setY(this.gateY);
    if (!this.evaluating && this.gateY >= this.playerY) this.evaluate();
  }

  private evaluate(): void {
    this.evaluating = true;
    const challenge = this.gateChallenge!;
    const laneState = this.gateLanes[this.currentLane];
    const correct = !!laneState && laneState.correct;
    const durationMs = this.time.now - this.gateStart;

    this.cfg.callbacks?.onAnswer?.({ challenge, correct, attempts: this.gateAttempts, hintUsed: this.gateHintUsed, durationMs });

    if (correct) {
      this.floating(rand(PRAISE[this.locale]), "#4ade80");
      this.burst("#4ade80");
      this.cameras.main.flash(180, 34, 197, 94, false);
      this.cfg.callbacks?.onReward?.({ coins: 10, xp: 12, stars: this.gateAttempts === 0 ? 1 : 0 });
      this.cleared++;
      this.speed = Math.min(this.speed + 16, 440);
      this.updateHud();
      this.cfg.callbacks?.onProgress?.({ cleared: this.cleared, total: this.gatesTotal });
      this.clearGate();
      if (this.cleared >= this.gatesTotal) this.finish();
      else this.scheduleNext(380);
    } else {
      this.gateAttempts++;
      this.floating(rand(ENCOURAGE[this.locale]), "#fca5a5");
      this.cameras.main.shake(140, 0.006);
      this.speed = Math.max(this.speed - 8, 200);
      this.repeatChallenge = challenge; // gentle retry, no punishment
      this.clearGate();
      this.scheduleNext(380);
    }
  }

  private clearGate(): void {
    if (this.gate) {
      this.gate.destroy(true);
      this.gate = null;
      this.gateLanes = [];
    }
  }

  private scheduleNext(ms: number): void {
    this.spawning = true;
    this.time.delayedCall(ms, () => this.spawnGate());
  }

  private burst(color: string): void {
    const c = Phaser.Display.Color.HexStringToColor(color).color;
    for (let i = 0; i < 10; i++) {
      const p = this.add.circle(this.player.x, this.playerY, Phaser.Math.Between(3, 6), c, 1).setDepth(28);
      this.tweens.add({
        targets: p,
        x: this.player.x + Phaser.Math.Between(-90, 90),
        y: this.playerY + Phaser.Math.Between(-90, 30),
        alpha: 0,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => p.destroy(),
      });
    }
  }

  private floating(text: string, color: string): void {
    const t = this.add
      .text(this.player.x, this.playerY - 50, text, { fontFamily: "system-ui, sans-serif", fontSize: "28px", fontStyle: "bold", color, stroke: "#0b1020", strokeThickness: 4 })
      .setOrigin(0.5)
      .setDepth(30);
    this.tweens.add({ targets: t, y: this.playerY - 130, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
  }

  private finish(): void {
    this.finished = true;
    this.clearGate();
    const accuracy = this.gatesTotal > 0 ? this.cleared / this.gatesTotal : 0;
    this.promptText.setText(this.locale === "ms" ? "Tahniah! 🎉" : "Well done! 🎉");
    this.cameras.main.flash(300, 124, 58, 237, false);
    this.cfg.callbacks?.onComplete?.({ answered: this.cleared, correct: this.cleared, accuracy });
  }
}
