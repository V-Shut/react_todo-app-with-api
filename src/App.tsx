import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import * as Server from './api/todos';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { Errors } from './components/Errors';
import { FilterTodos } from './utils/functions';

export enum Filter {
  All = 'All',
  Active = 'Active',
  Completed = 'Completed',
}

export type TodoError =
  | 'Unable to load todos'
  | 'Unable to add a todo'
  | 'Unable to delete a todo'
  | 'Unable to update a todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState<Filter>(Filter.All);
  const [errors, setErrors] = useState<TodoError | ''>('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletedTodoId, setDeletedTodoId] = useState<number[] | null>(null);
  const [activeChangeId, setActiveChangeId] = useState<number | null>(null);
  const [loaderId, setLoaderId] = useState<number[]>([]);
  const [editedTodo, setEditedTodo] = useState('');

  function getData() {
    const fetchTodos = async () => {
      try {
        const list = await getTodos();

        setTodos(list);
      } catch (error) {
        setErrors('Unable to load todos');
        setTimeout(() => {
          setErrors('');
        }, 3000);
      }
    };

    fetchTodos();
  }

  useEffect(() => {
    getData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      setDeletedTodoId([id]);
      await Server.deletePost(id);
      setTodos(todos.filter(el => el.id !== id));
    } catch (error) {
      setErrors('Unable to delete a todo');
      setTimeout(() => {
        setErrors('');
      }, 3000);

      return false;
    } finally {
      setDeletedTodoId(null);
    }

    return true;
  };

  const toggleAll = async () => {
    try {
      const allCompleted = todos.every(todo => todo.completed);
      let updatedTodos;

      if (allCompleted) {
        updatedTodos = todos.map(todo => ({
          ...todo,
          completed: false,
        }));
      } else {
        updatedTodos = todos.map(todo => ({
          ...todo,
          completed: todo.completed ? todo.completed : true,
        }));
      }

      const todosToUpdate = updatedTodos.filter(
        (todo, index) => todos[index].completed !== todo.completed,
      );

      setLoaderId(todosToUpdate.map(todo => todo.id));
      const updatePromises = todosToUpdate.map(todo => Server.updatePost(todo));

      await Promise.all(updatePromises);
      setTodos(prevTodos =>
        prevTodos.map(todo => {
          const updatedTodo = todosToUpdate.find(
            updated => updated.id === todo.id,
          );

          return updatedTodo ? updatedTodo : todo;
        }),
      );
    } catch (error) {
      setErrors('Unable to toggle todos' as TodoError);
      setTimeout(() => {
        setErrors('');
      }, 3000);
    } finally {
      setLoaderId([]);
    }
  };

  const updateStatus = async (todo: Todo) => {
    try {
      setLoaderId([todo.id]);
      await Server.updatePost({ ...todo, completed: !todo.completed });
      setTodos(prevTodos =>
        prevTodos.map(el => {
          if (el.id === todo.id) {
            return { ...el, completed: !el.completed };
          }

          return el;
        }),
      );
    } catch {
      setErrors('Unable to update a todo' as TodoError);
      setTimeout(() => {
        setErrors('');
      }, 3000);
    } finally {
      setLoaderId([]);
    }
  };

  const deleteCompleted = async (todoIds: number[]) => {
    todoIds.map(async id => {
      try {
        setDeletedTodoId(todoIds);
        await Server.deletePost(id);
        setTodos(list => list.filter(todo => todo.id !== id));
      } catch {
        setErrors('Unable to delete a todo' as TodoError);
        setTimeout(() => {
          setErrors('');
        }, 3000);
      } finally {
        setDeletedTodoId(null);
      }
    });
  };

  function loseFocus(id: number) {
    if (todos) {
      setTodos(
        todos?.map(todo => {
          if (activeChangeId === todo.id && editedTodo) {
            return { ...todo, title: editedTodo };
          }

          return todo;
        }),
      );
    }

    setEditedTodo('');
    setActiveChangeId(id);
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  const filteredTodos = FilterTodos(todos, filter);

  const defaultTempTodo = {
    id: 0,
    userId: USER_ID,
    title: title.trim(),
    completed: false,
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          tempTodo={tempTodo}
          title={title}
          defaultTempTodo={defaultTempTodo}
          setErrors={setErrors}
          setTodos={setTodos}
          setTempTodo={setTempTodo}
          setNewTodo={setTitle}
          deletedTodoId={deletedTodoId}
          toggleAll={toggleAll}
        />

        <TodoList
          todos={todos}
          filteredTodos={filteredTodos}
          deletedTodoId={deletedTodoId}
          tempTodo={tempTodo}
          setTodos={setTodos}
          setErrors={setErrors}
          handleDelete={handleDelete}
          defaultTempTodo={defaultTempTodo}
          activeChangeId={activeChangeId}
          setActiveChangeId={setActiveChangeId}
          loaderId={loaderId}
          updateStatus={updateStatus}
          loseFocus={loseFocus}
          editedTodo={editedTodo}
          setEditedTodo={setEditedTodo}
          setLoaderId={setLoaderId}
        />

        {!!todos.length && (
          <Footer
            todos={todos}
            filter={filter}
            setFilter={setFilter}
            deleteCompleted={deleteCompleted}
          />
        )}
      </div>

      <Errors errors={errors} setErrors={setErrors} />
    </div>
  );
};
