import './App.scss';
import { useState } from 'react';
import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { TodoList } from './components/TodoList/TodoList';

// ✅ Хелпер для пошуку користувача
const getUserById = (userId: number) => {
  return usersFromServer.find(userItem => userItem.id === userId);
};

export const App = () => {
  // ✅ Фільтруємо тільки ті todo, де користувач знайдений
  const [todos, setTodos] = useState(
    todosFromServer
      .map(todo => ({
        ...todo,
        user: getUserById(todo.userId),
      }))
      .filter(todo => todo.user !== undefined),
  );

  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [userError, setUserError] = useState(false);

  const sanitizeTitle = (value: string) => {
    return value.replace(/[^a-zA-Zа-яА-ЯёЁіІїЇєЄ0-9 ]/g, '');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    let hasError = false;

    if (!title.trim()) {
      setTitleError(true);
      hasError = true;
    }

    if (!userId) {
      setUserError(true);
      hasError = true;
    }

    const user = getUserById(+userId);

    // ✅ Не створюємо todo, якщо користувача не знайдено
    if (!user) {
      setUserError(true);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const newId = Math.max(0, ...todos.map(todo => todo.id)) + 1;

    const newTodo = {
      id: newId,
      title: title.trim(),
      userId: +userId,
      completed: false,
      user, // гарантовано існує
    };

    setTodos([...todos, newTodo]);
    setTitle('');
    setUserId('');
    setTitleError(false);
    setUserError(false);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleError(false);
    setTitle(sanitizeTitle(event.target.value));
  };

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setUserError(false);
    setUserId(event.target.value);
  };

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="titleInput">Title</label>
          <input
            id="titleInput"
            type="text"
            data-cy="titleInput"
            placeholder="Enter a title"
            value={title}
            onChange={handleTitleChange}
          />
          {titleError && <span className="error">Please enter a title</span>}
        </div>

        <div className="field">
          <label htmlFor="userSelect">User</label>
          <select
            id="userSelect"
            data-cy="userSelect"
            value={userId}
            onChange={handleUserChange}
          >
            <option value="">Choose a user</option>
            {usersFromServer.map(userItem => (
              <option key={userItem.id} value={userItem.id}>
                {userItem.name}
              </option>
            ))}
          </select>

          {userError && <span className="error">Pleasechoosea valid user</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};
