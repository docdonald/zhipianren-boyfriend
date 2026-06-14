import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // === 角色专属色板（与 characters.ts palette 同步）===
      colors: {
        // 林叙白 - 暗夜守望者
        lin: {
          primary: "#8B6F47",
          secondary: "#C9A87C",
          ink: "#2A1F1A",
          paper: "#F5EFE6",
          dark: "#3D2A4A",
        },
        // 周牧野 - 炼金术士
        zhou: {
          primary: "#1A1A1A",
          secondary: "#4A4A4A",
          ink: "#000000",
          paper: "#E8E8E8",
          dark: "#0A0A0A",
        },
        // 江屿 - 工程师
        jiang: {
          primary: "#3B82F6",
          secondary: "#93C5FD",
          ink: "#0F172A",
          paper: "#F1F5F9",
          dark: "#062543",
        },
        // 夏野 - 逃跑者
        xia: {
          primary: "#F59E0B",
          secondary: "#FCD34D",
          ink: "#451A03",
          paper: "#FFFBEB",
          dark: "#B45309",
        },
      },
      // === 字体 ===
      fontFamily: {
        // 中文衬线 - 文学感、章节体
        serif: [
          '"LXGW WenKai"',
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          "Georgia",
          "serif",
        ],
        // 中文正文
        sans: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          "system-ui",
          "sans-serif",
        ],
        // 等宽 - 终端 / 江屿
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"SF Mono"',
          "ui-monospace",
          "monospace",
        ],
      },
      // === 动画 ===
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-slow": "fadeIn 1.2s ease-out",
        "fade-in-up": "fadeInUp 0.8s ease-out",
        "type-writer": "typeWriter 0.3s steps(20) forwards",
        "blink": "blink 1s step-end infinite",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "roll-in": "rollIn 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        typeWriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        blink: {
          "0%, 50%, 100%": { opacity: "1" },
          "25%, 75%": { opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.02)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        rollIn: {
          "0%": { transform: "translateX(-100%) rotate(-5deg)", opacity: "0" },
          "100%": { transform: "translateX(0) rotate(0)", opacity: "1" },
        },
      },
      // === 背景与图案 ===
      backgroundImage: {
        // 胶片噪点
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.4 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        // 细网格
        "grid":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        // 横线
        "lines":
          "repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.03) 23px, rgba(255,255,255,0.03) 24px)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      // === 字体大小（含中文呼吸）===
      fontSize: {
        "display": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "title": ["clamp(1.75rem, 4vw, 3rem)", { lineHeight: "1.2" }],
        "verse": ["1.125rem", { lineHeight: "2" }],
      },
      // === 间距 ===
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      // === 自定义工具类 ===
      boxShadow: {
        "glow-lin": "0 0 30px rgba(201, 168, 124, 0.4)",
        "glow-zhou": "0 0 30px rgba(74, 74, 74, 0.6)",
        "glow-jiang": "0 0 30px rgba(59, 130, 246, 0.4)",
        "glow-xia": "0 0 30px rgba(252, 211, 77, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
