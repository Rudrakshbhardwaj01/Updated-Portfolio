import {
  CODE_BLOCK_PLACEHOLDER,
  ELEMENTS_TO_REMOVE,
  EQUATION_PLACEHOLDER,
  INLINE_ELEMENTS_TO_STRIP,
} from "@/lib/speech/constants";

function replaceWithTextNode(element: Element, text: string): void {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }

  parent.replaceChild(document.createTextNode(text), element);
}

function processRemovableElements(root: HTMLElement): void {
  for (const selector of ELEMENTS_TO_REMOVE) {
    root.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  }

  root.querySelectorAll("pre").forEach((element) => {
    replaceWithTextNode(element, CODE_BLOCK_PLACEHOLDER);
  });

  root.querySelectorAll("code").forEach((element) => {
    if (element.closest("pre")) {
      return;
    }

    element.remove();
  });

  root.querySelectorAll(".katex-display").forEach((element) => {
    replaceWithTextNode(element, EQUATION_PLACEHOLDER);
  });

  root.querySelectorAll(".katex").forEach((element) => {
    if (element.closest(".katex-display")) {
      return;
    }

    element.remove();
  });
}

function stripInlineNoise(element: HTMLElement): void {
  for (const selector of INLINE_ELEMENTS_TO_STRIP) {
    element.querySelectorAll(selector).forEach((node) => {
      node.remove();
    });
  }
}

export function cleanArticle(article: HTMLElement): HTMLElement {
  const clone = article.cloneNode(true) as HTMLElement;
  processRemovableElements(clone);
  stripInlineNoise(clone);
  return clone;
}
