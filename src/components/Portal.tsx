"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// fixed 오버레이를 document.body에 직접 그려서, transform이 걸린 조상(예: AiRudaWidget의
// -translate-y-1/2)이 fixed 자식의 containing block이 되어버리는 문제를 피함.
// (transform이 있는 조상은 CSS 스펙상 fixed 자손의 기준 박스가 되어, 뷰포트 전체가 아니라
// 그 조상 박스 안에서만 붙잡혀 화면 오른쪽에서 잘려 보이는 문제가 있었음)
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
