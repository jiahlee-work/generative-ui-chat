const openUILabels = new Map([
  ["Something went wrong", "문제가 발생했습니다."],
  ["New Chat", "새 채팅"],
  ["New chat", "새 채팅"],
  ["Collapse sidebar", "사이드바 접기"],
  ["Open sidebar", "사이드바 열기"],
]);

export function getLocalizedOpenUILabel(label: string) {
  return openUILabels.get(label) ?? label;
}
