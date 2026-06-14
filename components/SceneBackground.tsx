// G4 - 角色专属场景背景
// 4 角色各一个：黄昏阳台 / 深夜书房 / 凌晨机房 / 黄昏天台

import type { SceneMeta } from "@/lib/ai/characters";

interface SceneBackgroundProps {
  scene: SceneMeta;
  className?: string;
}

export default function SceneBackground({ scene, className = "" }: SceneBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* 渐变底色 */}
      <div
        className="absolute inset-0"
        style={{ background: scene.gradient }}
      />

      {/* 装饰元素 */}
      {scene.ornament === "blinds" && <BlindsOrnament />}
      {scene.ornament === "desk" && <DeskOrnament />}
      {scene.ornament === "servers" && <ServersOrnament />}
      {scene.ornament === "rooftop" && <RooftopOrnament />}

      {/* 噪点叠层 */}
      <div className="absolute inset-0 bg-noise opacity-40 mix-blend-overlay" />
    </div>
  );
}

// === 林叙白 - 薄暮阳台 / 百叶窗条纹 ===
function BlindsOrnament() {
  return (
    <>
      {/* 百叶窗条纹 */}
      <div className="absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-3 bg-gradient-to-b from-black/40 via-black/20 to-transparent"
            style={{ top: `${i * 8}%` }}
          />
        ))}
      </div>
      {/* 远景屋顶 */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-30"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 80 L20 80 L20 70 L40 70 L40 80 L60 80 L60 65 L80 65 L80 80 L120 80 L120 75 L140 75 L140 80 L200 80 L200 100 L0 100 Z"
          fill="#2A1F2A"
        />
      </svg>
      {/* 落日 */}
      <div
        className="absolute right-12 top-16 w-20 h-20 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,220,180,0.6) 0%, transparent 70%)",
          filter: "blur(2px)",
        }}
      />
      {/* 飞鸟 */}
      <svg className="absolute right-8 top-20 w-8 h-4 opacity-40" viewBox="0 0 30 10">
        <path d="M0 5 Q5 0 10 5 Q15 0 20 5" stroke="#2A1F1A" strokeWidth="0.5" fill="none" />
        <path d="M12 7 Q17 3 22 7 Q27 3 30 7" stroke="#2A1F1A" strokeWidth="0.5" fill="none" />
      </svg>
    </>
  );
}

// === 周牧野 - 深夜书房 / 桌 + 灯 + 抽象画 ===
function DeskOrnament() {
  return (
    <>
      {/* 抽象画（墙） */}
      <div className="absolute top-12 left-8 w-32 h-24 border border-white/10 opacity-30">
        <svg viewBox="0 0 100 70" className="w-full h-full">
          <line x1="10" y1="10" x2="60" y2="55" stroke="white" strokeWidth="0.5" opacity="0.6" />
          <line x1="20" y1="5" x2="80" y2="50" stroke="white" strokeWidth="0.5" opacity="0.4" />
          <line x1="40" y1="0" x2="90" y2="60" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <rect x="60" y="20" width="30" height="40" fill="rgba(255,255,255,0.05)" />
        </svg>
      </div>

      {/* 冷白台灯光晕 */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(220, 235, 255, 0.4) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />

      {/* 三屏显示器（底部） */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end gap-1 opacity-30">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gradient-to-b from-blue-900/40 to-black/80 border border-white/10"
            style={{
              width: "20%",
              height: i === 2 ? "30%" : "22%",
              minHeight: "40px",
            }}
          >
            <div className="p-1 text-[6px] text-blue-300/50 font-mono">
              <div>$ deploy</div>
              <div>ok</div>
            </div>
          </div>
        ))}
      </div>

      {/* 威士忌杯 */}
      <div className="absolute bottom-32 right-12 w-8 h-12 opacity-40">
        <div className="w-full h-full bg-gradient-to-b from-amber-700/60 to-amber-900/80 rounded-b-full rounded-t-sm border border-amber-600/30" />
      </div>
    </>
  );
}

// === 江屿 - 凌晨机房 / 服务器机柜 ===
function ServersOrnament() {
  return (
    <>
      {/* 服务器机柜（背景） */}
      <div className="absolute inset-0 opacity-25">
        {Array.from({ length: 8 }).map((_, col) => (
          <div
            key={col}
            className="absolute top-0 bottom-0 w-12 border border-blue-900/30"
            style={{ left: `${col * 12}%` }}
          >
            {Array.from({ length: 12 }).map((_, row) => (
              <div
                key={row}
                className="h-4 border-b border-blue-900/20 flex items-center px-1"
              >
                <div
                  className="w-1 h-1 rounded-full animate-pulse-soft"
                  style={{
                    backgroundColor: row % 3 === 0 ? "#10B981" : row % 3 === 1 ? "#3B82F6" : "#F59E0B",
                    animationDelay: `${(col + row) * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 终端窗口 */}
      <div className="absolute top-1/4 right-8 w-48 h-32 opacity-20 border border-white/10 rounded">
        <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
        </div>
        <div className="p-2 font-mono text-[6px] text-green-300/60 leading-tight">
          <div>{"> npm run dev"}</div>
          <div>{"> ready on :3000"}</div>
          <div>{"> 200 OK"}</div>
          <div className="term-cursor">{}</div>
        </div>
      </div>

      {/* 散落的代码（漂浮） */}
      <div className="absolute top-12 left-8 font-mono text-[7px] text-blue-400/30 leading-tight">
        <div>const love = () ={">"} {"{"}</div>
        <div>  if (you) {"return"} me;</div>
        <div>{"}"}</div>
      </div>

      {/* 屏幕反光 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.2) 50%, transparent 100%)",
        }}
      />
    </>
  );
}

// === 夏野 - 黄昏天台 / 太阳 + 音箱 + 城市 ===
function RooftopOrnament() {
  return (
    <>
      {/* 太阳（已贴底） */}
      <div
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,240,200,0.7) 0%, transparent 60%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,220,150,1) 0%, rgba(255,200,120,0.4) 40%, transparent 80%)",
        }}
      />

      {/* 远处城市剪影 */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full opacity-40"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50 L10 50 L10 35 L20 35 L20 50 L30 50 L30 25 L40 25 L40 50 L50 50 L50 30 L60 30 L60 50 L75 50 L75 20 L85 20 L85 50 L100 50 L100 40 L115 40 L115 50 L130 50 L130 28 L140 28 L140 50 L155 50 L155 35 L170 35 L170 50 L185 50 L185 30 L200 30 L200 60 L0 60 Z"
          fill="#7A2D0A"
        />
      </svg>

      {/* 蓝牙音箱（角落） */}
      <div className="absolute bottom-32 right-12 w-12 h-16 opacity-30">
        <div className="w-full h-full bg-black rounded-lg border border-white/20" />
        <div className="absolute inset-2 grid grid-cols-4 gap-0.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white/30" />
          ))}
        </div>
      </div>

      {/* 啤酒罐 */}
      <div className="absolute bottom-24 right-28 w-4 h-8 opacity-50">
        <div className="w-full h-full bg-gradient-to-b from-yellow-200 to-amber-600 rounded-sm" />
      </div>

      {/* 飘动的云 */}
      <div className="absolute top-12 left-12 w-24 h-4 opacity-30">
        <div className="w-full h-full bg-white rounded-full blur-md" />
      </div>
      <div className="absolute top-20 right-20 w-20 h-3 opacity-25">
        <div className="w-full h-full bg-white rounded-full blur-md" />
      </div>
    </>
  );
}
