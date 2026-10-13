import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { characterById } from "@/game/characters";
import { rivalById, stageById } from "@/game/content";
import { sfx } from "@/game/sfx";
import { createBattle, queueSkill, tick, type BattleState, type Fighter } from "@/game/sim";
import { useSave, type BattleSummary } from "@/game/store";
import { Bar, Portrait } from "@/components/fantasy/ui";

export type Run =
  | { kind: "stage"; id: number; nonce: number }
  | { kind: "arena"; id: string; nonce: number };

function setup(run: Run): { title: string; subtitle: string; battle: BattleState } {
  const squad = useSave.getState().squad;
  const owned = useSave.getState().owned;
  const allies = squad.map((id) => ({ id, level: owned[id]?.level ?? 1 }));
  if (run.kind === "stage") {
    const stage = stageById(run.id);
    return {
      title: stage.name,
      subtitle: stage.blurb,
      battle: createBattle({ allies, enemies: stage.enemies }),
    };
  }
  const rival = rivalById(run.id);
  return {
    title: rival.name,
    subtitle: rival.line,
    battle: createBattle({
      allies,
      enemies: rival.team.map((m) => ({
        id: m.id,
        level: m.level,
        name: characterById(m.id).name,
      })),
    }),
  };
}

export function BattleView({ run, onClose }: { run: Run; onClose: () => void }) {
  const seed = useRef(setup(run));
  const sim = useRef(seed.current.battle);
  const [view, setView] = useState(seed.current.battle);
  const [summary, setSummary] = useState<BattleSummary | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const cur = sim.current;
      if (cur.phase === "fight" && !cur.paused) {
        const stepped = tick(cur, dt * cur.speed);
        sim.current = stepped.state;
        for (const ev of stepped.events) {
          if (ev.type === "hit") sfx.hit();
          else if (ev.type === "heal") sfx.heal();
          else if (ev.type === "skill") sfx.skill();
          else if (ev.type === "win") sfx.win();
          else sfx.lose();
        }
      }
      acc += dt;
      const phaseChanged = sim.current.phase !== "fight";
      if (acc >= 0.08 || phaseChanged) {
        acc = 0;
        setView(sim.current);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (reported.current) return;
    if (view.phase !== "victory" && view.phase !== "defeat") return;
    reported.current = true;
    const result = useSave.getState().finishBattle({
      win: view.phase === "victory",
      skills: view.skillsCast,
      token: `${run.kind}:${run.id}:${run.nonce}`,
      stageId: run.kind === "stage" ? run.id : undefined,
      rivalId: run.kind === "arena" ? run.id : undefined,
    });
    setSummary(result);
  }, [view.phase, view.skillsCast, run]);

  const allies = view.units.filter((u) => u.side === "ally");
  const enemies = view.units.filter((u) => u.side === "enemy");
  const shaking = view.t < view.shakeUntil;

  function pressSkill(uid: string) {
    sim.current = queueSkill(sim.current, uid);
    setView(sim.current);
    sfx.click();
  }

  function togglePause() {
    sim.current = { ...sim.current, paused: !sim.current.paused };
    setView(sim.current);
  }

  function toggleSpeed() {
    const speed = sim.current.speed === 1 ? 2 : 1;
    sim.current = { ...sim.current, speed };
    setView(sim.current);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-center bg-ink/50">
      <section className="flex h-full w-full max-w-lg flex-col bg-paper">
        <header className="flex items-start gap-3 px-4 pt-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-teal">
              {run.kind === "stage" ? "故事闯关" : "练习对战"}
            </p>
            <h2 className="truncate font-display text-2xl">{seed.current.title}</h2>
          </div>
          <button type="button" className="btn btn-ghost px-3" onClick={toggleSpeed} aria-label="切换倍速">
            {view.speed === 1 ? "1x" : "2x"}
          </button>
          <button type="button" className="btn btn-ghost px-3" onClick={togglePause} aria-label={view.paused ? "继续" : "暂停"}>
            {view.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button type="button" className="btn btn-ghost px-3" onClick={onClose} aria-label="离开战斗">
            <X className="h-4 w-4" />
          </button>
        </header>
        <p className="px-4 pt-1 text-sm text-ink-soft">{view.banner}</p>
        <div className={`mx-4 mt-3 min-h-0 flex-1 overflow-y-auto rounded-card bg-meadow p-3 ${shaking ? "fs-shake" : ""}`}>
          <div className="grid grid-cols-2 gap-3">
            <Column units={view.units} side="ally" t={view.t} floats={view.floats} />
            <Column units={view.units} side="enemy" t={view.t} floats={view.floats} />
          </div>
          <ul className="mt-3 space-y-1 text-xs text-ink-soft">
            {view.log.map((line, i) => (
              <li key={`${line}-${i}`}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          {allies.map((u) => {
            const ready = u.energy >= 100 && u.hp > 0;
            return (
              <button
                key={u.uid}
                type="button"
                className={`btn btn-gold flex-col gap-0 px-2 py-2 ${ready ? "fs-ready" : ""}`}
                disabled={!ready || view.phase !== "fight"}
                onClick={() => pressSkill(u.uid)}
              >
                <span className="max-w-full truncate text-sm">{u.skillQueued ? "即将释放" : u.skill.name}</span>
                <span className="text-xs font-semibold text-ink-soft">{u.name} {Math.floor(u.energy)}</span>
              </button>
            );
          })}
          {allies.length < 3 &&
            Array.from({ length: 3 - allies.length }).map((_, i) => (
              <div key={i} className="min-h-11 rounded-full bg-paper-deep" />
            ))}
        </div>
        {view.paused && view.phase === "fight" && (
          <p className="px-4 pb-3 text-center text-sm text-ink-soft">已暂停。随时可以离开，这一局不会结算。</p>
        )}
        {enemies.length === 0 ? null : null}
        {summary && (
          <div className="absolute inset-0 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
            <div className="fs-pop w-full max-w-sm rounded-card bg-card p-5 shadow-xl">
              <p className="font-display text-3xl">{summary.win ? "胜利" : "再试一次"}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {summary.win
                  ? `星积分 +${summary.pointsGained}`
                  : `不白打，返还 ${summary.pointsGained} 星积分。升级前排或治疗后再来。`}
              </p>
              {summary.unlockedName && summary.unlockedImg && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-paper p-2">
                  <Portrait src={summary.unlockedImg} alt={summary.unlockedName} className="h-20 w-16" />
                  <div>
                    <p className="text-xs font-semibold text-teal">新伙伴加入</p>
                    <p className="font-display text-2xl">{summary.unlockedName}</p>
                  </div>
                </div>
              )}
              {summary.win && <Mvp units={view.units} />}
              <button type="button" className="btn btn-primary btn-block mt-4" onClick={onClose}>
                返回
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Mvp({ units }: { units: Fighter[] }) {
  const best = [...units.filter((u) => u.side === "ally")].sort((a, b) => b.dealt - a.dealt)[0];
  if (!best || best.dealt <= 0) return null;
  return <p className="mt-3 text-sm">输出最高：{best.name} · {best.dealt}</p>;
}

function Column({
  units,
  side,
  t,
  floats,
}: {
  units: Fighter[];
  side: "ally" | "enemy";
  t: number;
  floats: BattleState["floats"];
}) {
  const list = units.filter((u) => u.side === side);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs font-semibold text-ink-soft">{side === "ally" ? "我方 · 上方是前排" : "对手"}</p>
      {list.map((u, index) => {
        const lunging = t - u.lastAct < 0.34 && u.lastAct > 0;
        const hurt = t - u.lastHit < 0.28 && u.lastHit > 0;
        const texts = floats.filter((f) => f.uid === u.uid);
        return (
          <article
            key={u.uid}
            className={`relative rounded-2xl bg-card p-2 ${u.hp <= 0 ? "opacity-45 grayscale" : "fs-bob"} ${hurt ? "fs-hurt" : ""} ${lunging ? (side === "ally" ? "fs-lunge-r" : "fs-lunge-l") : ""}`}
          >
            {side === "ally" && index === 0 && u.hp > 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-teal px-2 py-0.5 text-xs font-bold text-card">前排</span>
            )}
            <Portrait src={u.img} alt={u.name} className="mx-auto h-24 w-full" />
            <p className="truncate text-center text-sm font-bold">{u.name}</p>
            <Bar value={u.hp} max={u.maxHp} tone={side === "ally" ? "teal" : "coral"} />
            <p className="mt-1 text-center text-xs text-ink-soft">
              {Math.ceil(u.hp)}/{u.maxHp}
              {u.shield > 0 ? ` · 盾 ${Math.ceil(u.shield)}` : ""}
              {u.stun > 0 ? " · 眩晕" : ""}
            </p>
            {texts.map((f) => (
              <span
                key={f.id}
                className={`fs-float pointer-events-none absolute top-6 left-1/2 text-sm font-bold ${
                  f.kind === "heal" || f.kind === "shield" ? "text-mint" : f.kind === "skill" ? "text-gold-deep" : "text-coral"
                }`}
              >
                {f.text}
              </span>
            ))}
          </article>
        );
      })}
    </div>
  );
}
