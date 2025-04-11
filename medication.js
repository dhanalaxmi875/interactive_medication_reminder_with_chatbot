let db = null;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// Initialize progress elements
const progressBar = document.getElementById('progress');
const progressPercentage = document.getElementById('progress-percentage');
const progressMessage = document.getElementById('progress-message');

// Track unacknowledged reminders
let unacknowledgedReminders = new Map();

document.addEventListener('DOMContentLoaded', async function() {
    const form = document.getElementById('medication-form');
    const medicationNameInput = document.getElementById('medication-name');
    const dosageInput = document.getElementById('dosage');
    const frequencyInput = document.getElementById('frequency');
    const reminderTimeInput = document.getElementById('reminder-time');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const reminderList = document.getElementById('reminder-items');
    const alarmSound = document.getElementById('alarm-sound');
    const errorContainer = document.getElementById('error-container');

    // Initialize database and load data
    async function initialize() {
        try {
            console.log(`Initialization attempt ${initializationAttempts + 1} of ${MAX_INIT_ATTEMPTS}`);
            
            // Clear any existing error messages
            clearErrors();
            
            // Initialize database
            db = await initializeDB();
            console.log("Database initialized successfully");
            
            // Load data
            await loadReminders();
            await updateProgress();
            requestNotificationPermission();
            
            // Reset attempts on success
            initializationAttempts = 0;
            
        } catch (error) {
            console.error('Failed to initialize database:', error);
            initializationAttempts++;
            
            if (initializationAttempts < MAX_INIT_ATTEMPTS) {
                console.log(`Retrying initialization... (${initializationAttempts}/${MAX_INIT_ATTEMPTS})`);
                showError(`Initialization failed. Retrying... (Attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})`);
                setTimeout(initialize, 1000); // Wait 1 second before retrying
            } else {
                showFatalError('Failed to initialize the application after multiple attempts. Please try the following:' +
                    '\n1. Close all tabs of this application' +
                    '\n2. Clear your browser data' +
                    '\n3. Refresh the page');
            }
        }
    }

    // Clear error messages
    function clearErrors() {
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
    }

    // Show error message
    function showError(message) {
        clearErrors();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'background-color: #ffebee; color: #c62828; padding: 15px; margin: 10px 0; border-radius: 4px; text-align: center;';
        errorDiv.innerHTML = `<p style="margin: 0;">${message}</p>`;
        form.parentNode.insertBefore(errorDiv, form);
    }

    // Show fatal error with refresh button
    function showFatalError(message) {
        clearErrors();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'background-color: #ffebee; color: #c62828; padding: 15px; margin: 10px 0; border-radius: 4px; text-align: center;';
        errorDiv.innerHTML = `
            <p style="margin: 0; white-space: pre-line;">${message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 15px; background-color: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Refresh Page
            </button>
        `;
        form.parentNode.insertBefore(errorDiv, form);
    }

    // Start initialization
    initialize().catch(error => {
        console.error('Fatal initialization error:', error);
        showFatalError('A fatal error occurred while initializing the application.');
    });

    // Request notification permission
    function requestNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    // Show notification
    function showNotification(message, reminderId = null) {
        const isReminderNotification = reminderId !== null;

        if (Notification.permission === 'granted' && isReminderNotification) {
            const notification = new Notification('Medication Reminder', {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/2913/2913465.png',
                requireInteraction: true // Make notification persistent
            });

            notification.onclick = () => {
                acknowledgeReminder(reminderId);
                notification.close();
            };
        }

        // Create or get existing modal
        let modal = document.getElementById('reminder-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'reminder-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                text-align: center;
            `;
            document.body.appendChild(modal);
        }

        // Different modal content based on notification type
        if (isReminderNotification) {
            modal.innerHTML = `
                <h3>Medication Reminder</h3>
                <p>${message}</p>
                <button id="acknowledge-btn" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">OK</button>
            `;
            // Add event listener to the button
            setTimeout(() => {
                const acknowledgeBtn = document.getElementById('acknowledge-btn');
                if (acknowledgeBtn) {
                    acknowledgeBtn.onclick = () => acknowledgeReminder(reminderId);
                }
            }, 0);
        } else {
            modal.innerHTML = `
                <h3>Notification</h3>
                <p>${message}</p>
                <button onclick="dismissNotification()" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                ">OK</button>
            `;
        }
    }

    // Dismiss regular notification
    function dismissNotification() {
        const modal = document.getElementById('reminder-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Make functions available globally
    window.dismissNotification = dismissNotification;

    // Acknowledge reminder
    function acknowledgeReminder(reminderId) {
        console.log('Acknowledging reminder:', reminderId);
        if (unacknowledgedReminders.has(reminderId)) {
            console.log('Found unacknowledged reminder, clearing interval');
            const reminderData = unacknowledgedReminders.get(reminderId);
            clearInterval(reminderData.interval);
            unacknowledgedReminders.delete(reminderId);
            
            const modal = document.getElementById('reminder-modal');
            if (modal) {
                modal.remove();
            }
            
            // Stop the alarm
            const audio = document.getElementById('alarm-sound');
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            console.log('Reminder acknowledged and cleared');
        } else {
            console.log('No unacknowledged reminder found with ID:', reminderId);
        }
    }

    // Add reminder
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const selectedDays = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        if (selectedDays.length === 0) {
            showNotification('Please select at least one day for the reminder!');
            return;
        }

        const reminder = {
            medicationName: medicationNameInput.value.trim(),
            dosage: dosageInput.value.trim(),
            frequency: parseInt(frequencyInput.value),
            reminderTime: reminderTimeInput.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value,
            days: selectedDays
        };

        if (!reminder.medicationName) {
            showNotification('Please enter a medication name');
            return;
        }

        try {
            console.log("Adding medication:", reminder);
            const id = await addMedicationWithStock(
                reminder.medicationName,
                30, // Initial stock
                reminder.dosage,
                reminder.frequency,
                reminder.reminderTime,
                reminder.days,
                reminder.startDate,
                reminder.endDate
            );
            console.log("Medication added successfully with ID:", id);

            showNotification('Medication reminder added successfully!');
            form.reset();
            await loadReminders();
            await updateProgress();
        } catch (error) {
            console.error('Error adding reminder:', error);
            showNotification('Failed to add medication reminder: ' + error.message);
        }
    });

    // Load reminders
    async function loadReminders() {
        if (!db) {
            console.error('Database not initialized');
            return;
        }

        try {
            console.log("Loading reminders...");
            const transaction = db.transaction(['reminders', 'stock'], 'readonly');
            const reminderStore = transaction.objectStore('reminders');

            const reminders = await new Promise((resolve, reject) => {
                const request = reminderStore.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = (e) => reject(e.target.error);
            });

            console.log("Loaded reminders:", reminders);
            reminderList.innerHTML = '';

            for (const reminder of reminders) {
                const stockData = await getMedicationStock(reminder.id);
                console.log("Stock data for", reminder.medicationName, ":", stockData);
                
                const li = document.createElement('li');
                li.className = 'reminder-item';
                
                const reminderInfo = document.createElement('div');
                reminderInfo.className = 'reminder-info';
                reminderInfo.innerHTML = `
                    <h3>${reminder.medicationName}</h3>
                    <p>Dosage: ${reminder.dosage}</p>
                    <p>Frequency: ${reminder.frequency} times per day</p>
                    <p>Time: ${reminder.reminderTime}</p>
                    <p>Days: ${reminder.days.join(', ')}</p>
                    <p>Stock: ${stockData.stock} doses left</p>
                `;

                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container';

                const takenButton = document.createElement('button');
                takenButton.className = 'taken-btn';
                takenButton.textContent = 'Mark as Taken';
                takenButton.onclick = () => markAsTaken(reminder.id);

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteReminder(reminder.id);

                buttonContainer.appendChild(takenButton);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(reminderInfo);
                li.appendChild(buttonContainer);
                reminderList.appendChild(li);

                checkMedicationTime(reminder);
            }
        } catch (error) {
            console.error('Error loading reminders:', error);
            reminderList.innerHTML = `
                <div class="error-message" style="color: red; padding: 20px; text-align: center;">
                    Failed to load medications. Please refresh the page.<br>
                    Error: ${error.message}
                </div>
            `;
        }
    }

    // Mark as taken
    async function markAsTaken(id) {
        if (!db) {
            console.error('Database not initialized');
            return;
        }

        try {
            console.log("Marking medication as taken:", id);
            const transaction = db.transaction(['reminders'], 'readonly');
            const store = transaction.objectStore('reminders');

            const reminder = await new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (!reminder) {
                throw new Error('Reminder not found');
            }

            const today = new Date().toISOString().split('T')[0];

            // Reduce stock and check result
            const stockResult = await reduceMedicationStock(id);
            console.log("Stock reduction result:", stockResult);
            
            if (!stockResult.success) {
                showNotification(stockResult.message);
                return;
            }

            // Update progress
            await updateMedicationProgress(id, today);
            console.log("Progress updated for medication:", id);

            // Update UI and show notifications
            if (stockResult.newStock <= 5 && stockResult.newStock > 0) {
                showNotification(`Low stock alert: ${reminder.medicationName} has only ${stockResult.newStock} doses left. Please refill soon!`);
            }
            if (stockResult.newStock === 0) {
                showNotification(`${reminder.medicationName} is out of stock! Please refill immediately!`);
            }

            showNotification(`${reminder.medicationName} marked as taken!`);
            
            // Reload reminders to update UI
            await loadReminders();
        } catch (error) {
            console.error('Error marking as taken:', error);
            showNotification('Failed to mark medication as taken: ' + error.message);
        }
    }

    // Delete reminder
    async function deleteReminder(id) {
        if (!db) {
            console.error('Database not initialized');
            return;
        }

        try {
            console.log("Deleting medication:", id);
            await deleteMedication(id);
            showNotification('Medication deleted successfully');
            await loadReminders();
            await updateProgress();
        } catch (error) {
            console.error('Error deleting reminder:', error);
            showNotification('Failed to delete medication: ' + error.message);
        }
    }

    // Update progress
    async function updateProgress() {
        if (!db) {
            console.error('Database not initialized');
            return;
        }

        try {
            const transaction = db.transaction(['reminders', 'progress'], 'readonly');
            const reminderStore = transaction.objectStore('reminders');
            const progressStore = transaction.objectStore('progress');

            const reminders = await new Promise((resolve, reject) => {
                const request = reminderStore.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            const today = new Date().toISOString().split('T')[0];
            let totalMeds = reminders.length;
            let takenToday = 0;

            if (totalMeds === 0) {
                updateProgressDisplay(0);
                return;
            }

            for (const reminder of reminders) {
                const progress = await new Promise((resolve, reject) => {
                    const request = progressStore.get(reminder.id);
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });

                if (progress && progress.takenDates && progress.takenDates.includes(today)) {
                    takenToday++;
                }
            }

            const progressValue = (takenToday / totalMeds) * 100;
            updateProgressDisplay(progressValue);

            // Dispatch event for progress page
            const progressEvent = new CustomEvent('medicationProgressUpdated', {
                detail: {
                    progress: progressValue,
                    date: today
                },
                bubbles: true,
                composed: true
            });
            window.dispatchEvent(progressEvent);

            // Store the progress in localStorage for cross-page sync
            localStorage.setItem('medicationProgress', JSON.stringify({
                progress: progressValue,
                date: today,
                lastUpdated: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    // Update progress display
    function updateProgressDisplay(progressValue) {
        console.log("Updating progress display to:", progressValue);
        
        if (!progressBar || !progressPercentage || !progressMessage) {
            console.error("Progress elements not found:", {
                progressBar: !!progressBar,
                progressPercentage: !!progressPercentage,
                progressMessage: !!progressMessage
            });
            return;
        }

        progressBar.value = progressValue;
        progressPercentage.textContent = `${Math.round(progressValue)}%`;
        
        if (progressValue === 0) {
            progressMessage.textContent = 'No medications taken yet today';
        } else if (progressValue < 50) {
            progressMessage.textContent = 'Keep going! Take your medications on time';
        } else if (progressValue < 100) {
            progressMessage.textContent = 'Good progress! Keep it up';
        } else {
            progressMessage.textContent = 'Perfect! All medications taken for today';
        }

        // Update progress bar color based on progress
        const hue = (progressValue * 1.2); // Will go from 0 to 120 (red to green)
        progressBar.style.setProperty('--progress-color', `hsl(${hue}, 70%, 45%)`);
        
        console.log("Progress display updated successfully");
    }

    // Check medication time
    function checkMedicationTime(reminder) {
        function scheduleNextCheck() {
            const now = new Date();
            const [hours, minutes] = reminder.reminderTime.split(':');
            const reminderTime = new Date(now);
            reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // If reminder time has passed for today, schedule for tomorrow
            if (now > reminderTime) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            // Calculate delay until next reminder
            const delay = reminderTime.getTime() - now.getTime();
            
            // Schedule the check for exact reminder time
            setTimeout(() => {
                const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                
                if (reminder.days.includes(currentDay)) {
                    // Only create new reminder if it's not already active
                    if (!unacknowledgedReminders.has(reminder.id)) {
                        playAlarm();
                        
                        // Create persistent reminder
                        const reminderId = reminder.id;
                        const message = `Time to take ${reminder.medicationName} - ${reminder.dosage}`;
                        showNotification(message, reminderId);
                        
                        // Set up recurring reminder
                        const interval = setInterval(() => {
                            playAlarm();
                            showNotification(message, reminderId);
                        }, 60000); // Repeat every minute
                        
                        unacknowledgedReminders.set(reminderId, {
                            interval: interval,
                            message: message
                        });
                    }
                }
                
                // Schedule next check
                scheduleNextCheck();
            }, delay);
        }
        
        // Start scheduling
        scheduleNextCheck();
    }

    // Play alarm
    function playAlarm() {
        const selectedAlarmSound = localStorage.getItem('selectedAlarm');
        if (selectedAlarmSound) {
            const audio = new Audio(selectedAlarmSound);
            audio.play().catch(error => {
                console.error('Error playing alarm:', error);
                // Fallback to default alarm sound
                alarmSound.currentTime = 0;
                alarmSound.play().catch(error => {
                    console.error('Error playing default alarm:', error);
                });
            });
        } else {
            // Use default alarm sound if no selection found
            alarmSound.currentTime = 0;
            alarmSound.play().catch(error => {
                console.error('Error playing default alarm:', error);
            });
        }
    }

    // Initialize database
    async function initializeDB() {
        const dbName = "MedicationRemindersDB";
        const reminderStore = "reminders";
        const progressStore = "progress";
        const stockStore = "stock";

        const request = indexedDB.open(dbName, 1);

        request.onerror = function (event) {
            console.error("Database error:", event.target.error);
            throw event.target.error;
        };

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            // Create reminders store
            if (!db.objectStoreNames.contains(reminderStore)) {
                db.createObjectStore(reminderStore, { keyPath: "id", autoIncrement: true });
            }

            // Create progress store
            if (!db.objectStoreNames.contains(progressStore)) {
                db.createObjectStore(progressStore, { keyPath: "id" });
            }

            // Create stock store
            if (!db.objectStoreNames.contains(stockStore)) {
                db.createObjectStore(stockStore, { keyPath: "id" });
            }
        };

        await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return request.result;
    }

    // Add medication with stock and reminder details
    async function addMedicationWithStock(medicationName, stock, dosage, frequency, reminderTime, days, startDate, endDate) {
        try {
            const transaction = db.transaction(['reminders', 'stock'], 'readwrite');
            const reminderStore = transaction.objectStore('reminders');
            const stockStore = transaction.objectStore('stock');

            const reminder = {
                medicationName: medicationName,
                dosage: dosage,
                frequency: frequency,
                reminderTime: reminderTime,
                days: days,
                startDate: startDate,
                endDate: endDate
            };

            const request = reminderStore.add(reminder);
            const id = await new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            const stockData = {
                id: id,
                medicationName: medicationName,
                stock: stock
            };

            await new Promise((resolve, reject) => {
                const request = stockStore.add(stockData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            return id;
        } catch (error) {
            console.error('Error adding medication with stock:', error);
        }
    }

    // Get medication stock
    async function getMedicationStock(id) {
        try {
            const transaction = db.transaction(['stock'], 'readonly');
            const store = transaction.objectStore('stock');

            const stockData = await new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (!stockData) {
                stockData = {
                    id: id,
                    stock: 0
                };
            }

            return stockData;
        } catch (error) {
            console.error('Error getting medication stock:', error);
        }
    }

    // Delete medication
    async function deleteMedication(id) {
        try {
            const transaction = db.transaction(['reminders', 'stock'], 'readwrite');
            const reminderStore = transaction.objectStore('reminders');
            const stockStore = transaction.objectStore('stock');

            await new Promise((resolve, reject) => {
                const request = reminderStore.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            await new Promise((resolve, reject) => {
                const request = stockStore.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    }

    // Update medication progress
    async function updateMedicationProgress(id, date) {
        if (!db) {
            throw new Error('Database not initialized');
        }

        const transaction = db.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');

        try {
            // Get existing progress
            const progress = await new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            // Initialize or update progress
            let updatedProgress;
            if (!progress) {
                updatedProgress = {
                    id: id,
                    takenDates: [date]
                };
            } else {
                if (!progress.takenDates.includes(date)) {
                    progress.takenDates.push(date);
                }
                updatedProgress = progress;
            }

            // Save updated progress
            await new Promise((resolve, reject) => {
                const request = store.put(updatedProgress);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            // Update the progress display immediately
            await updateProgress();
            return true;
        } catch (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    }

    // Reduce medication stock
    async function reduceMedicationStock(id) {
        try {
            const transaction = db.transaction(['stock'], 'readwrite');
            const store = transaction.objectStore('stock');

            const stockData = await new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (!stockData) {
                return { success: false, message: 'Medication stock not found' };
            }

            if (stockData.stock <= 0) {
                return { success: false, message: 'Medication is out of stock' };
            }

            stockData.stock -= 1;

            await new Promise((resolve, reject) => {
                const request = store.put(stockData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            return { success: true, newStock: stockData.stock };
        } catch (error) {
            console.error('Error reducing medication stock:', error);
            return { success: false, message: 'Failed to reduce medication stock' };
        }
    }

    // Reset database button
    document.getElementById('reset-db').addEventListener('click', async () => {
        try {
            await deleteDatabase();
            location.reload();
        } catch (error) {
            showError("Failed to reset database. Please close all other tabs with this application open and try again.");
        }
    });

    // Show error message
    function showError(message) {
        errorContainer.innerHTML = `
            <div style="background-color: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px;">
                ${message}
                <button onclick="location.reload()" style="margin-left: 10px; padding: 5px 10px; background-color: #c62828; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Refresh Page
                </button>
            </div>
        `;
    }

    // Clear error message
    function clearError() {
        errorContainer.innerHTML = '';
    }

    // Delete database
    async function deleteDatabase() {
        const dbName = "MedicationRemindersDB";
        const request = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
});
