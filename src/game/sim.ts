import {
  characterById,
  statsFor,
  synergyMods,
  type Role,
  type Skill,
} from "@/game/characters";

export type Side = "ally" | "enemy";

export type Fighter = {
  uid: string;
  defId: string;
  name: string;
  img: string;
  side: Side;
  role: Role;
  level: number;
  skill: Skill;
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  atb: number;
  energy: number;
  shield: number;
  stun: number;
  nextHit: number;
  skillQueued: boolean;
  lastAct: number;
  lastHit: number;
  dealt: number;
};

export type FloatText = {
  id: number;
  uid: string;
  text: string;
  kind: "dmg" | "heal" | "shield" | "skill";
  until: number;
};

export type Phase = "fight" | "victory" | "defeat";

export type BattleState = {
  phase: Phase;
  paused: boolean;
  speed: 1 | 2;
  t: number;
  hitStop: number;
  shakeUntil: number;
  banner: string;
  log: string[];
  units: Fighter[];
  floats: FloatText[];
  floatSeq: number;
  skillsCast: number;
};

export type BattleEvent = { type: "hit" | "heal" | "skill" | "win" | "lose" };

const THRESHOLD = 100;

export function createBattle(opts: {
  allies: { id: string; level: number }[];
  enemies: { id: string; level: number; name?: string }[];
}): BattleState {
  const mods = synergyMods(opts.allies.map((a) => a.id));
  const allies = opts.allies.map((a, i) =>
    makeFighter(`a${i}`, a.id, "ally", a.level, undefined, mods),
  );
  const enemies = opts.enemies.map((e, i) =>
    makeFighter(`e${i}`, e.id, "enemy", e.level, e.name),
  );
  return {
    phase: "fight",
    paused: false,
    speed: 1,
    t: 0,
    hitStop: 0,
    shakeUntil: 0,
    banner: mods.energy > 0 ? "星辉加成：开场就有能量" : "战斗开始",
    log: ["小队就位。点亮的技能可以手动释放。"],
    units: [...allies, ...enemies],
    floats: [],
    floatSeq: 1,
    skillsCast: 0,
  };
}

function makeFighter(
  uid: string,
  id: string,
  side: Side,
  level: number,
  name: string | undefined,
  mods?: { hp: number; atk: number; def: number; energy: number },
): Fighter {
  const def = characterById(id);
  const stats = statsFor(def, level);
  const m = side === "ally" && mods ? mods : { hp: 1, atk: 1, def: 1, energy: 0 };
  const maxHp = Math.round(stats.hp * m.hp);
  return {
    uid,
    defId: id,
    name: name ?? def.name,
    img: def.img,
    side,
    role: def.role,
    level,
    skill: def.skill,
    maxHp,
    hp: maxHp,
    atk: Math.round(stats.atk * m.atk),
    def: Math.round(stats.def * m.def),
    spd: stats.spd,
    atb: 8 + ((uid.charCodeAt(1) * 13) % 24),
    energy: m.energy,
    shield: 0,
    stun: 0,
    nextHit: 1,
    skillQueued: false,
    lastAct: 0,
    lastHit: 0,
    dealt: 0,
  };
}

export function queueSkill(state: BattleState, uid: string): BattleState {
  return {
    ...state,
    units: state.units.map((u) => {
      if (u.uid !== uid || u.side !== "ally" || u.hp <= 0 || u.energy < 100) return u;
      return { ...u, skillQueued: true };
    }),
  };
}

export function tick(state: BattleState, dt: number): { state: BattleState; events: BattleEvent[] } {
  if (state.phase !== "fight" || state.paused) return { state, events: [] };

  const events: BattleEvent[] = [];
  const t = state.t + dt;
  let hitStop = state.hitStop;
  let floats = state.floats.filter((f) => f.until > t);
  let shakeUntil = state.shakeUntil;
  let banner = state.banner;
  let log = state.log;
  let skillsCast = state.skillsCast;
  let floatSeq = state.floatSeq;
  let units = state.units.map((u) => ({ ...u, stun: Math.max(0, u.stun - dt) }));

  if (hitStop > 0) {
    return {
      state: { ...state, t, hitStop: Math.max(0, hitStop - dt), floats, units },
      events,
    };
  }

  units = units.map((u) =>
    u.hp <= 0 || u.stun > 0 ? u : { ...u, atb: u.atb + u.spd * 2 * dt },
  );

  let guard = 0;
  while (guard++ < 3) {
    const ready = units
      .filter((u) => u.hp > 0 && u.stun <= 0 && u.atb >= THRESHOLD)
      .sort((a, b) => b.atb - a.atb)[0];
    if (!ready) break;

    const outcome = perform(units, ready.uid, t, floatSeq);
    units = outcome.units;
    floats = floats.concat(outcome.floats);
    floatSeq = outcome.floatSeq;
    if (outcome.log) log = [...log, outcome.log].slice(-4);
    if (outcome.banner) banner = outcome.banner;
    if (outcome.shake) shakeUntil = t + 0.4;
    if (outcome.hitStop) hitStop = outcome.hitStop;
    if (outcome.skillCast && ready.side === "ally") skillsCast += 1;
    events.push(...outcome.events);

    const end = winner(units);
    if (end) {
      events.push({ type: end === "victory" ? "win" : "lose" });
      return {
        state: pack(state, {
          t,
          units,
          floats,
          floatSeq,
          log,
          banner,
          shakeUntil,
          hitStop,
          skillsCast,
          phase: end,
        }),
        events,
      };
    }
    if (hitStop > 0) break;
  }

  if (t > 80) {
    const end = timeoutWinner(units);
    events.push({ type: end === "victory" ? "win" : "lose" });
    return {
      state: pack(state, {
        t,
        units,
        floats,
        floatSeq,
        log,
        banner: "时间到",
        shakeUntil,
        hitStop,
        skillsCast,
        phase: end,
      }),
      events,
    };
  }

  return {
    state: pack(state, {
      t,
      units,
      floats,
      floatSeq,
      log,
      banner,
      shakeUntil,
      hitStop,
      skillsCast,
      phase: "fight",
    }),
    events,
  };
}

function pack(state: BattleState, patch: Partial<BattleState> & Pick<BattleState, "t" | "units" | "floats" | "floatSeq" | "log" | "banner" | "shakeUntil" | "hitStop" | "skillsCast" | "phase">): BattleState {
  return { ...state, ...patch };
}

function winner(units: Fighter[]): Phase | null {
  const allies = units.some((u) => u.side === "ally" && u.hp > 0);
  const enemies = units.some((u) => u.side === "enemy" && u.hp > 0);
  if (!enemies && allies) return "victory";
  if (!allies) return "defeat";
  return null;
}

function timeoutWinner(units: Fighter[]): Phase {
  const ratio = (side: Side) => {
    const list = units.filter((u) => u.side === side);
    const hp = list.reduce((s, u) => s + u.hp, 0);
    const max = list.reduce((s, u) => s + u.maxHp, 0);
    return max === 0 ? 0 : hp / max;
  };
  return ratio("ally") >= ratio("enemy") ? "victory" : "defeat";
}

type Outcome = {
  units: Fighter[];
  floats: FloatText[];
  floatSeq: number;
  log?: string;
  banner?: string;
  shake?: boolean;
  hitStop?: number;
  skillCast?: boolean;
  events: BattleEvent[];
};

function perform(units: Fighter[], uid: string, t: number, floatSeq: number): Outcome {
  const actor = units.find((u) => u.uid === uid);
  if (!actor) return { units, floats: [], floatSeq, events: [] };

  const useSkill =
    actor.energy >= 100 && (actor.side === "enemy" || actor.skillQueued);

  let next = units.map((u) =>
    u.uid === uid ? { ...u, atb: u.atb - THRESHOLD, lastAct: t, skillQueued: false } : u,
  );
  const events: BattleEvent[] = [];
  const floats: FloatText[] = [];
  let seq = floatSeq;

  const pushFloat = (target: string, text: string, kind: FloatText["kind"]) => {
    floats.push({ id: seq++, uid: target, text, kind, until: t + 0.9 });
  };

  if (useSkill) {
    next = next.map((u) => (u.uid === uid ? { ...u, energy: 0 } : u));
    pushFloat(uid, actor.skill.name, "skill");
    events.push({ type: "skill" });
    const resolved = resolveSkill(next, uid, t, pushFloat, events);
    next = resolved.units;
    return {
      units: next,
      floats,
      floatSeq: seq,
      log: `${actor.name} 释放 ${actor.skill.name}`,
      banner: `${actor.name} · ${actor.skill.name}`,
      shake: actor.skill.kind === "aoe" || actor.skill.kind === "chaos",
      hitStop: 0.06,
      skillCast: true,
      events,
    };
  }

  const target = pickFoe(next, actor);
  if (!target) return { units: next, floats, floatSeq: seq, events };
  const hit = strike(next, uid, target.uid, 1, false, t);
  next = hit.units;
  pushFloat(target.uid, `-${hit.amount}`, "dmg");
  events.push({ type: "hit" });
  next = next.map((u) =>
    u.uid === uid ? { ...u, energy: Math.min(100, u.energy + 28) } : u,
  );
  return {
    units: next,
    floats,
    floatSeq: seq,
    log: `${actor.name} 击中 ${target.name}，${hit.amount} 伤害`,
    banner: `${actor.name} 普通攻击`,
    events,
  };
}

function resolveSkill(
  units: Fighter[],
  uid: string,
  t: number,
  pushFloat: (target: string, text: string, kind: FloatText["kind"]) => void,
  events: BattleEvent[],
): { units: Fighter[] } {
  const actor = units.find((u) => u.uid === uid);
  if (!actor) return { units };
  const skill = actor.skill;

  if (skill.kind === "hit") {
    const target = pickFoe(units, actor);
    if (!target) return { units };
    const hit = strike(units, uid, target.uid, skill.mult, !!skill.crit, t, skill.stun ?? 0);
    pushFloat(target.uid, `-${hit.amount}`, "dmg");
    events.push({ type: "hit" });
    return { units: hit.units };
  }

  if (skill.kind === "execute") {
    const foes = living(units, actor.side === "ally" ? "enemy" : "ally");
    const target = [...foes].sort((a, b) => a.hp - b.hp)[0];
    if (!target) return { units };
    const low = target.hp / target.maxHp < 0.45;
    const hit = strike(units, uid, target.uid, low ? skill.bonus : skill.mult, low, t);
    pushFloat(target.uid, `-${hit.amount}`, "dmg");
    events.push({ type: "hit" });
    return { units: hit.units };
  }

  if (skill.kind === "aoe") {
    let next = units;
    for (const foe of living(units, actor.side === "ally" ? "enemy" : "ally")) {
      const hit = strike(next, uid, foe.uid, skill.mult, false, t);
      next = hit.units;
      pushFloat(foe.uid, `-${hit.amount}`, "dmg");
    }
    events.push({ type: "hit" });
    return { units: next };
  }

  if (skill.kind === "heal") {
    const friends = living(units, actor.side);
    const targets = skill.all
      ? friends
      : [[...friends].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]].filter(Boolean);
    let next = units;
    for (const friend of targets) {
      if (!friend) continue;
      const amount = Math.max(1, Math.round(friend.maxHp * skill.ratio));
      next = next.map((u) =>
        u.uid === friend.uid
          ? {
              ...u,
              hp: Math.min(u.maxHp, u.hp + amount),
              stun: skill.cleanse ? 0 : u.stun,
              lastHit: t,
            }
          : u,
      );
      pushFloat(friend.uid, `+${amount}`, "heal");
    }
    events.push({ type: "heal" });
    return { units: next };
  }

  if (skill.kind === "shield") {
    const friends = living(units, actor.side);
    const targets = skill.all ? friends : [actor];
    let next = units;
    for (const friend of targets) {
      const amount = Math.max(1, Math.round(friend.maxHp * skill.ratio));
      next = next.map((u) =>
        u.uid === friend.uid
          ? { ...u, shield: Math.min(u.maxHp, u.shield + amount) }
          : u,
      );
      pushFloat(friend.uid, `盾+${amount}`, "shield");
    }
    events.push({ type: "heal" });
    return { units: next };
  }

  if (skill.kind === "bless") {
    const next = units.map((u) =>
      u.side === actor.side && u.hp > 0 ? { ...u, nextHit: Math.max(u.nextHit, 1.35) } : u,
    );
    for (const friend of living(next, actor.side)) pushFloat(friend.uid, "强化", "skill");
    events.push({ type: "skill" });
    return { units: next };
  }

  const roll = Math.random();
  if (roll < 0.34) {
    const friend = [...living(units, actor.side)].sort((a, b) => a.hp - b.hp)[0];
    if (!friend) return { units };
    const amount = Math.max(1, Math.round(friend.maxHp * 0.26));
    pushFloat(friend.uid, `+${amount}`, "heal");
    events.push({ type: "heal" });
    return {
      units: units.map((u) =>
        u.uid === friend.uid ? { ...u, hp: Math.min(u.maxHp, u.hp + amount), lastHit: t } : u,
      ),
    };
  }
  if (roll < 0.67) {
    const target = pickFoe(units, actor);
    if (!target) return { units };
    const hit = strike(units, uid, target.uid, 1.2, false, t, 1.8);
    pushFloat(target.uid, `-${hit.amount}`, "dmg");
    events.push({ type: "hit" });
    return { units: hit.units };
  }
  let next = units;
  for (const foe of living(units, actor.side === "ally" ? "enemy" : "ally")) {
    const hit = strike(next, uid, foe.uid, 0.8, false, t);
    next = hit.units;
    pushFloat(foe.uid, `-${hit.amount}`, "dmg");
  }
  events.push({ type: "hit" });
  return { units: next };
}

function strike(
  units: Fighter[],
  actorId: string,
  targetId: string,
  mult: number,
  forceCrit: boolean,
  t: number,
  stun = 0,
) {
  const actor = units.find((u) => u.uid === actorId);
  const target = units.find((u) => u.uid === targetId);
  if (!actor || !target || target.hp <= 0) return { units, amount: 0 };
  const crit = forceCrit || Math.random() < (actor.role === "archer" ? 0.28 : 0.08);
  const raw =
    actor.atk *
    mult *
    actor.nextHit *
    (100 / (100 + target.def)) *
    (0.92 + Math.random() * 0.16) *
    (crit ? 1.7 : 1);
  let amount = Math.max(1, Math.round(raw));
  let shield = target.shield;
  const absorbed = Math.min(shield, amount);
  shield -= absorbed;
  const hpLoss = amount - absorbed;
  const hp = Math.max(0, target.hp - hpLoss);
  const unitsNext = units.map((u) => {
    if (u.uid === actorId) return { ...u, nextHit: 1, dealt: u.dealt + amount };
    if (u.uid === targetId) {
      return { ...u, hp, shield, stun: stun > 0 ? Math.max(u.stun, stun) : u.stun, lastHit: t };
    }
    return u;
  });
  return { units: unitsNext, amount };
}

function living(units: Fighter[], side: Side) {
  return units.filter((u) => u.side === side && u.hp > 0);
}

function pickFoe(units: Fighter[], actor: Fighter) {
  const foes = living(units, actor.side === "ally" ? "enemy" : "ally");
  if (!foes.length) return null;
  if (actor.role === "assassin" || actor.role === "archer") {
    return [...foes].sort((a, b) => a.hp - b.hp)[0] ?? null;
  }
  return foes[0] ?? null;
}
