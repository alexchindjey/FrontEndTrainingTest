export const TODO_LABELS = ['HTML', 'CSS', 'NODE JS', 'JQUERY'] as const;
export type TodoLabel = (typeof TODO_LABELS)[number];
