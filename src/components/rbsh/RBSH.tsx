"use client";

import { UtilityLauncher } from "@/components/UtilityLauncher";
import { useFloatingWidget } from "@/hooks/useFloatingWidget";
import { RBSHWindow } from "./RBSHWindow";

export function RBSH() {
  const { isOpen, open, close } = useFloatingWidget();

  return (
    <>
      {isOpen ? <RBSHWindow onClose={close} /> : null}

      {!isOpen ? (
        <UtilityLauncher
          onClick={open}
          ariaLabel="Open RBSH terminal"
          ariaControls="rbsh-window"
          position="left"
          isOpen={isOpen}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/RBSH.svg"
            alt=""
            className="utility-launcher-icon"
            width={32}
            height={32}
            decoding="async"
          />
        </UtilityLauncher>
      ) : null}
    </>
  );
}
