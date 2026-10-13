import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Lock, Volume2, VolumeX } from "lucide-react";
import {
  CHARACTERS,
  characterById,
  levelCost,
  powerOf,
  synergiesOf,
  type Character,
} from "@/game/characters";
import { BOARD, RIVALS, SHOP, STAGES, TASKS } from "@/game/content";
import { sfx } from "@/game/sfx";
import { taskValue, useSave } from "@/game/store";
import type { Run } from "@/components/fantasy/BattleView";
import { Bar, Portrait, RoleIcon, ringClass } from "@/components/fantasy/ui";

export function Camp({ onFight }: { onFight: (run: Run) => void }) {
  const save = useSave();
  const [note, setNote] = useState("");
  const [sharing, setSharing] = useState(false);
  const power = save.squad.reduce((sum, id) => sum + powerOf(characterById(id), save.owned[id]?.level ?? 1), 0);
  const tags = synergiesOf(save.squad);
  const nextStage = STAGES.find((s) => !save.cleared.includes(s.id) && (s.id === 1 || save.cleared.includes(s.id - 1)));

  function toggle(id: string) {
    if (save.squad.includes(id)) {
      save.setSquad(save.squad.filter((x) => x !== id));
      setNote("");
      return;
    }
    if (save.squad.length >= 3) {
      setNote("小队最多 3 人。先点一下要换下的伙伴。");
      return;
    }
    save.setSquad([...save.squad, id]);
    setNote("");
  }

  function move(index: number, dir: number) {
    const next = [...save.squad];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    const a = next[index];
    const b = next[j];
    if (!a || !b) return;
    next[index] = b;
    next[j] = a;
    save.setSquad(next);
  }

  const owned = CHARACTERS.filter((c) => save.owned[c.id]);

  return (
    <div className="space-y-4">
      <header className="text-center">
        <p className="text-xs font-semibold tracking-widest text-teal">FANTASY SQUAD</p>
        <input
          aria-label="队名"
          value={save.teamName}
          maxLength={12}
          onChange={(e) => save.rename(e.target.value)}
          className="w-full bg-transparent text-center font-display text-3xl text-ink outline-none"
        />
        <p className="text-sm text-ink-soft">{save.title}</p>
        <p className="mt-2 inline-flex min-h-9 items-center rounded-full bg-gold px-4 text-sm font-bold">
          星积分 {save.points}
        </p>
      </header>

      <section className="rounded-card bg-card p-4">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-xl">出战小队</h2>
          <p className="text-sm font-semibold">战力 {power}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => {
            const id = save.squad[i];
            if (!id) {
              return (
                <div key={i} className="flex h-36 items-center justify-center rounded-2xl bg-paper text-sm text-ink-soft">
                  空位
                </div>
              );
            }
            const c = characterById(id);
            return (
              <div key={id} className={`rounded-2xl bg-paper p-1 ${ringClass(c.rarity)}`}>
                <Portrait src={c.img} alt={c.name} className="h-24 w-full" />
                <p className="truncate text-center text-sm font-bold">{c.name}</p>
                <div className="flex justify-center gap-1 pb-1">
                  <button type="button" className="btn btn-ghost min-h-8 px-2" aria-label={`${c.name}前移`} onClick={() => move(i, -1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="btn btn-ghost min-h-8 px-2" aria-label={`${c.name}后移`} onClick={() => move(i, 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-ink-soft">第一位是前排，对手会优先打前排。左右箭头可以换位。</p>
        {tags.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.id} className="rounded-full bg-meadow px-3 py-1 text-xs font-semibold">
                {t.name} · {t.desc}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-ink-soft">坦克+治疗、刺客+弓手、法师+辅助会有小队加成。</p>
        )}
        <button
          type="button"
          className="btn btn-primary btn-block mt-3"
          disabled={!nextStage || save.squad.length < 3}
          onClick={() => nextStage && onFight({ kind: "stage", id: nextStage.id, nonce: Date.now() })}
        >
          {nextStage ? `继续 · ${nextStage.name}` : "故事已经全部通关"}
        </button>
        {save.squad.length < 3 && <p className="mt-2 text-center text-xs text-coral">请编满 3 人再出发。</p>}
      </section>

      <section>
        <h2 className="mb-2 font-display text-xl">点击编入或换下</h2>
        {note && <p className="mb-2 text-sm text-coral">{note}</p>}
        <ul className="grid grid-cols-4 gap-2">
          {owned.map((c) => {
            const on = save.squad.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  className={`w-full rounded-2xl bg-card p-1 ${on ? "ring-rare" : "ring-common"}`}
                >
                  <Portrait src={c.img} alt={c.name} className="h-16 w-full" />
                  <span className="block truncate text-xs font-bold">{c.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Tasks />

      <div className="flex gap-2">
        <button type="button" className="btn btn-ghost flex-1" onClick={() => setSharing(true)}>
          <Download className="h-4 w-4" />
          小队卡片
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          aria-label={save.sound ? "关闭音效" : "打开音效"}
          onClick={() => save.toggleSound()}
        >
          {save.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
      {sharing && <ShareCard onClose={() => setSharing(false)} />}
    </div>
  );
}

function Tasks() {
  const save = useSave();
  return (
    <section className="rounded-card bg-card p-4">
      <h2 className="font-display text-xl">今日任务</h2>
      <ul className="mt-2 space-y-2">
        {TASKS.map((task) => {
          const value = Math.min(task.goal, taskValue(save.tasks, task.id));
          const claimed = save.tasks.claimed.includes(task.id);
          const ready = value >= task.goal && !claimed;
          return (
            <li key={task.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{task.label}</p>
                <p className="text-xs text-ink-soft">
                  {value}/{task.goal} · {task.reward} 积分
                </p>
              </div>
              <button
                type="button"
                className="btn btn-gold min-h-10 px-3 text-sm"
                disabled={!ready}
                onClick={() => {
                  save.claimTask(task.id);
                  sfx.level();
                }}
              >
                {claimed ? "已领" : "领取"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ShareCard({ onClose }: { onClose: () => void }) {
  const save = useSave();
  const members = save.squad.map((id) => characterById(id));
  const power = save.squad.reduce((sum, id) => sum + powerOf(characterById(id), save.owned[id]?.level ?? 1), 0);

  async function saveImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 720;
    canvas.height = 960;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f6efe4";
    ctx.fillRect(0, 0, 720, 960);
    ctx.fillStyle = "#1f7a6b";
    ctx.fillRect(0, 0, 720, 16);
    ctx.fillStyle = "#3a2a22";
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(save.teamName || "奇幻小队", 360, 120);
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#6e584c";
    ctx.fillText(`${save.title} · 战力 ${power}`, 360, 170);
    await Promise.all(
      members.map(
        (c, i) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
              const x = 48 + i * 220;
              ctx.fillStyle = "#fffaf3";
              roundRect(ctx, x, 240, 200, 460, 28);
              ctx.fill();
              ctx.drawImage(img, x + 10, 260, 180, 360);
              ctx.fillStyle = "#3a2a22";
              ctx.font = "32px sans-serif";
              ctx.fillText(c.name, x + 100, 660);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = c.img;
          }),
      ),
    );
    ctx.fillStyle = "#1f7a6b";
    ctx.font = "24px sans-serif";
    ctx.fillText("Fantasy Squad", 360, 880);
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "fantasy-squad.png";
    a.click();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-card bg-card p-4">
        <p className="text-center text-xs font-semibold tracking-widest text-teal">FANTASY SQUAD</p>
        <p className="text-center font-display text-3xl">{save.teamName || "奇幻小队"}</p>
        <p className="text-center text-sm text-ink-soft">
          {save.title} · 战力 {power}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {members.map((c) => (
            <div key={c.id} className="rounded-2xl bg-paper p-1">
              <Portrait src={c.img} alt={c.name} className="h-28 w-full" />
              <p className="truncate text-center text-sm font-bold">{c.name}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn btn-primary flex-1" onClick={() => void saveImage()}>
            保存图片
          </button>
          <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function Codex() {
  const save = useSave();
  const [picked, setPicked] = useState<string | null>(null);
  const ownedCount = CHARACTERS.filter((c) => save.owned[c.id]).length;
  const who = picked ? characterById(picked) : null;

  return (
    <div>
      <header className="mb-3">
        <h2 className="font-display text-3xl">图鉴</h2>
        <p className="text-sm text-ink-soft">
          已收集 {ownedCount}/{CHARACTERS.length}。普通角色养高了一样能打。
        </p>
      </header>
      <ul className="grid grid-cols-3 gap-2">
        {CHARACTERS.map((c) => {
          const owned = save.owned[c.id];
          return (
            <li key={c.id}>
              <button type="button" onClick={() => setPicked(c.id)} className={`w-full rounded-2xl bg-card p-2 text-left ${ringClass(c.rarity)}`}>
                <Portrait src={c.img} alt={c.name} className={`h-24 w-full ${owned ? "" : "grayscale opacity-70"}`} />
                <span className="mt-1 flex items-center gap-1 text-sm font-bold">
                  {!owned && <Lock className="h-3 w-3" aria-hidden />}
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="block text-xs text-ink-soft">{owned ? `${owned.level} 级` : c.rarityLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {who && <Detail character={who} onClose={() => setPicked(null)} />}
    </div>
  );
}

function Detail({ character, onClose }: { character: Character; onClose: () => void }) {
  const save = useSave();
  const owned = save.owned[character.id];
  const level = owned?.level ?? 1;
  const stats = useMemo(() => {
    const now = powerStats(character, level);
    const next = level < 10 ? powerStats(character, level + 1) : null;
    return { now, next };
  }, [character, level]);
  const cost = owned && owned.level < 10 ? levelCost(owned.level) : 0;
  const stage = STAGES.find((s) => s.unlockId === character.id);
  const [pop, setPop] = useState(false);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 sm:items-center" role="dialog" aria-modal>
      <div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-card bg-card p-4 sm:rounded-card">
        <Portrait src={character.img} alt={character.name} className={`mx-auto h-56 w-full ${pop ? "fs-pop" : ""}`} />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal">
              {character.rarityLabel} · {character.epithet}
            </p>
            <h3 className="font-display text-3xl">{character.name}</h3>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-sm font-semibold">
            <RoleIcon role={character.role} />
            {character.roleLabel}
          </span>
        </div>
        <p className="mt-2 text-sm">{character.blurb}</p>
        <p className="mt-1 text-sm text-ink-soft">{character.partner}</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {(
            [
              ["生命", stats.now.hp, stats.next?.hp],
              ["攻击", stats.now.atk, stats.next?.atk],
              ["防御", stats.now.def, stats.next?.def],
              ["速度", stats.now.spd, stats.next?.spd],
            ] as const
          ).map(([label, value, next]) => (
            <div key={label} className="rounded-2xl bg-paper p-2">
              <p className="text-xs text-ink-soft">{label}</p>
              <p className="font-bold">{value}</p>
              {owned && next && next !== value && <p className="text-xs text-teal">→ {next}</p>}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl bg-paper p-3">
          <p className="text-sm font-bold">{character.skill.name}</p>
          <p className="text-sm text-ink-soft">{character.skill.desc} 能量满后可手动释放。</p>
          {owned && <Bar value={owned.level} max={10} tone="gold" />}
          {owned && <p className="mt-1 text-xs text-ink-soft">等级 {owned.level}/10</p>}
        </div>
        {owned ? (
          <button
            type="button"
            className="btn btn-primary btn-block mt-3"
            disabled={owned.level >= 10 || save.points < cost}
            onClick={() => {
              const ok = save.levelUp(character.id);
              if (ok) {
                setPop(true);
                sfx.level();
                window.setTimeout(() => setPop(false), 600);
              }
            }}
          >
            {owned.level >= 10 ? "已满级" : `升级 · ${cost} 星积分`}
          </button>
        ) : (
          <p className="mt-3 rounded-2xl bg-paper p-3 text-sm">
            {stage ? `通关「${stage.name}」后加入小队。` : "继续闯关就能遇到。"}
          </p>
        )}
        {!owned || save.points >= cost || owned.level >= 10 ? null : (
          <p className="mt-2 text-center text-xs text-coral">积分还差一点。</p>
        )}
        <button type="button" className="btn btn-ghost btn-block mt-2" onClick={onClose}>
          关闭
        </button>
      </div>
    </div>
  );
}

function powerStats(c: Character, level: number) {
  const scale = {
    hp: Math.round(c.hp * (1 + (level - 1) * 0.12)),
    atk: Math.round(c.atk * (1 + (level - 1) * 0.1)),
    def: Math.round(c.def * (1 + (level - 1) * 0.08)),
    spd: c.spd,
  };
  return scale;
}

export function Adventure({ onFight }: { onFight: (run: Run) => void }) {
  const cleared = useSave((s) => s.cleared);
  const squadReady = useSave((s) => s.squad.length >= 3);
  return (
    <div>
      <header className="mb-3">
        <h2 className="font-display text-3xl">闯关</h2>
        <p className="text-sm text-ink-soft">一局大约半分钟。自动攻击，技能留给你按。</p>
      </header>
      <ol className="space-y-3">
        {STAGES.map((stage) => {
          const open = stage.id === 1 || cleared.includes(stage.id - 1);
          const done = cleared.includes(stage.id);
          const who = characterById(stage.unlockId);
          return (
            <li key={stage.id} className={`rounded-card bg-card p-3 ${open ? "" : "opacity-60"}`}>
              <div className="flex gap-3">
                <Portrait src={who.img} alt={who.name} className={`h-20 w-16 ${done ? "" : "grayscale"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-teal">第 {stage.id} 章 {done ? "· 已通关" : ""}</p>
                  <h3 className="font-display text-2xl">{stage.name}</h3>
                  <p className="text-sm text-ink-soft">{stage.blurb}</p>
                  <p className="mt-1 text-xs">
                    {done ? `再打 +${stage.repeat}` : `首通 +${stage.reward} · 迎来 ${who.name}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block mt-3"
                disabled={!open || !squadReady}
                onClick={() => onFight({ kind: "stage", id: stage.id, nonce: Date.now() })}
              >
                {!squadReady ? "先去营地编满 3 人" : open ? "出发" : "先通过上一章"}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Arena({ onFight }: { onFight: (run: Run) => void }) {
  const week = useSave((s) => s.week);
  const teamName = useSave((s) => s.teamName);
  const squadReady = useSave((s) => s.squad.length >= 3);
  const board = [...BOARD, { name: teamName || "我的小队", score: week.score, you: true }].sort(
    (a, b) => b.score - a.score,
  );

  return (
    <div className="space-y-4">
      <header>
        <h2 className="font-display text-3xl">竞技</h2>
        <p className="text-sm text-ink-soft">跟练习对手比一比。榜单只存在这台设备上，每周自动刷新。</p>
      </header>
      <section className="rounded-card bg-card p-4">
        <h3 className="font-display text-xl">本周榜</h3>
        <ol className="mt-2 space-y-1">
          {board.map((row, i) => (
            <li
              key={row.name}
              className={`flex items-center justify-between rounded-xl px-2 py-1 text-sm ${"you" in row && row.you ? "bg-gold font-bold" : ""}`}
            >
              <span>
                {i + 1}. {row.name}
                {"you" in row && row.you ? "（你）" : ""}
              </span>
              <span>{row.score}</span>
            </li>
          ))}
        </ol>
      </section>
      <ul className="space-y-3">
        {RIVALS.map((rival) => (
          <li key={rival.id} className="rounded-card bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-2xl">{rival.name}</h3>
                <p className="text-sm text-ink-soft">{rival.line}</p>
              </div>
              <p className="text-sm font-bold text-teal">+{rival.reward}</p>
            </div>
            <div className="mt-2 flex gap-2">
              {rival.team.map((m) => {
                const c = characterById(m.id);
                return <Portrait key={m.id + m.level} src={c.img} alt={c.name} className="h-16 w-12" />;
              })}
            </div>
            <button
              type="button"
              className="btn btn-coral btn-block mt-3"
              disabled={!squadReady}
              onClick={() => onFight({ kind: "arena", id: rival.id, nonce: Date.now() })}
            >
              {squadReady ? "挑战" : "先编满 3 人"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Shop() {
  const save = useSave();
  return (
    <div>
      <header className="mb-3">
        <h2 className="font-display text-3xl">商店</h2>
        <p className="text-sm text-ink-soft">只卖称号和队旗。角色靠闯关认识，不靠付费。</p>
        <p className="mt-1 text-sm font-bold">星积分 {save.points}</p>
      </header>
      <ul className="space-y-3">
        <li className="rounded-card bg-card p-3">
          <p className="font-bold">称号 · 见习队长</p>
          <p className="text-sm text-ink-soft">一开始就有。</p>
          <button type="button" className="btn btn-ghost mt-2" onClick={() => save.equip("title-rookie")}>
            {save.title === "见习队长" ? "使用中" : "换上"}
          </button>
        </li>
        <li className="rounded-card bg-card p-3">
          <p className="font-bold">队旗 · 草地</p>
          <p className="text-sm text-ink-soft">默认的营地颜色。</p>
          <button type="button" className="btn btn-ghost mt-2" onClick={() => save.equip("banner-meadow")}>
            {save.banner === "meadow" ? "使用中" : "换上"}
          </button>
        </li>
        {SHOP.map((item) => {
          const owned = save.ownedCosmetics.includes(item.id);
          const equipped = item.kind === "title" ? save.title === item.value : save.banner === item.value;
          return (
            <li key={item.id} className="rounded-card bg-card p-3">
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-ink-soft">{item.desc}</p>
              {owned ? (
                <button type="button" className="btn btn-ghost mt-2" onClick={() => save.equip(item.id)}>
                  {equipped ? "使用中" : "换上"}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-gold mt-2"
                  disabled={save.points < item.cost}
                  onClick={() => {
                    if (save.buy(item.id)) sfx.level();
                  }}
                >
                  {item.cost} 星积分
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "收集伙伴",
      body: "每个角色都有自己的脾气和技能。普通的也能养成主力。",
      ids: ["robot", "knight", "flora"],
    },
    {
      title: "积分养成",
      body: "闯关、每日任务都会给星积分。拿去升级，角色会看得见地变强。",
      ids: ["archer", "wizard", "giant"],
    },
    {
      title: "三分钟一局",
      body: "战斗自动进行。能量亮起时，由你来放那一下关键技能。",
      ids: ["flyer", "rascal", "riddle"],
    },
  ];
  const slide = slides[step] ?? slides[0];
  if (!slide) return null;
  return (
    <div className="fixed inset-0 z-20 flex justify-center bg-paper">
      <div className="flex w-full max-w-lg flex-col justify-between px-5 py-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-teal">FANTASY SQUAD</p>
          <h2 className="mt-2 font-display text-4xl">{slide.title}</h2>
          <p className="mt-2 text-base text-ink-soft">{slide.body}</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {slide.ids.map((id) => {
              const c = characterById(id);
              return (
                <div key={id} className={`rounded-2xl bg-card p-2 ${ringClass(c.rarity)}`}>
                  <Portrait src={c.img} alt={c.name} className="h-36 w-full" />
                  <p className="truncate text-center text-sm font-bold">{c.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            if (step < slides.length - 1) setStep(step + 1);
            else onDone();
          }}
        >
          {step < slides.length - 1 ? "下一步" : "进入营地 · 已送 200 星积分"}
        </button>
      </div>
    </div>
  );
}
