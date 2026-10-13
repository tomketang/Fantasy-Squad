export type Role =
  | "tank"
  | "striker"
  | "balanced"
  | "mage"
  | "healer"
  | "assassin"
  | "archer"
  | "support";

export type Rarity = "common" | "rare" | "epic";

export type Skill =
  | { kind: "hit"; name: string; desc: string; mult: number; crit?: boolean; stun?: number }
  | { kind: "aoe"; name: string; desc: string; mult: number }
  | { kind: "heal"; name: string; desc: string; ratio: number; all?: boolean; cleanse?: boolean }
  | { kind: "shield"; name: string; desc: string; ratio: number; all?: boolean }
  | { kind: "execute"; name: string; desc: string; mult: number; bonus: number }
  | { kind: "bless"; name: string; desc: string }
  | { kind: "chaos"; name: string; desc: string };

export type Character = {
  id: string;
  name: string;
  epithet: string;
  img: string;
  role: Role;
  roleLabel: string;
  rarity: Rarity;
  rarityLabel: string;
  blurb: string;
  partner: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  skill: Skill;
};

export const ROLE_LABEL: Record<Role, string> = {
  tank: "坦克",
  striker: "输出",
  balanced: "均衡",
  mage: "法师",
  healer: "治疗",
  assassin: "刺客",
  archer: "远程",
  support: "辅助",
};

export const CHARACTERS: Character[] = [
  {
    id: "robot",
    name: "小齿轮",
    epithet: "机器人",
    img: "/characters/robot.jpg",
    role: "tank",
    roleLabel: "坦克",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "胸口一朵小花，专门站在前排把伤害接下来。",
    partner: "有花盆在身边时，整队更耐打。",
    hp: 156,
    atk: 15,
    def: 22,
    spd: 8,
    skill: { kind: "shield", name: "护盾协议", desc: "给全体队友套上护盾。", ratio: 0.18, all: true },
  },
  {
    id: "knight",
    name: "红缨",
    epithet: "骑士",
    img: "/characters/knight.jpg",
    role: "balanced",
    roleLabel: "均衡",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "攻守都稳，适合任何小队的中间位。",
    partner: "搭配治疗时几乎站得住整场。",
    hp: 124,
    atk: 21,
    def: 16,
    spd: 12,
    skill: { kind: "hit", name: "红缨斩", desc: "对一名敌人砍出重击。", mult: 1.8 },
  },
  {
    id: "flora",
    name: "花盆",
    epithet: "植物伙伴",
    img: "/characters/flora.jpg",
    role: "healer",
    roleLabel: "治疗",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "抱着一盆小花，能把队友重新浇醒。普通角色也能养成主力。",
    partner: "和骑士、小齿轮组队最稳。",
    hp: 110,
    atk: 13,
    def: 11,
    spd: 10,
    skill: { kind: "heal", name: "花露", desc: "治疗生命最低的队友。", ratio: 0.34 },
  },
  {
    id: "traveler",
    name: "小路",
    epithet: "林间旅人",
    img: "/characters/traveler.jpg",
    role: "support",
    roleLabel: "辅助",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "沿着花径走来的孩子，会把好运分给大家。",
    partner: "祝福会让下一击明显变重。",
    hp: 108,
    atk: 14,
    def: 12,
    spd: 11,
    skill: { kind: "bless", name: "小路祝福", desc: "全体队友下一次攻击变强。", },
  },
  {
    id: "thorn",
    name: "刺球",
    epithet: "刺球怪",
    img: "/characters/thorn.jpg",
    role: "striker",
    roleLabel: "输出",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "笑得很开心，刺却一点都不客气。",
    partner: "群攻适合对付人多的关卡。",
    hp: 102,
    atk: 22,
    def: 10,
    spd: 10,
    skill: { kind: "aoe", name: "爆刺", desc: "刺向所有敌人。", mult: 0.92 },
  },
  {
    id: "soldier",
    name: "叶徽",
    epithet: "小士兵",
    img: "/characters/soldier.jpg",
    role: "balanced",
    roleLabel: "均衡",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "帽子上有一片叶子，开枪前会先微笑。",
    partner: "稳扎稳打，适合补输出。",
    hp: 112,
    atk: 19,
    def: 13,
    spd: 11,
    skill: { kind: "hit", name: "齐射", desc: "认真瞄准打出一发。", mult: 1.65 },
  },
  {
    id: "brute",
    name: "石棒",
    epithet: "蛮人",
    img: "/characters/brute.jpg",
    role: "striker",
    roleLabel: "输出",
    rarity: "common",
    rarityLabel: "普通",
    blurb: "跑得慢，一棒子很重。养高了就是前排噩梦。",
    partner: "慢，但单发伤害很高。",
    hp: 140,
    atk: 26,
    def: 12,
    spd: 7,
    skill: { kind: "hit", name: "石棒猛砸", desc: "对一名敌人造成巨额伤害。", mult: 2.15 },
  },
  {
    id: "caterpillar",
    name: "彩毛",
    epithet: "植物生物",
    img: "/characters/caterpillar.jpg",
    role: "healer",
    roleLabel: "治疗",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "毛茸茸的一节一节，会把眩晕也一起治好。",
    partner: "对面有控制时特别好用。",
    hp: 118,
    atk: 12,
    def: 13,
    spd: 9,
    skill: { kind: "heal", name: "彩露", desc: "治疗队友并解除眩晕。", ratio: 0.28, cleanse: true },
  },
  {
    id: "guard",
    name: "柯基",
    epithet: "保安",
    img: "/characters/guard.jpg",
    role: "tank",
    roleLabel: "坦克",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "巡逻时很严肃，夸奖时尾巴会摇。",
    partner: "第二坦，适合把花盆护在后面。",
    hp: 148,
    atk: 16,
    def: 20,
    spd: 10,
    skill: { kind: "shield", name: "巡逻哨", desc: "吹哨，全体获得护盾。", ratio: 0.16, all: true },
  },
  {
    id: "flyer",
    name: "云葫芦",
    epithet: "飞人",
    img: "/characters/flyer.jpg",
    role: "assassin",
    roleLabel: "刺客",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "踩着云跑得飞快，专打还没反应过来的人。",
    partner: "和莲弓一起，爆发很高。",
    hp: 96,
    atk: 24,
    def: 8,
    spd: 16,
    skill: { kind: "hit", name: "云步", desc: "高速冲撞一名敌人。", mult: 1.75 },
  },
  {
    id: "archer",
    name: "莲弓",
    epithet: "弓箭手",
    img: "/characters/archer.jpg",
    role: "archer",
    roleLabel: "远程",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "发间别着小兔，箭尖却很认真。暴击率高。",
    partner: "搭配刺客时，残血敌人很难逃走。",
    hp: 100,
    atk: 25,
    def: 9,
    spd: 13,
    skill: { kind: "hit", name: "莲华一箭", desc: "必定暴击的一箭。", mult: 1.85, crit: true },
  },
  {
    id: "alien",
    name: "泡泡",
    epithet: "外星人",
    img: "/characters/alien.jpg",
    role: "support",
    roleLabel: "辅助",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "触角会发光，能把全体轻轻治好。",
    partner: "人多的队伍里，群体治疗很香。",
    hp: 112,
    atk: 14,
    def: 12,
    spd: 11,
    skill: { kind: "heal", name: "泡泡共鸣", desc: "治疗全体队友。", ratio: 0.16, all: true },
  },
  {
    id: "warden",
    name: "镇静",
    epithet: "护卫",
    img: "/characters/warden.jpg",
    role: "tank",
    roleLabel: "坦克",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "盾牌上写着保持冷静。他自己确实很冷静。",
    partner: "自保很强，适合当唯一前排。",
    hp: 150,
    atk: 15,
    def: 21,
    spd: 8,
    skill: { kind: "shield", name: "冷静壁垒", desc: "给自己加上厚厚的护盾。", ratio: 0.46 },
  },
  {
    id: "rascal",
    name: "藤刺",
    epithet: "刺客",
    img: "/characters/rascal.jpg",
    role: "assassin",
    roleLabel: "刺客",
    rarity: "rare",
    rarityLabel: "稀有",
    blurb: "绿头发里藏着花，专挑虚弱的目标下手。",
    partner: "和莲弓组队，收割特别快。",
    hp: 98,
    atk: 27,
    def: 8,
    spd: 15,
    skill: { kind: "execute", name: "藤刺突袭", desc: "攻击生命最低的敌人，残血时更痛。", mult: 1.5, bonus: 2.55 },
  },
  {
    id: "giant",
    name: "苔苔",
    epithet: "巨人",
    img: "/characters/giant.jpg",
    role: "striker",
    roleLabel: "输出",
    rarity: "epic",
    rarityLabel: "史诗",
    blurb: "走得很慢，一棒子能扫到所有人。养成后非常能打。",
    partner: "需要治疗拖时间，换来全场重击。",
    hp: 168,
    atk: 24,
    def: 14,
    spd: 7,
    skill: { kind: "aoe", name: "苔原重击", desc: "用树棒砸向所有敌人。", mult: 0.88 },
  },
  {
    id: "wizard",
    name: "星辉",
    epithet: "法师",
    img: "/characters/wizard.jpg",
    role: "mage",
    roleLabel: "法师",
    rarity: "epic",
    rarityLabel: "史诗",
    blurb: "帽子比人还大。星晶能把对手定在原地。",
    partner: "和辅助一起，开场就有能量。",
    hp: 104,
    atk: 26,
    def: 10,
    spd: 11,
    skill: { kind: "hit", name: "星晶禁锢", desc: "造成伤害并眩晕目标。", mult: 1.25, stun: 2.4 },
  },
  {
    id: "riddle",
    name: "问号",
    epithet: "谜团",
    img: "/characters/riddle.jpg",
    role: "mage",
    roleLabel: "法师",
    rarity: "epic",
    rarityLabel: "史诗",
    blurb: "它自己也不知道下一招会是什么。图鉴最后一页。",
    partner: "不可预测，适合已经养强的队伍。",
    hp: 120,
    atk: 23,
    def: 12,
    spd: 12,
    skill: { kind: "chaos", name: "问号乱流", desc: "随机治疗、眩晕或群体伤害。", },
  },
];

const BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));

export function characterById(id: string): Character {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`unknown character ${id}`);
  return found;
}

export const STARTERS = ["robot", "knight", "flora"] as const;

export function statsFor(c: Character, level: number) {
  const lv = Math.max(1, Math.min(10, level));
  return {
    hp: Math.round(c.hp * (1 + (lv - 1) * 0.12)),
    atk: Math.round(c.atk * (1 + (lv - 1) * 0.1)),
    def: Math.round(c.def * (1 + (lv - 1) * 0.08)),
    spd: c.spd,
  };
}

export function powerOf(c: Character, level: number) {
  const s = statsFor(c, level);
  return s.hp + s.atk * 5 + s.def * 4 + s.spd * 3;
}

export function levelCost(level: number) {
  return 40 + (level - 1) * 25;
}

export type Synergy = { id: string; name: string; desc: string };

export function synergiesOf(ids: string[]): Synergy[] {
  const roles = ids.map((id) => characterById(id).role);
  const has = (r: Role) => roles.includes(r);
  const list: Synergy[] = [];
  if (has("tank") && has("healer")) {
    list.push({ id: "wall", name: "坚壁", desc: "生命 +15%，防御 +10%" });
  }
  if (has("assassin") && has("archer")) {
    list.push({ id: "burst", name: "爆裂", desc: "攻击 +18%" });
  }
  if (has("mage") && (has("support") || has("healer"))) {
    list.push({ id: "star", name: "星辉", desc: "开场能量 +30" });
  }
  if (new Set(roles).size >= 3) {
    list.push({ id: "mix", name: "百搭", desc: "生命与攻击 +6%" });
  }
  return list;
}

export function synergyMods(ids: string[]) {
  const names = new Set(synergiesOf(ids).map((s) => s.id));
  return {
    hp: (names.has("wall") ? 1.15 : 1) * (names.has("mix") ? 1.06 : 1),
    atk: (names.has("burst") ? 1.18 : 1) * (names.has("mix") ? 1.06 : 1),
    def: names.has("wall") ? 1.1 : 1,
    energy: names.has("star") ? 30 : 0,
  };
}
