import React from "react";
import "./App.css";

export const App = () => {
  const [users, setUsers] = React.useState([]);
  const [todos, setTodos] = React.useState(localStorage.getItem("todos") !== null ? JSON.parse(localStorage.getItem("todos")) : []);
  const [currentUserId, setCurrentUserId] = React.useState(localStorage.getItem("lastPersonSelected") !== null ? JSON.parse(localStorage.getItem("lastPersonSelected")) : null );

  const updateCompletionStatus = async (id, status) => {
    try {
      const newData = await fetch(
        `https://jsonplaceholder.typicode.com/todos/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            completed: status,
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      const response = await newData.json();
      console.log(response);
    } catch (err) {
      console.log(err);
    }

    //Since the todo list on JSON placeholder doesn't actually change
    //we have to change the state manually here as well
    const updatedTodos = todos.map((todo) => {
      return todo.id == id ? { ...todo, completed: status } : todo;
    });
    setTodos(updatedTodos);

    localStorage.setItem("todos", JSON.stringify(updatedTodos));
  };

  const onChechboxChangeHandler = (e) => {
    const id = e.target.id;
    const status = e.target.checked;

    updateCompletionStatus(id, status);
  };

  const fetchTasks = async () => {
    let data = {};

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      data = await response.json();
    } catch (err) {
      console.log(err);
    }

    setTodos(data);
  };

  const fetchUsers = async () => {
    let data = {};

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      data = await response.json();
    } catch (err) {
      console.log(err);
    }

    setUsers(data);
  };

  //If JSON placeholder's data changed with each post or put call we make
  //I would have added an useEffect that would refetch the data if a change was made.
  //So for now we will just stick with loading in the inital data on mount.
  React.useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const userClickHandler = (e) => {
    setCurrentUserId(e.target.id);
    localStorage.setItem("lastPersonSelected", JSON.stringify(e.target.id));
    localStorage.setItem("todos", JSON.stringify(todos));
  };

  const userTasks = todos.filter((todo) => todo.userId == currentUserId);
  const userCompletedTasks = userTasks.filter((task) => task.completed).length;
  const userIncompleteTasks = userTasks.filter(
    (task) => !task.completed
  ).length;

  return (
    <div className="App">
      <h1>Todo List</h1>
      <div>
        {users.map((user) => {
          return (
            <button key={user.id} id={user.id} onClick={userClickHandler}>
              {user.name}
            </button>
          );
        })}
      </div>
      {currentUserId && (
        <div>
          <ol>
            {userTasks.map((task) => {
              return (
                <>
                  <li className="todos" key={task.id}>
                    {task.completed ? (
                      <span style={{ textDecoration: "line-through" }}>
                        {task.title}
                      </span>
                    ) : (
                      <span>{task.title}</span>
                    )}
                    <input
                      id={task.id}
                      type="checkbox"
                      onChange={onChechboxChangeHandler}
                      checked={task.completed}
                    />
                  </li>
                </>
              );
            })}
          </ol>
          <div>Completed: {userCompletedTasks}</div>
          <div>incomplete: {userIncompleteTasks}</div>
        </div>
      )}
    </div>
  );
};
