document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('progress');
    const progressPercentage = document.getElementById('progress-percentage');
    const message = document.getElementById('message');

    // Listen for progress updates from medication page
    window.addEventListener('medicationProgressUpdated', function(event) {
        const { progress, date } = event.detail;
        updateProgressUI(progress);
    });

    // Check for any stored progress on page load
    function loadStoredProgress() {
        // First check localStorage for recent updates
        const storedProgress = localStorage.getItem('medicationProgress');
        if (storedProgress) {
            const { progress, date, lastUpdated } = JSON.parse(storedProgress);
            const now = new Date();
            const lastUpdate = new Date(lastUpdated);
            
            // If the stored progress is from today and less than 5 minutes old, use it
            if (date === new Date().toISOString().split('T')[0] && 
                (now - lastUpdate) < 5 * 60 * 1000) {
                updateProgressUI(progress);
                return;
            }
        }

        // Otherwise, calculate from IndexedDB
        const dbName = "MedicationRemindersDB";
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction(['reminders', 'progress'], 'readonly');
            const reminderStore = transaction.objectStore('reminders');
            const progressStore = transaction.objectStore('progress');

            const today = new Date().toISOString().split('T')[0];

            // Get all reminders
            reminderStore.getAll().onsuccess = function(event) {
                const reminders = event.target.result;
                let totalMeds = reminders.length;
                let takenToday = 0;

                if (totalMeds === 0) {
                    updateProgressUI(0);
                    return;
                }

                // Process each reminder
                reminders.forEach(reminder => {
                    const progressRequest = progressStore.get(reminder.id);
                    progressRequest.onsuccess = function(event) {
                        const progressData = event.target.result;
                        if (progressData && progressData.takenDates && 
                            progressData.takenDates.includes(today)) {
                            takenToday++;
                        }
                        
                        // If we've processed all reminders, update the UI
                        if (reminders.indexOf(reminder) === reminders.length - 1) {
                            const progressValue = (takenToday / totalMeds) * 100;
                            updateProgressUI(progressValue);
                        }
                    };
                });
            };
        };
    }

    function updateProgressUI(progress) {
        // Update progress bar and percentage
        progressBar.value = progress;
        progressPercentage.textContent = `${Math.round(progress)}%`;

        // Update progress bar color based on progress
        const hue = (progress * 1.2); // Will go from 0 to 120 (red to green)
        progressBar.style.setProperty('--progress-color', `hsl(${hue}, 70%, 45%)`);

        // Update encouragement message
        if (progress === 0) {
            message.textContent = "Start your day by taking your medications!";
        } else if (progress < 25) {
            message.textContent = "You're just getting started! Keep going!";
        } else if (progress < 50) {
            message.textContent = "Great progress! Keep up the good work!";
        } else if (progress < 75) {
            message.textContent = "You're more than halfway there! Stay consistent!";
        } else if (progress < 100) {
            message.textContent = "Almost there! You're doing amazing!";
        } else {
            message.textContent = "Congratulations! You've taken all your medications for today!";
        }
    }

    // Check for progress updates periodically
    setInterval(loadStoredProgress, 30000); // Check every 30 seconds

    // Load progress when page loads
    loadStoredProgress();
});
