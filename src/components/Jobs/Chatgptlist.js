import React, { useState } from "react";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");

    const handleNewTodoChange = (event) => {
        setNewTodo(event.target.value);
    };

    const handleAddTodo = () => {
        setTodos([...todos, { id: todos.length + 1, text: newTodo, done: false }]);
        setNewTodo("");
    };

    const handleToggleDone = (id) => {
        setTodos(
            todos.map((todo) =>
                todo.id === id ? { ...todo, done: !todo.done } : todo
            )
        );
    };

    const handleDeleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    return (
        <div>
            <h2>To-do List</h2>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
            <span
                style={{ textDecoration: todo.done ? "line-through" : "none" }}
                onClick={() => handleToggleDone(todo.id)}
            >
              {todo.text}
            </span>
                        <button onClick={() => handleDeleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <div>
                <input type="text" value={newTodo} onChange={handleNewTodoChange} />
                <button onClick={handleAddTodo}>Add</button>
            </div>
        </div>
    );
};

export default TodoList;
