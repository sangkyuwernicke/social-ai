import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "소셜 AI - 페르소나 기반 Instagram 마케팅",
  description: "AI와 대화로 타겟 페르소나를 구축하고 Instagram 홍보 자료를 자동 생성합니다",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
