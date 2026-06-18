export function getHasMultilineInput(textarea: HTMLTextAreaElement) {
  if (textarea.value.length === 0) {
    return false;
  }

  if (textarea.value.includes("\n")) {
    return true;
  }

  const inputRow = textarea.closest(".image-composer__input-row");
  const measuringWidth = getSingleLineTextareaWidth(textarea, inputRow);
  const mirror = textarea.cloneNode() as HTMLTextAreaElement;
  mirror.value = textarea.value;
  mirror.rows = 1;
  mirror.setAttribute("aria-hidden", "true");
  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.width = `${measuringWidth}px`;
  mirror.style.height = "auto";
  mirror.style.minHeight = "0";
  mirror.style.maxHeight = "none";
  mirror.style.overflow = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.resize = "none";
  mirror.style.visibility = "hidden";
  document.body.append(mirror);

  const lineHeight = getTextareaLineHeight(textarea);
  const hasMultilineInput = mirror.scrollHeight > lineHeight + 1;
  mirror.remove();

  return hasMultilineInput;
}

function getSingleLineTextareaWidth(textarea: HTMLTextAreaElement, inputRow: Element | null) {
  if (!(inputRow instanceof HTMLElement)) {
    return textarea.clientWidth;
  }

  const buttons = Array.from(inputRow.querySelectorAll("button"));
  const buttonWidth = buttons.reduce((sum, button) => {
    return sum + button.getBoundingClientRect().width;
  }, 0);
  const rowStyle = getComputedStyle(inputRow);
  const columnGap = Number.parseFloat(rowStyle.columnGap) || 0;
  const gapWidth = columnGap * buttons.length;

  return Math.max(0, inputRow.clientWidth - buttonWidth - gapWidth);
}

function getTextareaLineHeight(textarea: HTMLTextAreaElement) {
  const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight);

  if (Number.isFinite(lineHeight)) {
    return lineHeight;
  }

  return textarea.clientHeight;
}
