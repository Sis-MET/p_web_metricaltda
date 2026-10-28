import { useEffect, useRef, useState } from "react";
import type { RootState } from "@react-three/fiber";

type Frameloop = "always" | "demand" | "never";

/** Lo que cada escena recibe del demo para su bucle de render */
export type SceneLoopProps = {
  /** Visible y con la pestaña abierta: se anima; si no, queda en pausa */
  active: boolean;
  /** La escena terminó de compilar sus shaders y empieza a dibujarse */
  onReady?: () => void;
};

type Program = { isReady: () => boolean };

/**
 * Lo mismo que `renderer.compileAsync` (con KHR_parallel_shader_compile, si el navegador lo ofrece,
 * los shaders se compilan en paralelo y aquí solo se espera), pero deja de esperar si la escena se
 * desmonta antes: three seguía consultando materiales ya descartados (al cerrar el modal del demo
 * mientras cargaba) y fallaba.
 */
function compileInBackground({ gl, scene, camera }: RootState, isMounted: () => boolean, done: () => void) {
  const pending = gl.compile(scene, camera);
  const poll = () => {
    if (!isMounted()) return;
    for (const material of pending) {
      const program = (gl.properties.get(material) as { currentProgram?: Program }).currentProgram;
      if (!program || program.isReady()) pending.delete(material);
    }
    if (pending.size === 0) done();
    else setTimeout(poll, 10);
  };
  setTimeout(poll, 10);
}

/**
 * Bucle de render de una escena. Al montarla, sus shaders se compilan en segundo plano en vez de
 * al dibujar el primer cuadro, que bloqueaba la página. La excepción es el filtro del entorno
 * (PMREM): three lo compila y usa en el acto. Hasta terminar no se dibuja nada; luego la escena se
 * anima solo mientras está activa y, si no, queda en "demand" (sin gastar cuadros).
 */
export function useSceneLoop({ active, onReady }: SceneLoopProps) {
  const [compiled, setCompiled] = useState(false);
  const frameloop: Frameloop = !compiled ? "never" : active ? "always" : "demand";
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Canvas lo llama una vez, con la escena ya montada (luces, niebla y entorno incluidos)
  const onCreated = (state: RootState) => {
    const ready = () => {
      setCompiled(true);
      onReady?.();
    };
    try {
      compileInBackground(state, () => mounted.current, ready);
    } catch {
      // Si falla, los shaders se compilan al dibujar, como sin esto
      ready();
    }
  };

  return { frameloop, onCreated };
}
