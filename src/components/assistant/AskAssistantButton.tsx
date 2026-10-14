"use client";

import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { assistantPanel } from "@/lib/assistant/panel";

/** Abre el Asistente de Métrica desde cualquier sección del sitio. */
export function AskAssistantButton({ children = "Asistente de Métrica", ...props }: Omit<ButtonProps, "onClick" | "asChild">) {
  return (
    <Button {...props} onClick={assistantPanel.open} aria-haspopup="dialog">
      <Sparkles /> {children}
    </Button>
  );
}
