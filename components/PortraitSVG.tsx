// 角色抽象 SVG 立绘（无 seedream 时的兜底）
// 4 角色各一套：轮廓 + 主题色调 + 主题装饰
import type { CharacterMeta } from "@/lib/ai/characters";

interface PortraitSVGProps {
  character: CharacterMeta;
  className?: string;
}

export function PortraitSVG({ character, className = "" }: PortraitSVGProps) {
  switch (character.id) {
    case "lin-xu-bai":
      return <LinPortrait className={className} />;
    case "zhou-mu":
      return <ZhouPortrait className={className} />;
    case "jiang-yu":
      return <JiangPortrait className={className} />;
    case "xia-ye":
      return <XiaPortrait className={className} />;
  }
}

// === 林叙白 - 薄暮阳台 + 相机 + 衬衣领 ===
function LinPortrait({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="lin-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9A87C" />
          <stop offset="50%" stopColor="#8B6F47" />
          <stop offset="100%" stopColor="#3D2A4A" />
        </linearGradient>
        <linearGradient id="lin-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8DCC4" />
          <stop offset="100%" stopColor="#A89478" />
        </linearGradient>
        <linearGradient id="lin-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.4)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* 背景 */}
      <rect width="200" height="260" fill="url(#lin-bg)" />

      {/* 屋顶剪影 */}
      <path
        d="M0 200 L40 200 L40 195 L60 195 L60 200 L100 200 L100 190 L120 190 L120 200 L200 200 L200 260 L0 260 Z"
        fill="rgba(45, 25, 50, 0.7)"
      />

      {/* 远景夕阳 */}
      <circle cx="160" cy="120" r="22" fill="rgba(255, 220, 180, 0.4)" />
      <circle cx="160" cy="120" r="14" fill="rgba(255, 200, 150, 0.6)" />

      {/* 身体（衬衫） */}
      <path
        d="M50 260 L50 200 Q50 180 70 175 L85 170 L100 175 L115 170 L130 175 Q150 180 150 200 L150 260 Z"
        fill="url(#lin-shirt)"
      />

      {/* 颈 */}
      <rect x="85" y="155" width="30" height="25" fill="#D4B896" />

      {/* 脸 */}
      <ellipse cx="100" cy="125" rx="32" ry="40" fill="#D4B896" />

      {/* 发（深棕，微长） */}
      <path
        d="M68 110 Q70 80 100 78 Q130 80 132 110 Q132 100 130 95 Q120 88 100 88 Q80 88 70 95 Q68 100 68 110 Z"
        fill="#3D2817"
      />
      {/* 头发两侧盖过耳 */}
      <path
        d="M68 110 Q65 130 70 150 L75 145 Q72 130 75 115 Z"
        fill="#3D2817"
      />
      <path
        d="M132 110 Q135 130 130 150 L125 145 Q128 130 125 115 Z"
        fill="#3D2817"
      />

      {/* 眼（温柔下垂） */}
      <path
        d="M82 120 Q88 122 94 120"
        stroke="#2A1F1A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M106 120 Q112 122 118 120"
        stroke="#2A1F1A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 瞳孔（深棕） */}
      <circle cx="88" cy="123" r="1.5" fill="#2A1F1A" />
      <circle cx="112" cy="123" r="1.5" fill="#2A1F1A" />

      {/* 鼻 */}
      <path
        d="M100 130 L98 142 L102 142"
        stroke="#A89478"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* 嘴（轻抿） */}
      <path
        d="M92 152 Q100 154 108 152"
        stroke="#7A5C3A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 百叶窗条纹阴影（横在脸上） */}
      <g opacity="0.18">
        <rect x="0" y="100" width="200" height="2" fill="#2A1F1A" />
        <rect x="0" y="115" width="200" height="2" fill="#2A1F1A" />
        <rect x="0" y="130" width="200" height="2" fill="#2A1F1A" />
        <rect x="0" y="145" width="200" height="2" fill="#2A1F1A" />
        <rect x="0" y="160" width="200" height="2" fill="#2A1F1A" />
      </g>

      {/* 手中的相机（Leica M6 风格） */}
      <rect x="118" y="190" width="32" height="22" fill="#1A1A1A" rx="2" />
      <circle cx="134" cy="201" r="8" fill="#0A0A0A" />
      <circle cx="134" cy="201" r="5" fill="#2A2A2A" />
      <circle cx="134" cy="201" r="2" fill="#8B6F47" />

      {/* 胶片噪点 */}
      <rect width="200" height="260" fill="url(#lin-noise)" opacity="0.2" />
    </svg>
  );
}

// === 周牧野 - 深夜书房 + 西装 + 冷光 ===
function ZhouPortrait({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="zhou-bg" cx="0.3" cy="0.2" r="0.8">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="50%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>
        <linearGradient id="zhou-suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A1A" />
          <stop offset="100%" stopColor="#0A0A0A" />
        </linearGradient>
      </defs>

      <rect width="200" height="260" fill="url(#zhou-bg)" />

      {/* 抽象画背景 */}
      <rect x="20" y="20" width="60" height="40" fill="rgba(255,255,255,0.05)" />
      <line x1="30" y1="30" x2="70" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="35" y1="40" x2="65" y2="30" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* 台灯光晕 */}
      <ellipse cx="50" cy="100" rx="60" ry="80" fill="rgba(255, 245, 220, 0.08)" />

      {/* 西装（黑色） */}
      <path
        d="M40 260 L40 200 Q40 175 65 170 L100 168 L135 170 Q160 175 160 200 L160 260 Z"
        fill="url(#zhou-suit)"
      />

      {/* 衬衫领（白） */}
      <path
        d="M85 168 L100 200 L115 168 L100 175 Z"
        fill="#E8E8E8"
      />

      {/* 颈（冷白） */}
      <rect x="88" y="155" width="24" height="20" fill="#E8DDD0" />

      {/* 脸（轮廓分明） */}
      <ellipse cx="100" cy="125" rx="30" ry="38" fill="#E8DDD0" />

      {/* 短发（黑，利落） */}
      <path
        d="M70 110 Q72 82 100 80 Q128 82 130 110 L130 100 Q128 92 100 90 Q72 92 70 100 Z"
        fill="#0A0A0A"
      />

      {/* 眉（硬朗） */}
      <path
        d="M80 116 L94 114"
        stroke="#0A0A0A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M106 114 L120 116"
        stroke="#0A0A0A"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 眼（深邃，直视） */}
      <ellipse cx="87" cy="125" rx="3" ry="1.5" fill="#0A0A0A" />
      <ellipse cx="113" cy="125" rx="3" ry="1.5" fill="#0A0A0A" />
      <circle cx="87" cy="125" r="0.8" fill="#FFFFFF" />
      <circle cx="113" cy="125" r="0.8" fill="#FFFFFF" />

      {/* 鼻（挺） */}
      <path
        d="M100 132 L97 145 L103 145"
        stroke="#8A7A6A"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 嘴（紧抿） */}
      <path
        d="M92 155 L108 155"
        stroke="#5A4A3A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 下颌阴影 */}
      <path
        d="M75 145 Q100 168 125 145 L125 155 Q100 175 75 155 Z"
        fill="rgba(0,0,0,0.15)"
      />

      {/* 噪点 */}
      <rect width="200" height="260" fill="url(#lin-noise)" opacity="0.15" />
    </svg>
  );
}

// === 江屿 - 机房 + 黑帽衫 + 屏幕光 ===
function JiangPortrait({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="jiang-bg" cx="0.5" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="40%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#062543" />
        </radialGradient>
        <linearGradient id="jiang-hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0A0A" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>

      <rect width="200" height="260" fill="url(#jiang-bg)" />

      {/* 屏幕终端代码（背景） */}
      <g opacity="0.18" fontFamily="monospace" fontSize="5" fill="#93C5FD">
        <text x="10" y="30">{"> npm run dev"}</text>
        <text x="10" y="42">{"> ready on :3000"}</text>
        <text x="10" y="54">{"> build 200ms"}</text>
        <text x="10" y="66">{"> GET /api/chat"}</text>
        <text x="10" y="78">{"  ✓ ok"}</text>
        <text x="10" y="200">{"$ ▎"}</text>
        <text x="10" y="220">{"  int x = 0;"}</text>
        <text x="10" y="232">{"  return x;"}</text>
        <text x="10" y="244">{"}"}</text>
      </g>

      {/* 帽衫 */}
      <path
        d="M40 260 L40 200 Q40 175 65 170 L100 165 L135 170 Q160 175 160 200 L160 260 Z"
        fill="url(#jiang-hoodie)"
      />

      {/* 帽沿 */}
      <path
        d="M65 170 Q75 160 100 158 Q125 160 135 170 Z"
        fill="#000000"
      />

      {/* 颈（暗） */}
      <rect x="88" y="155" width="24" height="18" fill="#5A4030" />

      {/* 脸 */}
      <ellipse cx="100" cy="125" rx="30" ry="38" fill="#D4B896" />

      {/* 头发（蓬乱） */}
      <path
        d="M68 110 Q70 80 100 78 Q130 80 132 110 Q130 95 122 92 L115 88 L105 92 L95 88 L85 92 L78 92 Q72 95 68 110 Z"
        fill="#1A1A1A"
      />

      {/* 眼镜（黑框，方形） */}
      <rect x="76" y="120" width="18" height="14" fill="none" stroke="#0A0A0A" strokeWidth="1.5" rx="2" />
      <rect x="106" y="120" width="18" height="14" fill="none" stroke="#0A0A0A" strokeWidth="1.5" rx="2" />
      <line x1="94" y1="126" x2="106" y2="126" stroke="#0A0A0A" strokeWidth="1.5" />
      {/* 眼镜反光（屏幕代码色） */}
      <rect x="78" y="122" width="14" height="3" fill="rgba(59, 130, 246, 0.5)" />
      <rect x="108" y="122" width="14" height="3" fill="rgba(59, 130, 246, 0.5)" />

      {/* 鼻 */}
      <path
        d="M100 138 L97 148 L103 148"
        stroke="#8A7A6A"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* 嘴（轻抿） */}
      <path
        d="M92 156 Q100 158 108 156"
        stroke="#5A4A3A"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* LED 灯（领口位置） */}
      <circle cx="50" cy="200" r="2" fill="#10B981" opacity="0.8" />
      <circle cx="55" cy="200" r="2" fill="#3B82F6" opacity="0.5" />
      <circle cx="60" cy="200" r="2" fill="#F59E0B" opacity="0.3" />

      {/* 噪点 */}
      <rect width="200" height="260" fill="url(#lin-noise)" opacity="0.2" />
    </svg>
  );
}

// === 夏野 - 天台 + 黄 T 恤 + 太阳 ===
function XiaPortrait({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="xia-bg" cx="0.5" cy="1" r="0.9">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
        <linearGradient id="xia-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      <rect width="200" height="260" fill="url(#xia-bg)" />

      {/* 太阳 */}
      <circle cx="160" cy="60" r="35" fill="rgba(255, 240, 200, 0.6)" />
      <circle cx="160" cy="60" r="22" fill="rgba(255, 230, 150, 0.9)" />

      {/* 屋顶剪影 */}
      <path
        d="M0 220 L30 220 L30 215 L50 215 L50 220 L100 220 L100 210 L130 210 L130 220 L200 220 L200 260 L0 260 Z"
        fill="rgba(120, 50, 10, 0.5)"
      />

      {/* T 恤（黄） */}
      <path
        d="M40 260 L40 200 Q40 180 60 175 L80 172 L100 175 L120 172 L140 175 Q160 180 160 200 L160 260 Z"
        fill="url(#xia-shirt)"
      />
      {/* 领口 */}
      <ellipse cx="100" cy="172" rx="15" ry="4" fill="rgba(180, 100, 20, 0.3)" />

      {/* 颈 */}
      <rect x="88" y="155" width="24" height="20" fill="#C49860" />

      {/* 脸（古铜色） */}
      <ellipse cx="100" cy="125" rx="30" ry="38" fill="#C49860" />

      {/* 头发（短，晒色） */}
      <path
        d="M70 110 Q72 82 100 80 Q128 82 130 110 Q128 95 100 90 Q72 95 70 110 Z"
        fill="#3D2817"
      />

      {/* 眉（飞起，活泼） */}
      <path
        d="M80 115 Q88 113 94 116"
        stroke="#2A1F0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M106 116 Q112 113 120 115"
        stroke="#2A1F0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 眼（笑，弯月） */}
      <path
        d="M82 125 Q88 130 94 125"
        stroke="#2A1F0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M106 125 Q112 130 118 125"
        stroke="#2A1F0A"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* 鼻 */}
      <path
        d="M100 134 L98 144 L102 144"
        stroke="#8A6840"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />

      {/* 嘴（大笑，露出牙） */}
      <path
        d="M85 152 Q100 168 115 152 Q100 162 85 152 Z"
        fill="#FFFFFF"
        stroke="#5A2A0A"
        strokeWidth="1.5"
      />
      <path d="M88 156 L112 156" stroke="#5A2A0A" strokeWidth="0.5" />

      {/* 耳机（颈上） */}
      <path
        d="M75 160 Q70 170 75 178"
        stroke="#1A1A1A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M125 160 Q130 170 125 178"
        stroke="#1A1A1A"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="75" cy="180" rx="6" ry="8" fill="#1A1A1A" />
      <ellipse cx="125" cy="180" rx="6" ry="8" fill="#1A1A1A" />

      {/* 噪点（胶片感） */}
      <rect width="200" height="260" fill="url(#lin-noise)" opacity="0.25" />
    </svg>
  );
}
