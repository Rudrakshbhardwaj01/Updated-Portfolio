export type CommandBufferState = {
  buffer: string;
  cursor: number;
};

export function createBufferState(initial = ""): CommandBufferState {
  return { buffer: initial, cursor: initial.length };
}

export function insertAtCursor(
  state: CommandBufferState,
  value: string,
): CommandBufferState {
  const before = state.buffer.slice(0, state.cursor);
  const after = state.buffer.slice(state.cursor);
  const buffer = `${before}${value}${after}`;

  return {
    buffer,
    cursor: state.cursor + value.length,
  };
}

export function deleteBeforeCursor(state: CommandBufferState): CommandBufferState {
  if (state.cursor === 0) {
    return state;
  }

  return {
    buffer:
      state.buffer.slice(0, state.cursor - 1) + state.buffer.slice(state.cursor),
    cursor: state.cursor - 1,
  };
}

export function deleteAfterCursor(state: CommandBufferState): CommandBufferState {
  if (state.cursor >= state.buffer.length) {
    return state;
  }

  return {
    buffer:
      state.buffer.slice(0, state.cursor) + state.buffer.slice(state.cursor + 1),
    cursor: state.cursor,
  };
}

export function moveCursor(
  state: CommandBufferState,
  direction: "left" | "right" | "home" | "end",
): CommandBufferState {
  switch (direction) {
    case "left":
      return { ...state, cursor: Math.max(0, state.cursor - 1) };
    case "right":
      return {
        ...state,
        cursor: Math.min(state.buffer.length, state.cursor + 1),
      };
    case "home":
      return { ...state, cursor: 0 };
    case "end":
      return { ...state, cursor: state.buffer.length };
    default:
      return state;
  }
}

export function setBuffer(
  state: CommandBufferState,
  buffer: string,
  cursor?: number,
): CommandBufferState {
  const nextCursor = cursor ?? buffer.length;
  return {
    buffer,
    cursor: Math.max(0, Math.min(buffer.length, nextCursor)),
  };
}
