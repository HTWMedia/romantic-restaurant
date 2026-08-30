// 章节与剧情数据：纯数据驱动，改这里就能加章节/改目标/改文案。
export interface DialogueLine {
  who: string;
  emoji: string;
  artKey: string;
  text: string;
}

export type GoalKind = 'revenue' | 'served' | 'happy';

export interface ChapterGoal {
  kind: GoalKind;
  target: number;
  label: string;
}

export interface Chapter {
  id: number;
  title: string;
  intro: DialogueLine[];
  goals: ChapterGoal[];
  reward: { coins: number };
  outro: DialogueLine[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: '继承破店',
    intro: [
      { who: '旁白', emoji: '📖', artKey: 'icon-narrator', text: '你叫小柒，刚结束一段糟糕的婚姻。带着女儿糖糖，你盘下了这家濒临倒闭的小餐厅。' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '从今天起，这家店就叫"暖柒餐厅"。我们要重新开始！' },
      { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '妈妈加油！我最爱吃你做的薯条啦~' },
    ],
    goals: [
      { kind: 'revenue', target: 200, label: '累计营业额达到 200 🪙' },
      { kind: 'served', target: 8, label: '成功招待 8 位顾客' },
    ],
    reward: { coins: 50 },
    outro: [
      { who: '老周', emoji: '🧑', artKey: 'char-laozhou', text: '哟，新老板？给我来份薯条——哎还行，以后常来！' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '第一位熟客……这条路，走对了。' },
    ],
  },
  {
    id: 2,
    title: '招牌菜',
    intro: [
      { who: '阿婶', emoji: '👵', artKey: 'char-ashen', text: '小柒啊，光卖薯条留不住人，得有道拿手菜。' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '那我就研发一道"暖柒汉堡"！' },
    ],
    goals: [
      { kind: 'revenue', target: 600, label: '累计营业额达到 600 🪙' },
      { kind: 'served', target: 20, label: '成功招待 20 位顾客' },
      { kind: 'happy', target: 10, label: '让 10 位顾客满意离店（满意度≥70）' },
    ],
    reward: { coins: 120 },
    outro: [
      { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '妈妈的汉堡是全天下最好吃的！' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '招牌立住了，下一站，让整条街都知道我们。' },
    ],
  },
  {
    id: 3,
    title: '小有名气',
    intro: [
      { who: '老周', emoji: '🧑', artKey: 'char-laozhou', text: '现在中午都得排队咯，小柒你行啊。' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '想把店面再扩一扩，招待更多客人。' },
    ],
    goals: [
      { kind: 'revenue', target: 1500, label: '累计营业额达到 1500 🪙' },
      { kind: 'served', target: 40, label: '成功招待 40 位顾客' },
      { kind: 'happy', target: 25, label: '让 25 位顾客满意离店' },
    ],
    reward: { coins: 250 },
    outro: [
      { who: '阿婶', emoji: '👵', artKey: 'char-ashen', text: '当年那家要倒的破店，如今成了街角最暖的光。' },
    ],
  },
  {
    id: 4,
    title: '连锁梦想',
    intro: [
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '糖糖，妈妈想开第二家店了。' },
      { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '那我能当小老板娘吗？' },
    ],
    goals: [
      { kind: 'revenue', target: 3500, label: '累计营业额达到 3500 🪙' },
      { kind: 'served', target: 80, label: '成功招待 80 位顾客' },
      { kind: 'happy', target: 50, label: '让 50 位顾客满意离店' },
    ],
    reward: { coins: 500 },
    outro: [
      { who: '旁白', emoji: '📖', artKey: 'icon-narrator', text: '第二家"暖柒"在城东亮灯，排队的人里，有当年和你一样迷茫的人。' },
    ],
  },
  {
    id: 5,
    title: '圆满',
    intro: [
      { who: '老周', emoji: '🧑', artKey: 'char-laozhou', text: '听说你要开第五家了？' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '不是为钱。是想让更多孤单的人，有处可去、有饭可暖。' },
    ],
    goals: [
      { kind: 'revenue', target: 7000, label: '累计营业额达到 7000 🪙' },
      { kind: 'served', target: 150, label: '成功招待 150 位顾客' },
      { kind: 'happy', target: 100, label: '让 100 位顾客满意离店' },
    ],
    reward: { coins: 1000 },
    outro: [
      { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '妈妈，我以你为荣。' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '谢谢你，陪妈妈把日子，重新过成了想要的样子。' },
    ],
  },
];
// 合成台解锁新菜时的剧情反应：合成台是"小柒研发新菜"的工坊，
// 每条链的最终菜解锁时，由店里的人给出一句回应，把玩法挂回经营叙事。
export const DISH_UNLOCK_SCRIPT: Record<string, DialogueLine[]> = {
  pizza: [
    { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '蔬菜披萨出炉！从一棵生菜到一张披萨，我们的研发台立功了。' },
    { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '披萨上有小森林耶！妈妈我可以吃第一块吗？' },
  ],
  steak: [
    { who: '老周', emoji: '🧑', artKey: 'char-laozhou', text: '哟，菜单悄悄换了？这牛排的火候……有点当年老店的意思了。' },
    { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '老周叔这张嘴能认可，合成台上蹲的这几天就没白费！' },
  ],
  dessert: [
    { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '甜品像云朵一样软！妈妈是魔法师吗？' },
    { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '傻瓜，新招牌要让日子也甜一点呀。' },
  ],
  pasta: [
    { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '奶酪意面出锅！从一团面团到一盘意面，我们真的做到了。' },
    { who: '老周', emoji: '🧑', artKey: 'char-laozhou', text: '给我来一份，吃完写进"老周食记"里。' },
  ],
};
