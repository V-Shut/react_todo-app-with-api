import { Todo } from '../types/Todo';

export const FilterTodos = (todos: Todo[], filter: string) => {
  switch (filter) {
    case 'All':
      return todos;

    case 'Active':
      return [...todos].filter(el => !el.completed);

    case 'Completed':
      return [...todos].filter(el => el.completed);

    default:
      return;
  }
};
