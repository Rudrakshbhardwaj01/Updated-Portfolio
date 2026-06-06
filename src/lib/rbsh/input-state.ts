import {
  applyAutocomplete,
  getAutocompleteMatches,
  longestCommonPrefix,
} from "./autocomplete";
import {
  createBufferState,
  deleteAfterCursor,
  deleteBeforeCursor,
  insertAtCursor,
  moveCursor,
  setBuffer,
  type CommandBufferState,
} from "./input-buffer";

export type InputState = CommandBufferState & {
  historyIndex: number;
  draft: string;
  autocompleteCycle: number;
};

export function createInputState(initial = ""): InputState {
  const buffer = createBufferState(initial);
  return {
    ...buffer,
    historyIndex: -1,
    draft: "",
    autocompleteCycle: 0,
  };
}

export type InputAction =
  | { type: "insert"; value: string }
  | { type: "sync"; buffer: string; cursor: number }
  | { type: "set-cursor"; cursor: number }
  | { type: "backspace" }
  | { type: "delete" }
  | { type: "move"; direction: "left" | "right" | "home" | "end" }
  | { type: "history-up"; history: string[] }
  | { type: "history-down"; history: string[] }
  | { type: "tab" }
  | { type: "reset" };

function clearHistoryMeta(
  state: InputState,
  bufferUpdate: CommandBufferState,
): InputState {
  return {
    ...bufferUpdate,
    historyIndex: -1,
    draft: "",
    autocompleteCycle: 0,
  };
}

export function inputReducer(
  state: InputState,
  action: InputAction,
): InputState {
  switch (action.type) {
    case "insert": {
      if (!action.value) {
        return state;
      }
      return clearHistoryMeta(state, insertAtCursor(state, action.value));
    }
    case "sync":
      return {
        ...setBuffer(state, action.buffer, action.cursor),
        historyIndex: -1,
        draft: "",
        autocompleteCycle: 0,
      };
    case "set-cursor":
      return {
        ...state,
        cursor: Math.max(0, Math.min(state.buffer.length, action.cursor)),
      };
    case "backspace":
      return clearHistoryMeta(state, deleteBeforeCursor(state));
    case "delete":
      return clearHistoryMeta(state, deleteAfterCursor(state));
    case "move":
      return { ...state, ...moveCursor(state, action.direction) };
    case "history-up": {
      if (action.history.length === 0) {
        return state;
      }

      const nextIndex =
        state.historyIndex === -1
          ? action.history.length - 1
          : Math.max(0, state.historyIndex - 1);

      const draft =
        state.historyIndex === -1 ? state.buffer : state.draft;

      return {
        ...state,
        ...setBuffer(state, action.history[nextIndex] ?? "", undefined),
        historyIndex: nextIndex,
        draft,
        autocompleteCycle: 0,
      };
    }
    case "history-down": {
      if (state.historyIndex === -1) {
        return state;
      }

      const nextIndex = state.historyIndex + 1;

      if (nextIndex >= action.history.length) {
        return {
          ...state,
          ...setBuffer(state, state.draft, undefined),
          historyIndex: -1,
          draft: "",
          autocompleteCycle: 0,
        };
      }

      return {
        ...state,
        ...setBuffer(state, action.history[nextIndex] ?? "", undefined),
        historyIndex: nextIndex,
        autocompleteCycle: 0,
      };
    }
    case "tab": {
      const matches = getAutocompleteMatches(state.buffer);

      if (matches.length === 0) {
        return state;
      }

      const shared = longestCommonPrefix(matches);
      const trimmed = state.buffer.trimStart();
      const hasArg = trimmed.includes(" ");

      if (!hasArg && shared.length > trimmed.length) {
        return {
          ...state,
          ...setBuffer(state, applyAutocomplete(state.buffer, shared)),
          autocompleteCycle: 0,
        };
      }

      const index = state.autocompleteCycle % matches.length;
      return {
        ...state,
        ...setBuffer(
          state,
          applyAutocomplete(state.buffer, matches[index]),
        ),
        autocompleteCycle: state.autocompleteCycle + 1,
      };
    }
    case "reset":
      return createInputState();
    default:
      return state;
  }
}
