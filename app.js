// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(registration => {
        console.log('Service Worker registered successfully:', registration);
    }).catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}

// PWA Install Prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
            console.log('PWA instalado');
        }
        deferredPrompt = null;
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA foi instalado');
    installBtn.style.display = 'none';
});

// Configuration
const STORAGE_KEY = 'study-tracker-progress';
const PHASE_DATA = {
    'cloud': ['cloud-knowledge', 'cloud-courses', 'cloud-tools', 'cloud-cert'],
    'data-science': ['ds-knowledge', 'ds-courses', 'ds-tools', 'ds-cert'],
    'infra': ['infra-knowledge', 'infra-courses', 'infra-tools', 'infra-cert']
};

// Initialize App
function initializeApp() {
    loadProgress();
    setupEventListeners();
    updateProgressUI();
    registerServiceWorkerUpdates();
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchPath(e.target.dataset.path);
        });
    });

    // Checkbox changes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.dataset.id;
            saveTaskProgress(taskId, e.target.checked);
            updateProgressUI();
        });
    });

    // Export and Reset buttons
    document.getElementById('exportBtn').addEventListener('click', exportProgress);
    document.getElementById('resetBtn').addEventListener('click', resetProgress);
}

// Switch Between Paths
function switchPath(path) {
    // Hide all content
    document.querySelectorAll('.path-content').forEach(content => {
        content.classList.remove('active');
    });

    // Show selected content
    document.querySelector(`.path-content[data-path="${path}"]`).classList.add('active');

    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.tab-btn[data-path="${path}"]`).classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Progress Management
function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const progress = JSON.parse(saved);
        Object.entries(progress).forEach(([taskId, completed]) => {
            if (completed) {
                const checkbox = document.querySelector(`[data-id="${taskId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
    }
}

function saveTaskProgress(taskId, completed) {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    progress[taskId] = completed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

    // Sync with Service Worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
        caches.open('progress-cache-v4').then(cache => {
            cache.put('/progress.json', new Response(JSON.stringify(progress)));
        });
    }
}

// UI Updates
function updateProgressUI() {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const allCheckboxes = document.querySelectorAll('.task-checkbox');
    const completedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length;
    const totalCount = allCheckboxes.length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    // Update overall stats
    document.getElementById('overallPercent').textContent = `${percentage}%`;
    document.getElementById('overallProgress').style.width = `${percentage}%`;
    document.getElementById('tasksCompleted').textContent = completedCount;
    document.getElementById('tasksPending').textContent = totalCount - completedCount;

    // Update phase progress
    updatePhaseProgress();
}

function updatePhaseProgress() {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    Object.entries(PHASE_DATA).forEach(([path, phases]) => {
        phases.forEach(phase => {
            const phaseCheckboxes = document.querySelectorAll(
                `[data-phase="${phase}"]`
            );
            const phaseCompleted = Array.from(phaseCheckboxes).filter(
                cb => progress[cb.dataset.id]
            ).length;
            const phaseTotal = phaseCheckboxes.length;
            const percentage = Math.round(
                (phaseCompleted / phaseTotal) * 100
            ) || 0;

            const phaseProgressElement = document.querySelector(
                `[data-phase="${phase}"]`
            );
            if (phaseProgressElement) {
                phaseProgressElement.textContent = `${percentage}%`;
            }
        });
    });
}

// Export Progress
function exportProgress() {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const timestamp = new Date().toLocaleString('pt-BR');
    const allCheckboxes = document.querySelectorAll('.task-checkbox');
    const completedCount = Array.from(allCheckboxes).filter(cb => cb.checked).length;
    const totalCount = allCheckboxes.length;
    const percentage = Math.round((completedCount / totalCount) * 100) || 0;

    const exportData = {
        timestamp,
        overall: {
            completed: completedCount,
            total: totalCount,
            percentage: `${percentage}%`
        },
        tasks: {},
        phases: {}
    };

    // Organize by path and phase
    Object.entries(PHASE_DATA).forEach(([path, phases]) => {
        exportData.phases[path] = {};
        phases.forEach(phase => {
            const phaseCheckboxes = document.querySelectorAll(
                `[data-phase="${phase}"]`
            );
            const phaseCompleted = Array.from(phaseCheckboxes).filter(
                cb => progress[cb.dataset.id]
            ).length;
            const phaseTotal = phaseCheckboxes.length;
            exportData.phases[path][phase] = {
                completed: phaseCompleted,
                total: phaseTotal,
                percentage: `${Math.round((phaseCompleted / phaseTotal) * 100) || 0}%`
            };
        });
    });

    // Get completed tasks
    Object.entries(progress).forEach(([taskId, completed]) => {
        if (completed) {
            const checkbox = document.querySelector(`[data-id="${taskId}"]`);
            if (checkbox) {
                const courseName = checkbox.parentElement.querySelector('.course-name').textContent;
                exportData.tasks[taskId] = courseName;
            }
        }
    });

    // Download as JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    // Show success message
    showNotification('Progresso exportado com sucesso!');
}

// Reset Progress
function resetProgress() {
    if (confirm('Tem certeza que deseja limpar todo o progresso? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem(STORAGE_KEY);
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateProgressUI();
        showNotification('Progresso limpo com sucesso!');
    }
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        font-size: 14px;
        font-weight: 600;
        z-index: 1000;
        animation: slideUp 0.3s ease;
        box-shadow: var(--shadow-lg);
    `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Service Worker Updates
function registerServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker atualizado');
        });
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save (prevent default save dialog)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        exportProgress();
    }

    // Ctrl/Cmd + Shift + C to toggle current tab
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        const tabs = document.querySelectorAll('.tab-btn');
        const activeIndex = Array.from(tabs).findIndex(t => t.classList.contains('active'));
        const nextIndex = (activeIndex + 1) % tabs.length;
        tabs[nextIndex].click();
    }
});

// Periodic sync for data backup
if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
        registration.sync.register('sync-progress').then(() => {
            console.log('Sync registrado');
        }).catch(err => {
            console.log('Sync não disponível:', err);
        });
    });
}

// Auto-save on visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        console.log('App em background, progresso salvo:', Object.keys(progress).length, 'tarefas');
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Handle offline mode
window.addEventListener('online', () => {
    showNotification('Conectado a internet');
    document.body.style.opacity = '1';
});

window.addEventListener('offline', () => {
    showNotification('Você esta offline. Seus dados estao seguros!');
});

// Initial offline check
if (!navigator.onLine) {
    showNotification('Você esta offline. Seus dados estao seguros!');
}

// Log initialization
console.log('Study Tracker inicializado');
console.log('Armazenamento local:', localStorage.getItem(STORAGE_KEY) ? 'OK' : 'Vazio');
