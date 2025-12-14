export const TODO_PRIORITIES = ['Facile', 'Moyen', 'Difficile'] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];
