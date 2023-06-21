import React from 'react';
import './App.css';

export const App = () => {
  const [value, setValue] = React.useState('');
  const [todos, setTodos] = React.useState([]);
  const [view, setView] = React.useState('view all')

  const onChangeViewHandlerToCompleted = () => {
    setView('completed');
  }

  const onChangeViewHandlerToIncomplete = () => {
    setView('incomplete');
  }

  const onChangeViewHandlerToViewAll = () => {
    setView('view all');
  }

  const onInputChangeHandler = (e) => {
    setValue(e.target.value);
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    //Not sure how I was supposed to handle the id here
    //so I kept it consistent with the rest of the ids.
    //ignoring that JSON placeholder already is using this id
    //(unless you surpass 200 todos)
    //so treating these 20 in userId: 1 as the only data.
    //This will also help with the patch calls since that ID is already present.
    const id = todos.length + 1;

    try {
      const newData = await fetch(`https://jsonplaceholder.typicode.com/todos/1`, {
        method: 'PUT',
        body: JSON.stringify({
          userId: 1,
          //looks like id will always equal to 1 in this PUT request
          //We will change it in our state
          id: id,
          title: value,
          completed: false
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      const response = await newData.json()
      console.log(response);
    } catch(err) {
      console.log(err);
    }

    //Since the todo list on JSON placeholder doesn't actually change 
    //we have to change the state manually as well
    const newTodo = {
      userId: 1,
      id: id,
      title: value,
      completed: false
    }
    setTodos([...todos, newTodo])
    setValue('')

    localStorage.setItem('todoTasks', JSON.stringify([...todos, newTodo]))
  }

  const updateCompletionStatus = async (id, status) => {
    try {
      const newData = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          completed: status,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      //NOTE: If a new task is added and it's status is changed
      //the response will read correlating to json placeholder's API info.
      const response = await newData.json()
      console.log(response);
    } catch(err) {
      console.log(err);
    }

    //Since the todo list on JSON placeholder doesn't actually change 
    //we have to change the state manually here as well
    const updatedTodos = todos.map(todo => {
     return todo.id == id ? {...todo, completed: status} : todo;
    })
    setTodos(updatedTodos)

    localStorage.setItem('todoTasks', JSON.stringify(updatedTodos))
  }

  const onChechboxChangeHandler = (e) => {
    const id = e.target.id;
    const status = e.target.checked;

    updateCompletionStatus(id, status)
  }

  const fetchTasks = async () => {
    let data = {}

    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos?userId=1');
      data = await response.json();
    } catch (err) {
      console.log(err)
    }

    setTodos(data)
  }

  //If JSON placeholder's data changed with each post or put call we make 
  //I would have added an useEffect that would refetch the data if a change was made.
  //So for now we will just stick with loading in the inital data on mount.
  React.useEffect(() => {
    fetchTasks();
    //not sure if I handed local storage correctly here, honestly
    localStorage.setItem('todoTasks', JSON.stringify(todos))
  },[])

  const completedTasks = todos.filter(todo => todo.completed)
  const incompleteTasks = todos.filter(todo => !todo.completed)

  return (
    <div className= "App">
     <h1>Todo List</h1>
     <div style={{display: 'inline-flex', gap: '5px', marginBottom: '15px'}}>
      <button onClick={onChangeViewHandlerToViewAll}>
          View All
        </button>
        <button onClick={onChangeViewHandlerToCompleted}>
          View Completed
        </button>
        <button onClick={onChangeViewHandlerToIncomplete}>
          View Todo
        </button>
      </div>
     <form onSubmit={onSubmitHandler}>
      <input 
        type='text'
        value={value}
        onChange={onInputChangeHandler}
        placeholder='Task...'
        style={{width: '50%'}}
      />
      <button 
        onClick={onSubmitHandler}
        style={{marginLeft: '2px'}}
      >
        Add Task
      </button>
     </form>
     {
      view === 'incomplete' ? 
      <ol>
      {
        incompleteTasks.map(task => {
          return (
            <li className= 'todos' key={task.id}>
               <span>{task.title}</span>
              <input id={task.id} type="checkbox" onChange={onChechboxChangeHandler} checked={task.completed} />
            </li>
          )
        })
      }
     </ol>
    :
    view === 'completed' ?
    <ol>
    {
      completedTasks.map(task => {
        return (
          <li className= 'todos' key={task.id}>
            <span style={{textDecoration: 'line-through'}}>{task.title}</span> 
            <input id={task.id} type="checkbox" onChange={onChechboxChangeHandler} checked={task.completed} />
          </li>
        )
      })
    }
   </ol>
    :
    <ol>
      {
        todos.map(task => {
          return (
            <li className= 'todos' key={task.id}>
              {task.completed ? <span style={{textDecoration: 'line-through'}}>{task.title}</span> : <span>{task.title}</span> }
              <input id={task.id} type="checkbox" onChange={onChechboxChangeHandler} checked={task.completed} />
            </li>
          )
        })
      }
     </ol>
    }
     </div>
  );
}