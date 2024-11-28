import React, { useState } from 'react';

/*
returns the closest match from match to source  (source is the array of objects that we want to match to). elements are not the same strings
 @param source: array { id: number, name: string, }
 @param match: array { id: number, name: string, }
 @returns array { source.id, source.name, match.id, match.name}
 */


const App = () => {
    const [todos, setTodos] = useState([
        {
            id: 1,
            text: "Buy milk",
            completed: false,
        },
        {
            id: 2,
            text: "Do laundry",
            completed: false,
        },
        {
            id: 3,
            text: "Take out the trash",
            completed: false,
        },
    ]);

    const handleAddTodo = (e) => {
        const text = e.target.value;
        if (text.trim() !== "") {
            setTodos([...todos, { id: Date.now(), text, completed: false }]);
        }
    };

    const handleToggleTodo = (id) => {
        if (isNaN(id)) {
            throw new Error("Invalid ID");
        }

        const newTodos = todos.map((todo) => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        setTodos(newTodos);
    };

    const handleDeleteTodo = (id) => {
        if (isNaN(id)) {
            throw new Error("Invalid ID");
        }

        const newTodos = todos.filter((todo) => todo.id !== id);
        setTodos(newTodos);
    };

    return (
        <div>
            <h1>To-Do List</h1>
            <input
                type="text"
                placeholder="Add a to-do"
                onChange={(e) => handleAddTodo(e)}
            />
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.text}
                        <button onClick={() => handleToggleTodo(todo.id)}>
                            {todo.completed ? "Uncheck" : "Check"}
                        </button>
                        <button onClick={() => handleDeleteTodo(todo.id)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
