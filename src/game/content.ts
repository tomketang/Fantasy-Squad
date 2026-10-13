export type Stage = {
  id: number;
  name: string;
  blurb: string;
  reward: number;
  repeat: number;
  unlockId: string;
  hint: string;
  enemies: { id: string; level: number; name: string }[];
};

export const STAGES: Stage[] = [
  {
    id: 1,
    name: "花盆小径",
    blurb: "小路边站着一位旅人，还有两个迷了路的小兵。",
    reward: 70,
    repeat: 24,
    unlockId: "traveler",
    hint: "用初始小队就能过。记得点技能。",
    enemies: [
      { id: "soldier", level: 1, name: "迷途小兵" },
      { id: "soldier", level: 1, name: "另一个小兵" },
    ],
  },
  {
    id: 2,
    name: "刺球灌木",
    blurb: "灌木里滚出一个笑得很开心的刺球。",
    reward: 80,
    repeat: 26,
    unlockId: "thorn",
    hint: "前排放小齿轮。",
    enemies: [
      { id: "thorn", level: 2, name: "闹腾刺球" },
      { id: "soldier", level: 1, name: "灌木哨兵" },
    ],
  },
  {
    id: 3,
    name: "石洞",
    blurb: "洞口有人扛着一根巨大的石棒。",
    reward: 90,
    repeat: 28,
    unlockId: "brute",
    hint: "石棒很痛，但很慢。",
    enemies: [{ id: "brute", level: 2, name: "石洞蛮人" }],
  },
  {
    id: 4,
    name: "彩叶坡",
    blurb: "毛虫挡住了路，它其实想交朋友。",
    reward: 100,
    repeat: 28,
    unlockId: "caterpillar",
    hint: "它会治疗自己这边。",
    enemies: [
      { id: "caterpillar", level: 3, name: "坡上彩毛" },
      { id: "thorn", level: 2, name: "跟班刺球" },
    ],
  },
  {
    id: 5,
    name: "门岗",
    blurb: "柯基保安认真地拦住了你们。",
    reward: 110,
    repeat: 30,
    unlockId: "guard",
    hint: "先打掉护盾，再集火。",
    enemies: [
      { id: "guard", level: 3, name: "值班柯基" },
      { id: "soldier", level: 3, name: "门岗小兵" },
    ],
  },
  {
    id: 6,
    name: "云上操场",
    blurb: "一个抱着葫芦的孩子从云里跳下来。",
    reward: 120,
    repeat: 32,
    unlockId: "flyer",
    hint: "他攻得很快，治疗要及时。",
    enemies: [{ id: "flyer", level: 4, name: "云上孩子" }],
  },
  {
    id: 7,
    name: "莲池",
    blurb: "莲弓在池边练习，想看看你们的小队。",
    reward: 130,
    repeat: 32,
    unlockId: "archer",
    hint: "远程会打残血，别让花盆掉太低。",
    enemies: [
      { id: "archer", level: 4, name: "池边莲弓" },
      { id: "thorn", level: 3, name: "池边刺球" },
    ],
  },
  {
    id: 8,
    name: "泡泡星",
    blurb: "夜里掉下来一颗软软的星星。",
    reward: 140,
    repeat: 34,
    unlockId: "alien",
    hint: "对面会群体治疗，打得集中一点。",
    enemies: [
      { id: "alien", level: 5, name: "软软星星" },
      { id: "soldier", level: 4, name: "观星小兵" },
    ],
  },
  {
    id: 9,
    name: "冷静广场",
    blurb: "护卫把盾牌竖得很高。",
    reward: 150,
    repeat: 36,
    unlockId: "warden",
    hint: "盾很厚，带群体伤害会轻松些。",
    enemies: [
      { id: "warden", level: 5, name: "广场护卫" },
      { id: "guard", level: 4, name: "协管柯基" },
    ],
  },
  {
    id: 10,
    name: "藤蔓巷",
    blurb: "绿头发的小家伙专挑落单的人。",
    reward: 170,
    repeat: 38,
    unlockId: "rascal",
    hint: "别让血量最低的队友孤零零站着。",
    enemies: [
      { id: "rascal", level: 6, name: "巷口藤刺" },
      { id: "archer", level: 5, name: "巷口射手" },
    ],
  },
  {
    id: 11,
    name: "苔原",
    blurb: "巨人笑着走过来，地面都在抖。",
    reward: 200,
    repeat: 42,
    unlockId: "giant",
    hint: "建议小队平均 4 级以上。",
    enemies: [
      { id: "giant", level: 6, name: "苔原巨人" },
      { id: "brute", level: 5, name: "苔原蛮人" },
    ],
  },
  {
    id: 12,
    name: "星课",
    blurb: "法师想用一颗星星考验你们。",
    reward: 230,
    repeat: 46,
    unlockId: "wizard",
    hint: "会被眩晕，彩毛可以解控。",
    enemies: [
      { id: "wizard", level: 7, name: "星课法师" },
      { id: "alien", level: 6, name: "星课助手" },
    ],
  },
  {
    id: 13,
    name: "问号森林",
    blurb: "林子中间站着一团问号。谁也不知道它会做什么。",
    reward: 280,
    repeat: 52,
    unlockId: "riddle",
    hint: "最终章。把常驻三人养到 5 级更稳。",
    enemies: [
      { id: "riddle", level: 8, name: "问号精灵" },
      { id: "thorn", level: 6, name: "森林刺球" },
    ],
  },
];

export type Rival = {
  id: string;
  name: string;
  line: string;
  reward: number;
  team: { id: string; level: number }[];
};

export const RIVALS: Rival[] = [
  {
    id: "hua",
    name: "阿花的小队",
    line: "我们主打浇花和站桩。",
    reward: 36,
    team: [
      { id: "flora", level: 2 },
      { id: "knight", level: 2 },
      { id: "traveler", level: 1 },
    ],
  },
  {
    id: "man",
    name: "小满巡逻队",
    line: "柯基说了，要保持队形。",
    reward: 48,
    team: [
      { id: "guard", level: 3 },
      { id: "soldier", level: 3 },
      { id: "warden", level: 2 },
    ],
  },
  {
    id: "yun",
    name: "云上游侠",
    line: "打完就可以去吃点心。",
    reward: 60,
    team: [
      { id: "flyer", level: 4 },
      { id: "archer", level: 4 },
      { id: "rascal", level: 3 },
    ],
  },
  {
    id: "star",
    name: "星辉课后组",
    line: "这题的答案是配合。",
    reward: 72,
    team: [
      { id: "wizard", level: 5 },
      { id: "alien", level: 4 },
      { id: "robot", level: 4 },
    ],
  },
  {
    id: "moss",
    name: "苔原远足",
    line: "走得慢，但午饭很丰盛。",
    reward: 88,
    team: [
      { id: "giant", level: 6 },
      { id: "brute", level: 5 },
      { id: "caterpillar", level: 5 },
    ],
  },
];

export const BOARD: { name: string; score: number }[] = [
  { name: "云上游侠", score: 820 },
  { name: "星辉课后组", score: 640 },
  { name: "小满巡逻队", score: 410 },
  { name: "阿花的小队", score: 260 },
  { name: "刺球联盟", score: 120 },
];

export type ShopItem = {
  id: string;
  kind: "title" | "banner";
  name: string;
  desc: string;
  cost: number;
  value: string;
};

export const SHOP: ShopItem[] = [
  {
    id: "title-florist",
    kind: "title",
    name: "称号 · 花匠队长",
    desc: "只改头衔，不改战力。",
    cost: 120,
    value: "花匠队长",
  },
  {
    id: "title-star",
    kind: "title",
    name: "称号 · 星辉团长",
    desc: "小队名字下面的一行小字。",
    cost: 220,
    value: "星辉团长",
  },
  {
    id: "title-cloud",
    kind: "title",
    name: "称号 · 云上小队",
    desc: "看起来很快，其实还是你自己在打。",
    cost: 300,
    value: "云上小队",
  },
  {
    id: "banner-bloom",
    kind: "banner",
    name: "队旗 · 花瓣",
    desc: "把营地换成暖暖的花粉色。",
    cost: 80,
    value: "bloom",
  },
  {
    id: "banner-dusk",
    kind: "banner",
    name: "队旗 · 暮蓝",
    desc: "换成安静的蓝绿色营地。",
    cost: 80,
    value: "dusk",
  },
];

export const TASKS = [
  { id: "win", label: "赢得 1 场战斗", reward: 80, goal: 1 },
  { id: "skill", label: "手动放出 3 次技能", reward: 60, goal: 3 },
  { id: "level", label: "升级任意角色", reward: 70, goal: 1 },
  { id: "play", label: "完成 2 场战斗", reward: 40, goal: 2 },
] as const;

export function stageById(id: number) {
  const found = STAGES.find((s) => s.id === id);
  if (!found) throw new Error(`unknown stage ${id}`);
  return found;
}

export function rivalById(id: string) {
  const found = RIVALS.find((r) => r.id === id);
  if (!found) throw new Error(`unknown rival ${id}`);
  return found;
}
