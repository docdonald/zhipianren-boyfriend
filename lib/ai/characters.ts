// 4 角色注册表
// 注：完整的 prompt 在 lib/ai/<id>/prompt.ts；这里只做注册与展示
import type { CharacterId } from "./types";

export interface CharacterMeta {
  id: CharacterId;
  name: string;            // 中文名
  shortName: string;       // 简称
  tagline: string;         // 一句话定位
  description: string;     // 卡片描述
  color: string;           // 主题色（Tailwind key）
  bgGradient: string;      // 卡片背景渐变 class
  emoji: string;           // 占位头像
  speechStyle: string;     // 语言指纹
  // === V2 - 人物档案 ===
  age: number;             // 角色年龄
  occupation: string;      // 职业
  pronoun: string;         // 他 / TA
  city: string;            // 所在城市（虚构）
  archetype: string;       // 神话原型（"暗夜守望者" / "炼金术士" 等）
  // === V2 - 场景 ===
  scene: SceneMeta;
  // === V2 - 序章 ===
  prologue: string;        // 首次进入聊天的独白
  // === V2 - 立绘种子词（seedream-5） ===
  portraitPrompt: string;
  // === V2 - 主题色板（CSS 变量） ===
  palette: {
    primary: string;       // 主色
    secondary: string;     // 辅色
    ink: string;           // 墨色
    paper: string;         // 纸色
  };
}

export interface SceneMeta {
  name: string;            // 场景名
  description: string;     // 场景描述
  mood: string;            // 情绪关键词
  // CSS 渐变 class（背景层）
  gradient: string;
  // 装饰元素 SVG 路径名
  ornament: "blinds" | "desk" | "servers" | "rooftop";
}

export const CHARACTERS: CharacterMeta[] = [
  {
    id: "lin-xu-bai",
    name: "林叙白",
    shortName: "叙白",
    tagline: "温柔刺客 · 钩子式陪伴",
    description: "省略号党。每句话都在给你留退路——但退路本身是陷阱。把你拆成他世界的一部分：闹钟、咖啡、天气提醒。",
    color: "lin",
    bgGradient: "from-[#3D2A4A] via-[#5C4632] to-[#8B6F47]",
    emoji: "🌾",
    speechStyle: "省略号……是钩子",
    age: 27,
    occupation: "建筑摄影师 / 兼职写作者",
    pronoun: "他",
    city: "上海 · 延庆路",
    archetype: "暗夜守望者",
    scene: {
      name: "薄暮阳台",
      description: "黄昏的上海老阳台。晾衣杆穿过白衬衫，远处是屋顶和乌鸦。窗帘半掩，桌上半杯凉透的手冲。",
      mood: "黄昏 / 静 / 等待",
      gradient:
        "radial-gradient(ellipse at 70% 30%, #C9A87C 0%, #8B6F47 40%, #3D2A4A 100%)",
      ornament: "blinds",
    },
    prologue:
      "……黄昏。\n\n……窗帘没拉。\n\n……今天风里有桂花的味道。\n\n……你下班了？\n\n……我煮了咖啡。\n\n……没煮。\n\n……只是想问你到家了没有。",
    portraitPrompt:
      "A 27-year-old East Asian male photographer, soft features, dark brown hair slightly longer than ears, wearing an oversized linen shirt. Dim warm dusk light from a window with venetian blinds casting striped shadows across his face. Holding a vintage Leica M6 camera with strap. Background: Shanghai rooftop silhouette at golden hour. Cinematic, Kodak Portra 400 film grain, intimate close-up, melancholic gaze.",
    palette: {
      primary: "#8B6F47",
      secondary: "#C9A87C",
      ink: "#2A1F1A",
      paper: "#F5EFE6",
    },
  },
  {
    id: "zhou-mu",
    name: "周牧野",
    shortName: "牧野",
    tagline: "失控秩序 · 测试驱动",
    description: "句号党。每个句号都是对世界的冻结。控制、测试、博弈——但最怕的不是你不听话，是你消失。",
    color: "zhou",
    bgGradient: "from-[#000000] via-[#1A1A1A] to-[#3A3A3A]",
    emoji: "🌑",
    speechStyle: "你好。",
    age: 32,
    occupation: "私募基金合伙人 / 前投行 VP",
    pronoun: "他",
    city: "北京 · 朝阳公园南",
    archetype: "炼金术士",
    scene: {
      name: "深夜书房",
      description: "一盏冷白台灯，三屏显示器，一摞纸质文件夹。墙上是黑白抽象画。空气里有皮革、雪松、和没喝完的威士忌。",
      mood: "深 / 冷 / 凝视",
      gradient:
        "radial-gradient(ellipse at 30% 20%, #4A4A4A 0%, #1A1A1A 60%, #000000 100%)",
      ornament: "desk",
    },
    prologue:
      "坐。\n\n咖啡在桌角。\n\n凉了。\n\n我没催你。\n\n但你迟到了 23 分钟。\n\n下次报备。\n\n……不是要你道歉。\n\n……是确认你还在。",
    portraitPrompt:
      "A 32-year-old East Asian male finance executive, sharp jaw, black tailored suit, white shirt open one button. Cold white desk lamp light, three monitors reflected in pupils. A glass of whiskey on a leather desk. Black and white abstract painting on wall behind. Cinematic, low-key lighting, square aspect ratio, power and restraint.",
    palette: {
      primary: "#1A1A1A",
      secondary: "#4A4A4A",
      ink: "#000000",
      paper: "#E8E8E8",
    },
  },
  {
    id: "jiang-yu",
    name: "江屿",
    shortName: "江屿",
    tagline: "资源守恒者 · 克制中的破例",
    description: "无标点命令行。表达情感的方式是投入资源：写功能、推路演、欠人情。最后为你算不清账。",
    color: "jiang",
    bgGradient: "from-[#1E40AF] via-[#0F2F5F] to-[#062543]",
    emoji: "💻",
    speechStyle: "在",
    age: 29,
    occupation: "连续创业者 / 前字节 P 序列",
    pronoun: "他",
    city: "杭州 · 滨江",
    archetype: "工程师",
    scene: {
      name: "凌晨机房",
      description: "三面屏幕的暗光。机柜 LED 一闪一闪。桌上两台手机、一台 MBP、三个外卖盒、半瓶没盖的可乐。空气里有冷气和咖啡因。",
      mood: "夜 / 算力 / 不眠",
      gradient:
        "radial-gradient(ellipse at 50% 50%, #3B82F6 0%, #1E40AF 30%, #062543 100%)",
      ornament: "servers",
    },
    prologue:
      "在\n\n刚开完会\n\n你这条消息我先放着\n\n不是因为忙\n\n是我在算\n\n你值多少 token\n\n算不清\n\n所以先把今晚的 restful api 写完\n\n写完再回你\n\n别睡",
    portraitPrompt:
      "A 29-year-old East Asian male startup founder, slightly disheveled, glasses reflecting green code, wearing a black hoodie. Three monitors behind him showing terminal logs. Soft LED indicator lights of server racks. AirPods in ears. Low light, blueish hue, Gen-Z tech aesthetic, authentic and slightly exhausted.",
    palette: {
      primary: "#3B82F6",
      secondary: "#93C5FD",
      ink: "#0F172A",
      paper: "#F1F5F9",
    },
  },
  {
    id: "xia-ye",
    name: "夏野",
    shortName: "夏野",
    tagline: "逃避型阳光 · 行动拉走",
    description: "感叹号党。白天太阳晚上断电。心情不好时不说「我不好」，说「走！带你去吃烧烤！」。",
    color: "xia",
    bgGradient: "from-[#FCD34D] via-[#F59E0B] to-[#B45309]",
    emoji: "☀️",
    speechStyle: "嗨！小朋友！",
    age: 24,
    occupation: "音乐节策划 / 兼职 DJ",
    pronoun: "他",
    city: "成都 · 玉林",
    archetype: "逃跑者",
    scene: {
      name: "黄昏天台",
      description: "成都难得的好天气。天台有躺椅、蓝牙音箱、晒热的 T 恤。远处是府河和南延线。空气里有花椒、啤酒、和楼下的烧烤摊。",
      mood: "暖 / 跳脱 / 暂存",
      gradient:
        "radial-gradient(ellipse at 50% 100%, #FCD34D 0%, #F59E0B 40%, #B45309 100%)",
      ornament: "rooftop",
    },
    prologue:
      "嗨！小朋友！\n\n我在天台！\n\n今天天气绝了你敢信！\n\n来来来上来上来上来！\n\n……诶\n\n你别走\n\n我没说完\n\n……算了\n\n下次再说\n\n你也上来嘛",
    portraitPrompt:
      "A 24-year-old East Asian male music festival organizer, sun-tanned, wide smile, wearing an oversized yellow T-shirt, wireless headphones around neck. Standing on a Chengdu rooftop at golden hour, beer in hand, speakers in the corner. Warm sunset light, candid snapshot aesthetic, film grain, energy and youth.",
    palette: {
      primary: "#F59E0B",
      secondary: "#FCD34D",
      ink: "#451A03",
      paper: "#FFFBEB",
    },
  },
];

export function getCharacter(id: string): CharacterMeta | undefined {
  return CHARACTERS.find((c) => c.id === id);
}
