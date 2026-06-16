"use client";

import { useEffect } from "react";
import { getLocalizedOpenUILabel } from "@/presentation/chat/lib/response/openui-label";

const textContentSelectors = [
  ".openui-shell-thread-error .openui-callout-title",
  ".openui-shell-new-chat-button",
];

const attributeSelectors = [
  {
    selector: "button[aria-label]",
    attributeName: "aria-label",
  },
];

function localizeOpenUIText(root: ParentNode) {
  localizeTextContent(root);
  localizeAttributes(root);
}

function localizeTextContent(root: ParentNode) {
  textContentSelectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element) => {
      const localizedLabel = getLocalizedOpenUILabel(
        element.textContent?.trim() ?? "",
      );

      if (element.textContent !== localizedLabel) {
        element.textContent = localizedLabel;
      }
    });
  });
}

function localizeAttributes(root: ParentNode) {
  attributeSelectors.forEach(({ selector, attributeName }) => {
    root.querySelectorAll(selector).forEach((element) => {
      const label = element.getAttribute(attributeName);

      if (!label) {
        return;
      }

      const localizedLabel = getLocalizedOpenUILabel(label);

      if (label !== localizedLabel) {
        element.setAttribute(attributeName, localizedLabel);
      }
    });
  });
}

export function OpenUITextLocalizer() {
  useEffect(() => {
    localizeOpenUIText(document);
    const observer = new MutationObserver(() => {
      localizeOpenUIText(document);
    });
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return null;
}
