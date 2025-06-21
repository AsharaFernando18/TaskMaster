/**
 * Modern To-Do List Application
 * Features: Add, Edit, Delete, Complete tasks with localStorage persistence
 * Author: Professional Web Developer
 * Date: 2025
 */

class TodoApp {
    constructor() {
        // Initialize properties
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        // Get DOM elements
        this.initializeElements();
        
        // Load tasks from localStorage
        this.loadTasks();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize theme
        this.initializeTheme();
        
        // Initial render
        this.render();
        
        console.log('TodoApp initialized successfully! 🚀');
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Form elements
        this.todoForm = document.getElementById('todo-form');
        this.todoInput = document.getElementById('todo-input');
        
        // List elements
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        
        // Filter elements
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // Count elements
        this.allCount = document.getElementById('all-count');
        this.activeCount = document.getElementById('active-count');
        this.completedCount = document.getElementById('completed-count');
        
        // Bulk action elements
        this.bulkActions = document.getElementById('bulk-actions');
        this.completeAllBtn = document.getElementById('complete-all');
        this.deleteCompletedBtn = document.getElementById('delete-completed');
        
        // Statistics elements
        this.totalTasks = document.getElementById('total-tasks');
        this.completionRate = document.getElementById('completion-rate');
        this.tasksToday = document.getElementById('tasks-today');
        
        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Edit modal elements
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-form');
        this.editInput = document.getElementById('edit-input');
        this.cancelEditBtn = document.getElementById('cancel-edit');
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Form submission
        this.todoForm.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Bulk actions
        this.completeAllBtn.addEventListener('click', () => this.completeAllTasks());
        this.deleteCompletedBtn.addEventListener('click', () => this.deleteCompletedTasks());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Edit modal events
        this.editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
        this.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        
        // Close modal on outside click
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && !this.editModal.classList.contains('hidden')) {
            this.closeEditModal();
        }
        
        // Ctrl/Cmd + Enter to add task quickly
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            this.todoInput.focus();
        }
    }

    /**
     * Initialize theme based on user preference
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        }
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Add a nice animation effect
        this.themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 300);
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todoTasks');
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
            
            // Ensure all tasks have required properties
            this.tasks = this.tasks.map(task => ({
                id: task.id || Date.now() + Math.random(),
                text: task.text || '',
                completed: task.completed || false,
                createdAt: task.createdAt || new Date().toISOString(),
                updatedAt: task.updatedAt || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = [];
        }
    }

    /**
     * Save tasks to localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            // Handle storage quota exceeded
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some completed tasks.');
            }
        }
    }

    /**
     * Handle adding a new task
     */
    handleAddTask(e) {
        e.preventDefault();
        
        const taskText = this.todoInput.value.trim();
        if (!taskText) return;
        
        const newTask = {
            id: Date.now() + Math.random(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.tasks.unshift(newTask); // Add to beginning for recent-first order
        this.todoInput.value = '';
        this.saveTasks();
        this.render();
        
        // Show success feedback
        this.showNotification('Task added successfully! ✅', 'success');
    }

    /**
     * Handle filter change
     */
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;
        
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        this.render();
    }

    /**
     * Toggle task completion
     */
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            
            // Show feedback
            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as active! 📝';
            this.showNotification(message, task.completed ? 'success' : 'info');
        }
    }

    /**
     * Delete a task
     */
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            const task = this.tasks[taskIndex];
            
            // Add leaving animation
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            if (taskElement) {
                taskElement.classList.add('task-leaving');
                
                setTimeout(() => {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                    this.render();
                    this.showNotification('Task deleted! 🗑️', 'info');
                }, 300);
            } else {
                this.tasks.splice(taskIndex, 1);
                this.saveTasks();
                this.render();
                this.showNotification('Task deleted! 🗑️', 'info');
            }
        }
    }

    /**
     * Edit a task
     */
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            this.editInput.value = task.text;
            this.editModal.classList.remove('hidden');
            this.editModal.classList.add('flex');
            this.editInput.focus();
            this.editInput.select();
        }
    }

    /**
     * Handle edit form submission
     */
    handleEditSubmit(e) {
        e.preventDefault();
        
        const newText = this.editInput.value.trim();
        if (!newText) return;
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
            this.closeEditModal();
            this.showNotification('Task updated! ✏️', 'success');
        }
    }

    /**
     * Close edit modal
     */
    closeEditModal() {
        this.editModal.classList.add('hidden');
        this.editModal.classList.remove('flex');
        this.editingTaskId = null;
        this.editInput.value = '';
    }

    /**
     * Complete all tasks
     */
    completeAllTasks() {
        const activeTasks = this.tasks.filter(task => !task.completed);
        if (activeTasks.length === 0) {
            this.showNotification('No active tasks to complete! ✅', 'info');
            return;
        }
        
        activeTasks.forEach(task => {
            task.completed = true;
            task.updatedAt = new Date().toISOString();
        });
        
        this.saveTasks();
        this.render();
        this.showNotification(`${activeTasks.length} tasks completed! 🎉`, 'success');
    }

    /**
     * Delete all completed tasks
     */
    deleteCompletedTasks() {
        const completedTasks = this.tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            this.showNotification('No completed tasks to delete! 🗑️', 'info');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${completedTasks.length} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            this.showNotification(`${completedTasks.length} completed tasks deleted! 🗑️`, 'success');
        }
    }

    /**
     * Get filtered tasks based on current filter
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    /**
     * Update task counts
     */
    updateCounts() {
        const allTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        this.allCount.textContent = allTasks;
        this.activeCount.textContent = activeTasks;
        this.completedCount.textContent = completedTasks;
        
        // Update statistics
        this.totalTasks.textContent = allTasks;
        this.completionRate.textContent = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) + '%' : '0%';
        
        // Calculate tasks created today
        const today = new Date().toDateString();
        const tasksToday = this.tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        ).length;
        this.tasksToday.textContent = tasksToday;
        
        // Show/hide bulk actions
        if (allTasks > 0) {
            this.bulkActions.classList.remove('hidden');
        } else {
            this.bulkActions.classList.add('hidden');
        }
    }

    /**
     * Create HTML for a single task
     */
    createTaskHTML(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const isToday = new Date(task.createdAt).toDateString() === new Date().toDateString();
        
        return `
            <li class="task-item p-4 ${task.completed ? 'task-completed' : ''}" data-task-id="${task.id}">
                <div class="flex items-center gap-4">
                    <!-- Checkbox -->
                    <div class="flex-shrink-0">
                        <input type="checkbox" 
                               class="checkbox-custom" 
                               ${task.completed ? 'checked' : ''}
                               onchange="todoApp.toggleTask(${task.id})"
                               aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
                    </div>
                    
                    <!-- Task Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <p class="text-lg font-medium text-gray-800 dark:text-white ${task.completed ? 'task-text-completed' : ''} break-words">
                                ${this.escapeHtml(task.text)}
                            </p>
                            <div class="flex items-center gap-2 ml-4">
                                ${isToday ? '<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">Today</span>' : ''}
                                <span class="text-sm text-gray-500 dark:text-gray-400">${createdDate}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                        <button onclick="todoApp.editTask(${task.id})" 
                                class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="todoApp.deleteTask(${task.id})" 
                                class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </li>
        `;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-black'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Main render function
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update counts
        this.updateCounts();
        
        // Render tasks or empty state
        if (filteredTasks.length === 0) {
            this.todoList.innerHTML = '';
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            
            // Render tasks with animation
            this.todoList.innerHTML = filteredTasks
                .map(task => this.createTaskHTML(task))
                .join('');
            
            // Add entering animation to new tasks
            const taskElements = this.todoList.querySelectorAll('.task-item');
            taskElements.forEach((element, index) => {
                element.style.animationDelay = `${index * 50}ms`;
                element.classList.add('task-entering');
            });
        }
        
        // Update filter button text to show counts
        this.filterButtons.forEach(btn => {
            const filter = btn.dataset.filter;
            let count = 0;
            
            switch (filter) {
                case 'all':
                    count = this.tasks.length;
                    break;
                case 'active':
                    count = this.tasks.filter(task => !task.completed).length;
                    break;
                case 'completed':
                    count = this.tasks.filter(task => task.completed).length;
                    break;
            }
            
            const countElement = btn.querySelector('span');
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.todoApp = new TodoApp();
    
    // Add some demo tasks if none exist (for first-time users)
    if (window.todoApp.tasks.length === 0) {
        const demoTasks = [
            'Welcome to TaskMaster! 🎉',
            'Try adding your first task',
            'Mark tasks as complete by clicking the checkbox',
            'Edit tasks by clicking the edit button',
            'Delete tasks you no longer need'
        ];
        
        // Add demo tasks with a slight delay for better UX
        setTimeout(() => {
            demoTasks.forEach((text, index) => {
                setTimeout(() => {
                    const task = {
                        id: Date.now() + Math.random(),
                        text: text,
                        completed: index > 2, // First 3 are active, last 2 are completed
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    window.todoApp.tasks.push(task);
                    window.todoApp.saveTasks();
                    window.todoApp.render();
                }, index * 200);
            });
        }, 1000);
    }
});

// Add service worker for offline functionality (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
