// 亲密度进度条（6 阶段）
interface IntimacyBarProps {
  stage: number;
  maxStage?: number;
}

export default function IntimacyBar({ stage, maxStage = 6 }: IntimacyBarProps) {
  const percent = Math.min(100, (stage / maxStage) * 100);
  return (
    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-white/70 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
