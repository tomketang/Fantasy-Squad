import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STARTERS, characterById, levelCost } from "@/game/characters";
import { SHOP, TASKS, rivalById, stageById } from "@/game/content";

export type Owned = Record<string, { level: number }>;

export type TaskState = {
  date: string;
  wins: number;
  skills: number;
  played: number;
  leveled: boolean;
  claimed: string[];
};

export type SaveData = {
  teamName: string;
  title: string;
  banner: string;
  points: number;
  owned: Owned;
  squad: string[];
  cleared: number[];
  tasks: TaskState;
  week: { id: string; score: number };
  ownedCosmetics: string[];
  sound: boolean;
  seenIntro: boolean;
};

type Save = SaveData & {
  rename: (name: string) => void;
  setSquad: (ids: string[]) => void;
  levelUp: (id: string) => boolean;
  buy: (itemId: string) => boolean;
  equip: (itemId: string) => void;
  claimTask: (id: string) => void;
  finishBattle: (result: BattleResult) => BattleSummary;
  toggleSound: () => void;
  dismissIntro: () => void;
  rollClock: () => void;
};

export type BattleResult = {
  win: boolean;
  skills: number;
  token: string;
  stageId?: number;
  rivalId?: string;
};

export type BattleSummary = {
  win: boolean;
  pointsGained: number;
  unlockedName?: string;
  unlockedImg?: string;
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekId() {
  const d = new Date();
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${week}`;
}

function emptyTasks(date: string): TaskState {
  return { date, wins: 0, skills: 0, played: 0, leveled: false, claimed: [] };
}

function rolled(data: SaveData): Pick<SaveData, "tasks" | "week"> {
  const date = today();
  const week = weekId();
  return {
    tasks: data.tasks.date === date ? data.tasks : emptyTasks(date),
    week: data.week.id === week ? data.week : { id: week, score: 0 },
  };
}

const initial = (): SaveData => ({
  teamName: "奇幻小队",
  title: "见习队长",
  banner: "meadow",
  points: 200,
  owned: Object.fromEntries(STARTERS.map((id) => [id, { level: 1 }])),
  squad: [...STARTERS],
  cleared: [],
  tasks: emptyTasks(today()),
  week: { id: weekId(), score: 0 },
  ownedCosmetics: [],
  sound: true,
  seenIntro: false,
});

const memory = { lastSettle: "", lastSummary: null as BattleSummary | null };

function taskProgress(tasks: TaskState, id: string) {
  if (id === "win") return tasks.wins;
  if (id === "skill") return tasks.skills;
  if (id === "level") return tasks.leveled ? 1 : 0;
  return tasks.played;
}

export const useSave = create<Save>()(
  persist(
    (set, get) => ({
      ...initial(),
      rename: (name) => {
        const trimmed = name.slice(0, 12);
        set({ teamName: trimmed });
      },
      setSquad: (ids) => {
        const owned = get().owned;
        const unique = [...new Set(ids)].filter((id) => owned[id]).slice(0, 3);
        set({ squad: unique });
      },
      levelUp: (id) => {
        const cur = get();
        const row = cur.owned[id];
        if (!row || row.level >= 10) return false;
        const cost = levelCost(row.level);
        if (cur.points < cost) return false;
        const clock = rolled(cur);
        set({
          points: cur.points - cost,
          owned: { ...cur.owned, [id]: { level: row.level + 1 } },
          tasks: { ...clock.tasks, leveled: true },
          week: clock.week,
        });
        return true;
      },
      buy: (itemId) => {
        const cur = get();
        const item = SHOP.find((s) => s.id === itemId);
        if (!item || cur.ownedCosmetics.includes(itemId) || cur.points < item.cost) return false;
        const clock = rolled(cur);
        set({
          points: cur.points - item.cost,
          ownedCosmetics: [...cur.ownedCosmetics, itemId],
          title: item.kind === "title" ? item.value : cur.title,
          banner: item.kind === "banner" ? item.value : cur.banner,
          tasks: clock.tasks,
          week: clock.week,
        });
        return true;
      },
      equip: (itemId) => {
        const cur = get();
        if (itemId === "title-rookie") {
          set({ title: "见习队长" });
          return;
        }
        if (itemId === "banner-meadow") {
          set({ banner: "meadow" });
          return;
        }
        const item = SHOP.find((s) => s.id === itemId);
        if (!item || !cur.ownedCosmetics.includes(itemId)) return;
        if (item.kind === "title") set({ title: item.value });
        else set({ banner: item.value });
      },
      claimTask: (id) => {
        const cur = get();
        const clock = rolled(cur);
        const task = TASKS.find((t) => t.id === id);
        if (!task || clock.tasks.claimed.includes(id)) return;
        if (taskProgress(clock.tasks, id) < task.goal) return;
        set({
          points: cur.points + task.reward,
          tasks: { ...clock.tasks, claimed: [...clock.tasks.claimed, id] },
          week: clock.week,
        });
      },
      finishBattle: (result) => {
        if (result.token && memory.lastSettle === result.token && memory.lastSummary) {
          return memory.lastSummary;
        }
        const cur = get();
        const clock = rolled(cur);
        let pointsGained = result.win ? 0 : 8;
        let unlockedName: string | undefined;
        let unlockedImg: string | undefined;
        const owned = { ...cur.owned };
        const cleared = [...cur.cleared];
        let weekScore = clock.week.score;

        if (result.stageId) {
          const stage = stageById(result.stageId);
          const first = result.win && !cleared.includes(stage.id);
          if (result.win) {
            pointsGained = first ? stage.reward : stage.repeat;
            if (first) {
              cleared.push(stage.id);
              if (!owned[stage.unlockId]) {
                owned[stage.unlockId] = { level: 1 };
                const who = characterById(stage.unlockId);
                unlockedName = who.name;
                unlockedImg = who.img;
              }
            }
          }
        }

        if (result.rivalId && result.win) {
          const rival = rivalById(result.rivalId);
          pointsGained = rival.reward;
          weekScore += rival.reward;
        }

        set({
          points: cur.points + pointsGained,
          owned,
          cleared,
          week: { id: clock.week.id, score: weekScore },
          tasks: {
            ...clock.tasks,
            played: clock.tasks.played + 1,
            wins: clock.tasks.wins + (result.win ? 1 : 0),
            skills: clock.tasks.skills + result.skills,
          },
        });

        const summary = { win: result.win, pointsGained, unlockedName, unlockedImg };
        memory.lastSettle = result.token;
        memory.lastSummary = summary;
        return summary;
      },
      toggleSound: () => set({ sound: !get().sound }),
      dismissIntro: () => set({ seenIntro: true }),
      rollClock: () => {
        const cur = get();
        const clock = rolled(cur);
        const squad = [...new Set(cur.squad)].filter((id) => cur.owned[id]).slice(0, 3);
        set({ ...clock, squad });
      },
    }),
    {
      name: "fantasy-squad-v1",
      skipHydration: true,
      partialize: (s) => ({
        teamName: s.teamName,
        title: s.title,
        banner: s.banner,
        points: s.points,
        owned: s.owned,
        squad: s.squad,
        cleared: s.cleared,
        tasks: s.tasks,
        week: s.week,
        ownedCosmetics: s.ownedCosmetics,
        sound: s.sound,
        seenIntro: s.seenIntro,
      }),
    },
  ),
);

export function taskValue(tasks: TaskState, id: string) {
  return taskProgress(tasks, id);
}
