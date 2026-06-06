import { navigation, shell } from "@/data/rbsh-knowledge";

type RBSHWelcomeProps = {
  onShortcut: (command: string) => void;
};

export function RBSHWelcome({ onShortcut }: RBSHWelcomeProps) {
  return (
    <div className="rbsh-welcome">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/RBSH.svg"
        alt="RBSH"
        className="rbsh-welcome-logo"
        width={288}
        height={64}
        decoding="async"
      />

      <p className="rbsh-welcome-title">
        {shell.full_name} v{shell.version}
      </p>

      {shell.startup.welcome_message ? (
        <p className="rbsh-welcome-lead">{shell.startup.welcome_message}</p>
      ) : null}

      {shell.startup.motd ? (
        <p className="rbsh-welcome-motd">{shell.startup.motd}</p>
      ) : null}

      {shell.startup.hint ? (
        <p className="rbsh-welcome-hint">{shell.startup.hint}</p>
      ) : null}

      <div className="rbsh-welcome-section">
        <p className="rbsh-welcome-label">Quick navigation:</p>
        <p className="rbsh-welcome-shortcuts">
          {navigation.primary.map((command, index) => (
            <span key={command}>
              {index > 0 ? " " : null}
              <button
                type="button"
                className="rbsh-shortcut"
                onClick={() => onShortcut(command)}
              >
                [{command}]
              </button>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
