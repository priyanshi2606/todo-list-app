import React, { useState, useEffect } from 'react';
import { 
  Trash2, Edit2, Plus, Save, X, Filter, Calendar, 
  Palette, Undo2, AlertCircle, Clock, Mic, Download, 
  Upload, Sun, Moon, Star, ChevronDown, Search
} from 'lucide-react';

export default function AdvancedTodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');
  const [theme, setTheme] = useState('light');
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Voice recognition setup
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewTodo(transcript);
        setIsListening(false);
      };
      
      speechRecognition.onerror = () => {
        setIsListening(false);
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(speechRecognition);
    }
  }, []);

  const startVoiceInput = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const addTodo = () => {
    const trimmedTodo = newTodo.trim();
    if (trimmedTodo) {
      const todo = {
        id: Date.now(),
        text: trimmedTodo,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: newDueDate || null,
        priority: newPriority,
        category: 'general'
      };
      setTodos([...todos, todo]);
      setNewTodo('');
      setNewDueDate('');
      setNewPriority('medium');
    }
  };

  const deleteTodo = (id) => {
    const todoToDelete = todos.find(todo => todo.id === id);
    if (window.confirm(`Delete "${todoToDelete.text}"?`)) {
      setDeletedTasks([...deletedTasks, { ...todoToDelete, deletedAt: Date.now() }]);
      setTodos(todos.filter(todo => todo.id !== id));
    }
  };

  const undoDelete = () => {
    if (deletedTasks.length > 0) {
      const lastDeleted = deletedTasks[deletedTasks.length - 1];
      const { deletedAt, ...todoToRestore } = lastDeleted;
      setTodos([...todos, todoToRestore]);
      setDeletedTasks(deletedTasks.slice(0, -1));
    }
  };

  const startEdit = (id, text, dueDate, priority) => {
    setEditingId(id);
    setEditText(text);
    setEditDueDate(dueDate || '');
    setEditPriority(priority);
  };

  const saveEdit = () => {
    const trimmedText = editText.trim();
    if (trimmedText) {
      setTodos(todos.map(todo => 
        todo.id === editingId 
          ? { ...todo, text: trimmedText, dueDate: editDueDate || null, priority: editPriority }
          : todo
      ));
    }
    setEditingId(null);
    setEditText('');
    setEditDueDate('');
    setEditPriority('medium');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDueDate('');
    setEditPriority('medium');
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importTasks = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTodos = JSON.parse(e.target.result);
          setTodos([...todos, ...importedTodos]);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} />;
      case 'medium': return <Clock size={16} />;
      case 'low': return <Star size={16} />;
      default: return null;
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'completed' && todo.completed) ||
      (filter === 'pending' && !todo.completed) ||
      (filter === 'overdue' && isOverdue(todo.dueDate) && !todo.completed) ||
      (filter === 'high' && todo.priority === 'high') ||
      (filter === 'medium' && todo.priority === 'medium') ||
      (filter === 'low' && todo.priority === 'low');
    
    return matchesSearch && matchesFilter;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'alphabetical':
        return a.text.localeCompare(b.text);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const themeClasses = {
    light: {
      bg: 'bg-gray-50 min-h-screen',
      container: 'bg-white',
      text: 'text-gray-800',
      border: 'border-gray-200',
      input: 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    },
    dark: {
      bg: 'bg-gray-900 min-h-screen',
      container: 'bg-gray-800',
      text: 'text-white',
      border: 'border-gray-600',
      input: 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 focus:border-blue-400'
    }
  };

  const currentTheme = themeClasses[theme];

  return (
    <div className={`${currentTheme.bg} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className={`${currentTheme.container} rounded-lg p-6 mb-6 shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-3xl font-bold ${currentTheme.text}`}>Advanced Todo List</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-lg hover:bg-gray-100 ${theme === 'dark' ? 'hover:bg-gray-700' : ''} transition-colors`}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={exportTasks}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Export Tasks"
              >
                <Download size={20} />
              </button>
              <label className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" title="Import Tasks">
                <Upload size={20} />
                <input
                  type="file"
                  accept=".json"
                  onChange={importTasks}
                  className="hidden"
                />
              </label>
              {deletedTasks.length > 0 && (
                <button
                  onClick={undoDelete}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-orange-600"
                  title="Undo Delete"
                >
                  <Undo2 size={20} />
                </button>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${currentTheme.text}`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todos.length}</div>
              <div className="text-sm">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todos.filter(t => t.completed).length}</div>
              <div className="text-sm">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{todos.filter(t => !t.completed).length}</div>
              <div className="text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{todos.filter(t => isOverdue(t.dueDate) && !t.completed).length}</div>
              <div className="text-sm">Overdue</div>
            </div>
          </div>
        </div>

        {/* Add New Todo */}
        <div className={`${currentTheme.container} rounded-lg p-6 mb-6 shadow-lg`}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTodo)}
                placeholder="Add a new task..."
                className={`flex-1 px-4 py-2 rounded-lg border ${currentTheme.input} transition-colors`}
              />
              <button
                onClick={startVoiceInput}
                disabled={!recognition || isListening}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white border-red-500' 
                    : 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                }`}
                title="Voice Input"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={addTodo}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
            
            <div className="flex gap-4">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${currentTheme.input}`}
              />
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${currentTheme.input}`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`${currentTheme.container} rounded-lg p-4 mb-6 shadow-lg`}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${currentTheme.input} w-48`}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${currentTheme.input}`}
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${currentTheme.input}`}
            >
              <option value="created">Sort by Created</option>
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>
          </div>
        </div>

        {/* Todo List */}
        {sortedTodos.length === 0 ? (
          <div className={`${currentTheme.container} rounded-lg p-12 text-center shadow-lg`}>
            <div className="text-6xl mb-4">📝</div>
            <p className={`text-lg ${currentTheme.text}`}>
              {searchTerm || filter !== 'all' ? 'No tasks match your filters' : 'No tasks yet. Add one above!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`${currentTheme.container} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
                  todo.completed ? 'bg-green-50 border-green-200' : 
                  isOverdue(todo.dueDate) ? 'bg-red-50 border-red-200' : currentTheme.border
                } ${theme === 'dark' && todo.completed ? 'bg-green-900 bg-opacity-20' : ''}
                ${theme === 'dark' && isOverdue(todo.dueDate) ? 'bg-red-900 bg-opacity-20' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  
                  {editingId === todo.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                        className={`w-full px-3 py-2 border rounded-lg ${currentTheme.input}`}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className={`px-3 py-1 border rounded ${currentTheme.input}`}
                        />
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className={`px-3 py-1 border rounded ${currentTheme.input}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
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
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`${
                              todo.completed
                                ? 'line-through text-gray-500'
                                : currentTheme.text
                            }`}
                          >
                            {todo.text}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                            {getPriorityIcon(todo.priority)}
                            {todo.priority}
                          </span>
                        </div>
                        {todo.dueDate && (
                          <div className={`text-sm flex items-center gap-1 ${
                            isOverdue(todo.dueDate) && !todo.completed ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            <Calendar size={14} />
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                            {isOverdue(todo.dueDate) && !todo.completed && ' (Overdue)'}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(todo.id, todo.text, todo.dueDate, todo.priority)}
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
    </div>
  );
}