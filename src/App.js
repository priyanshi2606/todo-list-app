import React, { useState } from 'react';
import { Trash2, Edit2, Plus, Save, X } from 'lucide-react';

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const addTodo = () => {
    // Remove spaces from beginning and end of the task
    const trimmedTodo = newTodo.trim();
    if (trimmedTodo) {
      const todo = {
        id: Date.now(),
        text: trimmedTodo,
        completed: false
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const deleteTodo = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (window.confirm(`Are you sure you want to delete "${todoToDelete.text}"?`)) {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const startEdit = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    // Remove spaces from beginning and end when editing
    const trimmedText = editText.trim();
    if (trimmedText) {
      setTodos(todos.map(todo => 
        todo.id === editingId 
          ? { ...todo, text: trimmedText }
          : todo
      ));
    }
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Todo List</h1>
        <p className="text-blue-100">
          Total Tasks: <span className="font-semibold text-white">{todos.length}</span>
          {todos.length > 0 && (
            <>
              {' | '}
              Completed: <span className="font-semibold text-green-200">{todos.filter(t => t.completed).length}</span>
              {' | '}
              Pending: <span className="font-semibold text-yellow-200">{todos.filter(t => !t.completed).length}</span>
            </>
          )}
        </p>
      </div>

      {/* Add new todo */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-dashed border-gray-300">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addTodo)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>

      {/* Todo list */}
      {todos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-lg">No tasks yet. Add one above to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                todo.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                
                {editingId === todo.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={saveEdit}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(todo.id, todo.text)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit task"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}