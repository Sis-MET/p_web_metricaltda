import { useState } from "react";
import type { RootState } from "@react-three/fiber";

type Frameloop = "always" | "demand" | "never";

/** Lo que cada escena recibe del demo para su bucle de render */
export type SceneLoopProps = {
  /** Visible y con la pestaña abierta: se anima; si no, queda en pausa */
  active: boolean;
  /** La escena terminó de compilar sus shaders y empieza a dibujarse */
  onReady?: () => void;
};

/**
 * Bucle de render de una escena. Al montarla, sus shaders se compilan en segundo plano
 * (compileAsync usa KHR_parallel_shader_compile si el navegador lo ofrece) en vez de al dibujar
 * el primer cuadro, que bloqueaba la página. La excepción es el filtro del entorno (PMREM): three lo
 * compila y usa en el acto. Hasta terminar no se dibuja nada; luego la escena se anima solo
 * mientras está activa y, si no, queda en "demand" (sin gastar cuadros).
 */
export function useSceneLoop({ active, onReady }: SceneLoopProps) {
  const [compiled, setCompiled] = useState(false);
  const frameloop: Frameloop = !compiled ? "never" : active ? "always" : "demand";

  // Canvas lo llama una vez, con la escena ya montada (luces, niebla y entorno incluidos)
  const onCreated = ({ gl, scene, camera }: RootState) => {
    // Si falla, los shaders se compilan al dibujar, como sin esto
    const ready = () => {
      setCompiled(true);
      onReady?.();
    };
    void gl.compileAsync(scene, camera).then(ready, ready);
  };

  return { frameloop, onCreated };
}
