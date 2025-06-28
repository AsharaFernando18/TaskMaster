/**
 * TaskMaster Pro - Advanced Task Management Application
 * Features: Enhanced animations, modern UI, productivity tracking
 * Author: TaskMaster Pro Team
 * Date: 2025
 */

class TaskMasterPro {
    constructor() {
        // Initialize properties
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.animationQueue = [];
        this.productivityScore = 0;
        
        // Get DOM elements
        this.initializeElements();
        
        // Load tasks from localStorage
        this.loadTasks();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize theme
        this.initializeTheme();
        
        // Initialize particles
        this.initializeParticles();
        
        // Initialize scroll animations
        this.initializeScrollAnimations();
        
        // Initial render
        this.render();
        
        // Start productivity tracking
        this.startProductivityTracking();
        
        console.log('🚀 TaskMaster Pro initialized successfully!');
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
        this.productivityScoreEl = document.getElementById('productivity-score');
        
        // Progress elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressPercentage = document.getElementById('progress-percentage');
        
        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');
        
        // Edit modal elements
        this.editModal = document.getElementById('edit-modal');
        this.editForm = document.getElementById('edit-form');
        this.editInput = document.getElementById('edit-input');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        
        // FAB
        this.fabAdd = document.getElementById('fab-add');
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
        
        // FAB
        this.fabAdd.addEventListener('click', () => {
            this.todoInput.focus();
            this.todoInput.scrollIntoView({ behavior: 'smooth' });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Scroll events for FAB
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Input animations
        this.todoInput.addEventListener('focus', () => this.animateInputFocus());
        this.todoInput.addEventListener('blur', () => this.animateInputBlur());
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 200) {
            this.fabAdd.classList.remove('hidden');
            this.fabAdd.style.transform = 'scale(1)';
        } else {
            this.fabAdd.style.transform = 'scale(0)';
            setTimeout(() => {
                if (window.scrollY <= 200) {
                    this.fabAdd.classList.add('hidden');
                }
            }, 300);
        }
    }

    /**
     * Animate input focus
     */
    animateInputFocus() {
        this.todoInput.parentElement.style.transform = 'scale(1.02)';
        this.todoInput.parentElement.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.2)';
    }

    /**
     * Animate input blur
     */
    animateInputBlur() {
        this.todoInput.parentElement.style.transform = 'scale(1)';
        this.todoInput.parentElement.style.boxShadow = '';
    }

    /**
     * Initialize floating particles
     */
    initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    /**
     * Initialize scroll animations
     */
    initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
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
        
        // Ctrl/Cmd + A to complete all tasks
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target !== this.todoInput) {
            e.preventDefault();
            this.completeAllTasks();
        }
        
        // Delete key to delete completed tasks
        if (e.key === 'Delete' && e.target !== this.todoInput && e.target !== this.editInput) {
            this.deleteCompletedTasks();
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
        
        // Enhanced animation effect
        this.themeToggle.style.transform = 'rotate(360deg) scale(1.2)';
        setTimeout(() => {
            this.themeToggle.style.transform = '';
        }, 500);
        
        // Show theme change notification
        this.showNotification(
            `Switched to ${isDark ? 'dark' : 'light'} mode! 🌙✨`, 
            'info'
        );
    }

    /**
     * Load tasks from localStorage
     */
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('taskmaster-pro-tasks');
            this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
            
            // Ensure all tasks have required properties
            this.tasks = this.tasks.map(task => ({
                id: task.id || Date.now() + Math.random(),
                text: task.text || '',
                completed: task.completed || false,
                createdAt: task.createdAt || new Date().toISOString(),
                updatedAt: task.updatedAt || new Date().toISOString(),
                priority: task.priority || 'medium',
                category: task.category || 'general'
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
            localStorage.setItem('taskmaster-pro-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('Storage quota exceeded. Please delete some completed tasks.', 'error');
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
            updatedAt: new Date().toISOString(),
            priority: 'medium',
            category: 'general'
        };
        
        this.tasks.unshift(newTask);
        this.todoInput.value = '';
        this.saveTasks();
        this.render();
        
        // Enhanced success feedback with confetti effect
        this.showNotification('Task added successfully! 🎉', 'success');
        this.createConfettiEffect();
        
        // Update productivity score
        this.updateProductivityScore(5);
    }

    /**
     * Create confetti effect
     */
    createConfettiEffect() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
        
        // Add confetti animation keyframes
        if (!document.getElementById('confetti-styles')) {
            const style = document.createElement('style');
            style.id = 'confetti-styles';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        transform: translateY(-10px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Handle filter change
     */
    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        if (!filter) return;
        
        this.currentFilter = filter;
        
        // Update active filter button with enhanced animation
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.transform = 'scale(1)';
        });
        e.target.classList.add('active');
        e.target.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            e.target.style.transform = '';
        }, 200);
        
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
            
            // Enhanced feedback with different animations
            if (task.completed) {
                this.showNotification('Task completed! 🎉', 'success');
                this.updateProductivityScore(10);
                this.animateTaskCompletion(id);
            } else {
                this.showNotification('Task marked as active! 📝', 'info');
                this.updateProductivityScore(-5);
            }
        }
    }

    /**
     * Animate task completion
     */
    animateTaskCompletion(taskId) {
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        if (taskElement) {
            taskElement.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                taskElement.style.animation = '';
            }, 500);
        }
    }

    /**
     * Delete a task
     */
    deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            const taskElement = document.querySelector(`[data-task-id="${id}"]`);
            
            if (taskElement) {
                // Enhanced leaving animation
                taskElement.style.animation = 'slideOut 0.4s ease-in forwards';
                
                setTimeout(() => {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                    this.render();
                    this.showNotification('Task deleted! 🗑️', 'info');
                }, 400);
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
            
            // Enhanced modal animation
            setTimeout(() => {
                this.editInput.focus();
                this.editInput.select();
            }, 100);
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
            this.updateProductivityScore(3);
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
        this.updateProductivityScore(activeTasks.length * 10);
        this.createConfettiEffect();
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
     * Update task counts and progress
     */
    updateCounts() {
        const allTasks = this.tasks.length;
        const activeTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        // Animate count changes
        this.animateCountChange(this.allCount, allTasks);
        this.animateCountChange(this.activeCount, activeTasks);
        this.animateCountChange(this.completedCount, completedTasks);
        
        // Update statistics
        this.animateCountChange(this.totalTasks, allTasks);
        
        const completionPercentage = allTasks > 0 ? Math.round((completedTasks / allTasks) * 100) : 0;
        this.animateCountChange(this.completionRate, completionPercentage, '%');
        
        // Update progress bar
        this.updateProgressBar(completionPercentage);
        
        // Calculate tasks created today
        const today = new Date().toDateString();
        const tasksToday = this.tasks.filter(task => 
            new Date(task.createdAt).toDateString() === today
        ).length;
        this.animateCountChange(this.tasksToday, tasksToday);
        
        // Update productivity score display
        this.animateCountChange(this.productivityScoreEl, this.productivityScore);
        
        // Show/hide bulk actions
        if (allTasks > 0) {
            this.bulkActions.classList.remove('hidden');
        } else {
            this.bulkActions.classList.add('hidden');
        }
    }

    /**
     * Animate count changes
     */
    animateCountChange(element, newValue, suffix = '') {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === newValue) return;
        
        const duration = 500;
        const steps = 20;
        const stepValue = (newValue - currentValue) / steps;
        let currentStep = 0;
        
        const interval = setInterval(() => {
            currentStep++;
            const value = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = value + suffix;
            
            if (currentStep >= steps) {
                clearInterval(interval);
                element.textContent = newValue + suffix;
            }
        }, duration / steps);
    }

    /**
     * Update progress bar
     */
    updateProgressBar(percentage) {
        this.progressBar.style.width = percentage + '%';
        this.progressPercentage.textContent = percentage + '%';
        
        // Add glow effect for high completion rates
        if (percentage >= 80) {
            this.progressBar.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.5)';
        } else {
            this.progressBar.style.boxShadow = '';
        }
    }

    /**
     * Start productivity tracking
     */
    startProductivityTracking() {
        // Load saved productivity score
        const savedScore = localStorage.getItem('taskmaster-pro-productivity');
        this.productivityScore = savedScore ? parseInt(savedScore) : 0;
        
        // Save productivity score periodically
        setInterval(() => {
            localStorage.setItem('taskmaster-pro-productivity', this.productivityScore.toString());
        }, 30000); // Save every 30 seconds
    }

    /**
     * Update productivity score
     */
    updateProductivityScore(points) {
        this.productivityScore = Math.max(0, this.productivityScore + points);
        localStorage.setItem('taskmaster-pro-productivity', this.productivityScore.toString());
    }

    /**
     * Create HTML for a single task
     */
    createTaskHTML(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const isToday = new Date(task.createdAt).toDateString() === new Date().toDateString();
        const priorityColors = {
            high: 'text-red-500',
            medium: 'text-yellow-500',
            low: 'text-green-500'
        };
        
        return `
            <li class="task-item p-6 ${task.completed ? 'task-completed' : ''} group" data-task-id="${task.id}">
                <div class="flex items-center gap-6">
                    <!-- Checkbox -->
                    <div class="flex-shrink-0">
                        <input type="checkbox" 
                               class="checkbox-custom" 
                               ${task.completed ? 'checked' : ''}
                               onchange="taskMasterPro.toggleTask(${task.id})"
                               aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
                    </div>
                    
                    <!-- Task Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                            <div class="flex-1">
                                <p class="text-lg font-medium text-gray-800 dark:text-white ${task.completed ? 'task-text-completed' : ''} break-words mb-1">
                                    ${this.escapeHtml(task.text)}
                                </p>
                                <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span class="flex items-center gap-1">
                                        <i class="fas fa-calendar-alt"></i>
                                        ${createdDate}
                                    </span>
                                    ${isToday ? '<span class="px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">Today</span>' : ''}
                                    <span class="flex items-center gap-1 ${priorityColors[task.priority]}">
                                        <i class="fas fa-flag"></i>
                                        ${task.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onclick="taskMasterPro.editTask(${task.id})" 
                                class="p-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transform hover:scale-110"
                                aria-label="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="taskMasterPro.deleteTask(${task.id})" 
                                class="p-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 transform hover:scale-110"
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
     * Show enhanced notification to user
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-500 transform translate-x-full max-w-sm`;
        
        // Set colors and icons based on type
        const config = {
            success: { 
                bg: 'bg-gradient-to-r from-green-500 to-emerald-500', 
                text: 'text-white',
                icon: 'fas fa-check-circle'
            },
            error: { 
                bg: 'bg-gradient-to-r from-red-500 to-pink-500', 
                text: 'text-white',
                icon: 'fas fa-exclamation-circle'
            },
            info: { 
                bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', 
                text: 'text-white',
                icon: 'fas fa-info-circle'
            },
            warning: { 
                bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', 
                text: 'text-white',
                icon: 'fas fa-exclamation-triangle'
            }
        };
        
        const typeConfig = config[type] || config.info;
        notification.className += ` ${typeConfig.bg} ${typeConfig.text}`;
        
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="${typeConfig.icon} text-xl"></i>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
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
            
            // Render tasks with staggered animation
            this.todoList.innerHTML = filteredTasks
                .map(task => this.createTaskHTML(task))
                .join('');
            
            // Add staggered entering animation
            const taskElements = this.todoList.querySelectorAll('.task-item');
            taskElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.4s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
        
        // Update filter button counts with animation
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
                this.animateCountChange(countElement, count);
            }
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.taskMasterPro = new TaskMasterPro();
    
    // Show welcome message for first-time users
    if (window.taskMasterPro.tasks.length === 0) {
        setTimeout(() => {
            window.taskMasterPro.showNotification('Welcome to TaskMaster Pro! Start by adding your first task. ✨', 'info');
        }, 1000);
    }
});

// Enhanced service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('🔧 Service Worker registered successfully:', registration);
            })
            .catch(registrationError => {
                console.log('❌ Service Worker registration failed:', registrationError);
            });
    });
}

// Add additional CSS animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideOut {
        0% { 
            transform: translateX(0) scale(1); 
            opacity: 1; 
        }
        100% { 
            transform: translateX(100%) scale(0.8); 
            opacity: 0; 
        }
    }
    
    .task-text-completed {
        text-decoration: line-through;
        opacity: 0.6;
    }
    
    .task-completed {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
    }
    
    .dark .task-completed {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1));
    }
`;
document.head.appendChild(additionalStyles);