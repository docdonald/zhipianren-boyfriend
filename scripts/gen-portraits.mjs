// 批量生成四角色动漫风格基准图
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function readEnvLocal(key) {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
    return match?.[1]?.trim();
  } catch (e) {
    console.error(`readEnvLocal failed for ${key}:`, e.message);
    return undefined;
  }
}

const API_KEY = readEnvLocal("ARK_API_KEY");
const MODEL = readEnvLocal("SEEDREAM_IMAGE_MODEL") || "doubao-seedream-4-0-250828";
const BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";

if (!API_KEY) {
  console.error("❌ ARK_API_KEY not found in .env.local");
  process.exit(1);
}

const CHARACTERS = [
  {
    id: "lin-xu-bai",
    name: "林叙白",
    prompt: `日系动漫风格半身像，温柔型年轻男性，黑色短发微卷，眼尾下垂的温柔眼睛，穿着米白色亚麻衬衫，站在黄昏阳台，手里拿着一台复古胶片相机，百叶窗透进暖金色光线，背景是城市黄昏天际线，anime style, 2D illustration, manga art, cel shading, vibrant colors, high quality anime artwork, detailed anime face, beautiful lighting, digital painting, soft warm tones, romantic atmosphere, studio ghibli inspired`,
  },
  {
    id: "zhou-mu",
    name: "周牧野",
    prompt: `日系动漫风格半身像，成熟型男性，黑色短发整齐向后梳，锐利深邃的眼睛，戴着细框眼镜，穿着深色西装马甲和白色衬衫，领口微松，坐在深夜书房，手里握着一杯威士忌，背后是三台显示代码和图表的显示器，屏幕蓝光反射在脸上，anime style, 2D illustration, manga art, cel shading, cool tones, high quality anime artwork, detailed anime face, dramatic lighting, digital painting, mysterious atmosphere, dark academia aesthetic`,
  },
  {
    id: "jiang-yu",
    name: "江屿",
    prompt: `日系动漫风格半身像，少年感理工男，黑色短发略凌乱，戴着黑框眼镜（镜片反射绿色代码光），穿着黑色连帽卫衣，坐在凌晨的机房，面前是三台显示器显示终端日志，机柜LED灯闪烁，蓝色冷调为主，anime style, 2D illustration, manga art, cel shading, neon blue lighting, high quality anime artwork, detailed anime face, cyberpunk atmosphere, digital painting, tech aesthetic, cool blue tones`,
  },
  {
    id: "xia-ye",
    name: "夏野",
    prompt: `日系动漫风格半身像，阳光运动型少年，晒成小麦色的皮肤，灿烂笑容露出牙齿，短发清爽，脖子上挂着白色无线耳机，穿着亮黄色oversize T恤，站在成都天台，手里拿着一罐冰啤酒，背后是城市黄昏和金色夕阳，天空染成橙黄色，anime style, 2D illustration, manga art, cel shading, warm golden lighting, high quality anime artwork, detailed anime face, joyful atmosphere, digital painting, summer vibes, warm orange tones`,
  },
];

async function generateImage(prompt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(`${BASE_URL}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        size: "2K",
        response_format: "url",
        stream: false,
        watermark: true,
        sequential_image_generation: "disabled",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
    }

    const json = await response.json();
    return json.data?.[0]?.url;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function downloadImage(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`  💾 Saved ${buffer.length} bytes → ${outputPath}`);
}

async function main() {
  console.log(`\n🎨 生成 4 张动漫风格角色基准图`);
  console.log(`   Model: ${MODEL}\n`);

  for (const char of CHARACTERS) {
    const outputPath = resolve(process.cwd(), "public", "characters", `${char.id}.png`);
    console.log(`[${char.name}] 生成中...`);

    try {
      const url = await generateImage(char.prompt);
      if (!url) {
        console.error(`  ❌ ${char.name}: 无图片 URL`);
        continue;
      }
      console.log(`  ✅ 生成成功: ${url.slice(0, 60)}...`);
      await downloadImage(url, outputPath);
    } catch (err) {
      console.error(`  ❌ ${char.name}: ${err.message}`);
    }
  }

  console.log(`\n🎉 全部完成！`);
}

main();
