export type TodoError =
  | 'Unable to load todos'
  | 'Unable to add a todo'
  | 'Unable to delete a todo'
  | 'Unable to update a todo';

export enum Filter {
  All = 'All',
  Active = 'Active',
  Completed = 'Completed',
}
