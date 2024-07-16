import React from 'react';
import cn from 'classnames';
import { TodoError } from '../App';

interface Props {
  errors: TodoError | '';
  setErrors: (error: TodoError | '') => void;
}

export const Errors: React.FC<Props> = ({ errors, setErrors }) => {
  return (
    <div
      data-cy="ErrorNotification"
      className={cn({
        'notification is-danger is-light has-text-weight-normal': errors,
        hidden: !errors,
      })}
    >
      {errors && (
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrors('' as TodoError)}
        />
      )}
      {errors}
    </div>
  );
};
