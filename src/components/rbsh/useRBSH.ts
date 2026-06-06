"use client";

import { useCallback, useReducer, useState } from "react";
import { shell } from "@/data/rbsh-knowledge";
import { executeCommand } from "@/lib/rbsh/engine";
import {
  createInputState,
  inputReducer,
  type InputState,
} from "@/lib/rbsh/input-state";
import type { TerminalLine } from "@/lib/rbsh/types";

function createLineId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useRBSH(onExit?: () => void) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputState, dispatchInput] = useReducer(
    inputReducer,
    undefined,
    createInputState,
  );
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);

  const resetInput = useCallback(() => {
    dispatchInput({ type: "reset" });
  }, []);

  const runCommand = useCallback(
    (rawInput: string) => {
      const trimmed = rawInput.trim();

      if (!trimmed) {
        return;
      }

      setShowWelcome(false);

      const commandLine: TerminalLine = {
        id: createLineId(),
        kind: "command",
        command: trimmed,
      };

      const result = executeCommand(trimmed, { history: commandHistory });

      if (!result) {
        setLines((prev) => [...prev, commandLine]);
        resetInput();
        return;
      }

      if (result.type === "clear") {
        setLines([]);
        setShowWelcome(true);
        resetInput();
        return;
      }

      if (result.type === "exit") {
        const outputLine: TerminalLine = {
          id: createLineId(),
          kind: "output",
          output: { lines: [[{ kind: "text", value: result.message }]] },
        };
        setLines((prev) => [...prev, commandLine, outputLine]);
        resetInput();
        onExit?.();
        return;
      }

      const outputLine: TerminalLine = {
        id: createLineId(),
        kind: result.type === "error" ? "error" : "output",
        output: result.type === "output" ? result.content : undefined,
        error: result.type === "error" ? result.lines : undefined,
      };

      setLines((prev) => [...prev, commandLine, outputLine]);
      setCommandHistory((prev) => [...prev, trimmed]);
      resetInput();
    },
    [commandHistory, onExit, resetInput],
  );

  const handleKey = useCallback(
    (key: string, modifiers: { ctrl: boolean; meta: boolean }) => {
      const ctrl = modifiers.ctrl || modifiers.meta;

      if (ctrl && key.toLowerCase() === "l") {
        setLines([]);
        setShowWelcome(true);
        resetInput();
        return true;
      }

      if (ctrl && key.toLowerCase() === "c") {
        resetInput();
        return true;
      }

      switch (key) {
        case "ArrowLeft":
          dispatchInput({ type: "move", direction: "left" });
          return true;
        case "ArrowRight":
          dispatchInput({ type: "move", direction: "right" });
          return true;
        case "Home":
          dispatchInput({ type: "move", direction: "home" });
          return true;
        case "End":
          dispatchInput({ type: "move", direction: "end" });
          return true;
        case "Backspace":
          dispatchInput({ type: "backspace" });
          return true;
        case "Delete":
          dispatchInput({ type: "delete" });
          return true;
        case "ArrowUp":
          dispatchInput({ type: "history-up", history: commandHistory });
          return true;
        case "ArrowDown":
          dispatchInput({ type: "history-down", history: commandHistory });
          return true;
        case "Tab":
          dispatchInput({ type: "tab" });
          return true;
        default:
          return false;
      }
    },
    [commandHistory, resetInput],
  );

  const insertText = useCallback((value: string) => {
    if (!value) {
      return;
    }
    dispatchInput({ type: "insert", value });
  }, []);

  const syncBuffer = useCallback((buffer: string, cursor: number) => {
    dispatchInput({ type: "sync", buffer, cursor });
  }, []);

  const setCursor = useCallback((cursor: number) => {
    dispatchInput({ type: "set-cursor", cursor });
  }, []);

  return {
    lines,
    input: inputState as InputState,
    runCommand,
    showWelcome,
    prompt: shell.prompt,
    handleKey,
    insertText,
    syncBuffer,
    setCursor,
    resetInput,
  };
}
