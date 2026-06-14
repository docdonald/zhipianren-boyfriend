// /start → 重定向到根路径
// 旧版"翻开第一页"电影海报入口已废弃
// 真正的 4 男友选择 + 免费试用入口在 /
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function StartPage() {
  redirect("/");
}
