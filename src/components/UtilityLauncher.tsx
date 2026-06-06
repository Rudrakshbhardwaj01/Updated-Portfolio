type UtilityLauncherProps = {
  onClick: () => void;
  ariaLabel: string;
  ariaControls: string;
  position: "left" | "right";
  isOpen?: boolean;
  children: React.ReactNode;
};

export function UtilityLauncher({
  onClick,
  ariaLabel,
  ariaControls,
  position,
  isOpen = false,
  children,
}: UtilityLauncherProps) {
  return (
    <div className={`utility-launcher-wrap utility-launcher-wrap--${position}`}>
      <button
        type="button"
        onClick={onClick}
        className="utility-launcher"
        aria-expanded={isOpen}
        aria-controls={ariaControls}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    </div>
  );
}
