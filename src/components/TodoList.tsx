/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { Todo } from '../types/Todo';
import cn from 'classnames';
import { TodoError } from '../App';
import { updatePost } from '../api/todos';

interface Props {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  filteredTodos: Todo[] | undefined;
  deletedTodoId: number[] | null;
  tempTodo: Todo | null;
  setErrors: (error: TodoError) => void;
  handleDelete: (id: number) => Promise<boolean>;
  defaultTempTodo: Todo;
  activeChangeId: number | null;
  setActiveChangeId: (id: number) => void;
  loaderId: number[];
  updateStatus: (todo: Todo) => void;
  loseFocus: (id: number) => void;
  editedTodo: string;
  setEditedTodo: (title: string) => void;
  setLoaderId: (id: number[]) => void;
}

export const TodoList: React.FC<Props> = ({
  setTodos,
  filteredTodos,
  deletedTodoId,
  setActiveChangeId,
  activeChangeId,
  setErrors,
  tempTodo,
  handleDelete,
  defaultTempTodo,
  loaderId,
  updateStatus,
  loseFocus,
  editedTodo,
  setEditedTodo,
  setLoaderId,
}) => {
  const edit = async (todo: Todo) => {
    if (!editedTodo) {
      try {
        const deleteSuccessful = await handleDelete(todo.id);

        if (deleteSuccessful) {
          setTodos(prev => prev.filter(el => el.id !== todo.id));
        }
      } catch {
        await setActiveChangeId(todo.id);
        setEditedTodo(editedTodo);
        setErrors('Unable to delete a todo' as TodoError);
        setTimeout(() => {
          setErrors('' as TodoError);
        }, 3000);
      }

      return;
    }

    if (editedTodo === todo.title) {
      loseFocus(0);

      return;
    }

    try {
      setLoaderId([todo.id]);
      await updatePost({ ...todo, title: editedTodo.trim() });
      loseFocus(0);
      setTodos(prev =>
        prev.map(el =>
          el.id === todo.id ? { ...el, title: editedTodo.trim() } : el,
        ),
      );
    } catch {
      setActiveChangeId(todo.id);
      setEditedTodo(editedTodo);
      setErrors('Unable to update a todo' as TodoError);
      setTimeout(() => {
        setErrors('' as TodoError);
      }, 3000);

      throw new Error('Unable to update a todo');
    } finally {
      setLoaderId([]);
    }
  };

  const handleEdit = async (
    event: React.KeyboardEvent<HTMLInputElement>,
    todo: Todo,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      edit(todo);
    }

    if (event.key === 'Escape') {
      setActiveChangeId(0);
    }
  };

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos?.map(todo => (
        <div
          data-cy="Todo"
          className={`todo ${cn({ completed: todo.completed })}`}
          key={todo.id}
        >
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              onClick={() => updateStatus(todo)}
              checked={todo.completed}
            />
          </label>

          {activeChangeId !== todo.id ? (
            <span
              data-cy="TodoTitle"
              className="todo__title"
              onDoubleClick={() => {
                setActiveChangeId(todo.id);
                setEditedTodo(todo.title);
              }}
            >
              {todo.title}
            </span>
          ) : (
            <form onSubmit={event => event.preventDefault()}>
              <input
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder={todo.title}
                value={editedTodo}
                onChange={event => setEditedTodo(event.target.value)}
                onBlur={() => edit(todo)}
                onKeyDown={event => handleEdit(event, todo)}
                autoFocus
              />
            </form>
          )}

          {!activeChangeId && (
            <button
              type="button"
              className="todo__remove"
              data-cy="TodoDelete"
              onClick={() => handleDelete(todo.id)}
            >
              ×
            </button>
          )}

          <div
            data-cy="TodoLoader"
            className={`modal overlay ${cn({ 'is-active': loaderId.includes(todo.id) || deletedTodoId?.includes(todo.id) })}`}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      ))}

      {Boolean(tempTodo) && (
        <div data-cy="Todo" className="todo">
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
            />
          </label>

          <span data-cy="TodoTitle" className="todo__title">
            {defaultTempTodo.title}
          </span>

          <button type="button" className="todo__remove" data-cy="TodoDelete">
            ×
          </button>
          <div data-cy="TodoLoader" className="modal overlay is-active">
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </div>
      )}
    </section>
  );
};
