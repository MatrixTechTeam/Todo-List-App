// Todo Data Structure
let todos = [];
let currentEditId = null;

// DOM Elements
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const categoryFilter = document.getElementById('category-filter');
const priorityFilter = document.getElementById('priority-filter');
const sortSelect = document.getElementById('sort-select');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const taskCount = document.getElementById('task-count');
const totalTasks = document.getElementById('total-tasks');
const completedTasks = document.getElementById('completed-tasks');
const pendingTasks = document.getElementById('pending-tasks');

// Modal Elements
const editModal = document.getElementById('edit-modal');
const editTaskForm = document.getElementById('edit-task-form');
const editTaskInput = document.getElementById('edit-task-input');
const editCategorySelect = document.getElementById('edit-category-select');
const editPrioritySelect = document.getElementById('edit-priority-select');
const closeModalBtn = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit');

// Initialize App
function init() {
    loadFromLocalStorage();
    loadTheme();
    renderTodos();
    attachEventListeners();
}

// Generate Unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add Todo
function addTodo(text, category, priority) {
    const todo = {
        id: generateId(),
        text: text.trim(),
        category: category,
        priority: priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(todo);
    saveToLocalStorage();
    renderTodos();
    
    // Reset form
    taskInput.value = '';
    categorySelect.value = 'work';
    prioritySelect.value = 'medium';
    
    // Show success animation
    showToast('Task added successfully!');
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveToLocalStorage();
        renderTodos();
        showToast('Task deleted successfully!');
    }
}

// Toggle Complete
function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToLocalStorage();
        renderTodos();
    }
}

// Edit Todo
function editTodo(id, newText, newCategory, newPriority) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = newText.trim();
        todo.category = newCategory;
        todo.priority = newPriority;
        saveToLocalStorage();
        renderTodos();
        closeModal();
        showToast('Task updated successfully!');
    }
}

// Open Edit Modal
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        currentEditId = id;
        editTaskInput.value = todo.text;
        editCategorySelect.value = todo.category;
        editPrioritySelect.value = todo.priority;
        editModal.classList.add('active');
    }
}

// Close Modal
function closeModal() {
    editModal.classList.remove('active');
    currentEditId = null;
}

// Clear Completed Tasks
function clearCompletedTasks() {
    const completedCount = todos.filter(t => t.completed).length;
    if (completedCount === 0) {
        showToast('No completed tasks to clear!');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveToLocalStorage();
        renderTodos();
        showToast(`${completedCount} completed task(s) deleted!`);
    }
}

// Filter Todos
function filterTodos() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = filterSelect.value;
    const catFilter = categoryFilter.value;
    const prioFilter = priorityFilter.value;
    const sortBy = sortSelect.value;
    
    let filtered = [...todos];
    
    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(todo => 
            todo.text.toLowerCase().includes(searchTerm)
        );
    }
    
    // Status filter
    if (statusFilter === 'completed') {
        filtered = filtered.filter(todo => todo.completed);
    } else if (statusFilter === 'pending') {
        filtered = filtered.filter(todo => !todo.completed);
    }
    
    // Category filter
    if (catFilter !== 'all') {
        filtered = filtered.filter(todo => todo.category === catFilter);
    }
    
    // Priority filter
    if (prioFilter !== 'all') {
        filtered = filtered.filter(todo => todo.priority === prioFilter);
    }
    
    // Sort
    filtered = sortTodos(filtered, sortBy);
    
    return filtered;
}

// Sort Todos
function sortTodos(todosArray, sortBy) {
    const sorted = [...todosArray];
    
    switch (sortBy) {
        case 'date-asc':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'date-desc':
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'priority-asc':
            const priorityOrder = { low: 1, medium: 2, high: 3 };
            return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'priority-desc':
            const priorityOrderDesc = { low: 1, medium: 2, high: 3 };
            return sorted.sort((a, b) => priorityOrderDesc[b.priority] - priorityOrderDesc[a.priority]);
        default:
            return sorted;
    }
}

// Render Todos
function renderTodos() {
    const filtered = filterTodos();
    
    // Update task count
    taskCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'task' : 'tasks'}`;
    
    // Show/hide empty state
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        taskList.innerHTML = '';
    } else {
        emptyState.classList.add('hidden');
        
        taskList.innerHTML = filtered.map(todo => `
            <li class="task-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="task-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleComplete('${todo.id}')"></div>
                <div class="task-content">
                    <div class="task-text">${escapeHtml(todo.text)}</div>
                    <div class="task-meta">
                        <span class="category-badge ${todo.category}">${todo.category}</span>
                        <span class="priority-indicator ${todo.priority}">${todo.priority}</span>
                        <span class="task-date">${formatDate(todo.createdAt)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="openEditModal('${todo.id}')" aria-label="Edit task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                    </button>
                    <button class="task-btn delete-btn" onclick="deleteTodo('${todo.id}')" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </li>
        `).join('');
    }
    
    updateStatistics();
}

// Update Statistics
function updateStatistics() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
        }
        return `${diffHours}h ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show Toast Notification
function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInUp 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// Theme Functions
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Event Listeners
function attachEventListeners() {
    // Add task form
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value;
        const category = categorySelect.value;
        const priority = prioritySelect.value;
        
        if (text.trim()) {
            addTodo(text, category, priority);
        }
    });
    
    // Edit task form
    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentEditId) {
            const newText = editTaskInput.value;
            const newCategory = editCategorySelect.value;
            const newPriority = editPrioritySelect.value;
            
            if (newText.trim()) {
                editTodo(currentEditId, newText, newCategory, newPriority);
            }
        }
    });
    
    // Search and filters
    searchInput.addEventListener('input', renderTodos);
    filterSelect.addEventListener('change', renderTodos);
    categoryFilter.addEventListener('change', renderTodos);
    priorityFilter.addEventListener('change', renderTodos);
    sortSelect.addEventListener('change', renderTodos);
    
    // Clear completed
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Modal
    closeModalBtn.addEventListener('click', closeModal);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modal
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeModal();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
