type TypingIndicatorProps = {
  className?: string;
};

export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <span
      className={`bhardwajbot-typing ${className}`.trim()}
      role="status"
      aria-label="BhardwajBot is typing"
    >
      <span className="bhardwajbot-typing-dot" aria-hidden="true" />
      <span className="bhardwajbot-typing-dot" aria-hidden="true" />
      <span className="bhardwajbot-typing-dot" aria-hidden="true" />
    </span>
  );
}
