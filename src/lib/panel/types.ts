/** Lo que devuelve una acción del panel al formulario: el primer error y el de cada campo */
export type ActionState = { error?: string; fieldErrors?: Record<string, string> };
