"use client";

import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { assistantPanel } from "@/lib/assistant/panel";

/** Abre el asesor virtual desde cualquier sección del sitio. */
export function AskAssistantButton({ children = "Asesor virtual", ...props }: Omit<ButtonProps, "onClick" | "asChild">) {
  return (
    <Button {...props} onClick={assistantPanel.open} aria-haspopup="dialog">
      <Sparkles /> {children}
    </Button>
  );
}
