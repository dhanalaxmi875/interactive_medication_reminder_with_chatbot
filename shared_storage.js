// Database configuration
const DB_NAME = "MedicationRemindersDB";
const DB_VERSION = 1;

// Delete database
async function deleteDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        
        request.onerror = () => {
            reject(new Error("Could not delete database"));
        };
        
        request.onsuccess = () => {
            console.log("Database deleted successfully");
            resolve();
        };

        request.onblocked = () => {
            reject(new Error("Database deletion blocked. Please close other tabs."));
        };
    });
}

// Initialize database
async function initializeDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", event.target.error);
            reject(new Error("Failed to open database"));
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create stores if they don't exist
            if (!db.objectStoreNames.contains('reminders')) {
                const remindersStore = db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
                remindersStore.createIndex('medicationName', 'medicationName', { unique: false });
            }

            if (!db.objectStoreNames.contains('progress')) {
                const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
                progressStore.createIndex('takenDates', 'takenDates', { unique: false });
            }

            if (!db.objectStoreNames.contains('stock')) {
                const stockStore = db.createObjectStore('stock', { keyPath: 'id' });
                stockStore.createIndex('medicationName', 'medicationName', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
}

// Add medication with stock
async function addMedicationWithStock(medicationName, initialStock, dosage = '1 pill', frequency = 1, reminderTime = '09:00', days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reminders', 'stock'], 'readwrite');
        
        transaction.onerror = (event) => {
            reject(new Error("Transaction failed"));
        };

        const remindersStore = transaction.objectStore('reminders');
        const stockStore = transaction.objectStore('stock');

        // Add to reminders store
        const reminder = {
            medicationName: medicationName,
            dosage: dosage,
            frequency: frequency,
            reminderTime: reminderTime,
            days: days,
            createdAt: new Date().toISOString()
        };

        const reminderRequest = remindersStore.add(reminder);

        reminderRequest.onsuccess = (event) => {
            const medicationId = event.target.result;

            // Add to stock store
            const stockRequest = stockStore.add({
                id: medicationId,
                medicationName: medicationName,
                stock: initialStock
            });

            stockRequest.onsuccess = () => {
                resolve(medicationId);
            };

            stockRequest.onerror = () => {
                reject(new Error("Failed to add stock"));
            };
        };

        reminderRequest.onerror = () => {
            reject(new Error("Failed to add reminder"));
        };
    });
}

// Get medication stock
async function getMedicationStock(id) {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stock'], 'readonly');
        const store = transaction.objectStore('stock');
        
        const request = store.get(id);
        
        request.onsuccess = (event) => {
            resolve(event.target.result || { id: id, stock: 0 });
        };
        
        request.onerror = () => {
            reject(new Error("Failed to get stock"));
        };
    });
}

// Update medication stock
async function updateMedicationStock(id, medicationName, newStock) {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stock'], 'readwrite');
        const store = transaction.objectStore('stock');
        
        const request = store.put({
            id: id,
            medicationName: medicationName,
            stock: newStock
        });
        
        request.onsuccess = () => {
            resolve();
        };
        
        request.onerror = () => {
            reject(new Error("Failed to update stock"));
        };
    });
}

// Reduce medication stock by one
async function reduceMedicationStock(id) {
    try {
        const stockData = await getMedicationStock(id);
        if (stockData.stock > 0) {
            await updateMedicationStock(id, stockData.medicationName, stockData.stock - 1);
            return { success: true, newStock: stockData.stock - 1 };
        }
        return { success: false, message: "Out of stock" };
    } catch (error) {
        return { success: false, message: "Failed to update stock" };
    }
}

// Delete medication
async function deleteMedication(id) {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reminders', 'stock', 'progress'], 'readwrite');
        
        transaction.onerror = () => {
            reject(new Error("Failed to delete medication"));
        };

        const remindersStore = transaction.objectStore('reminders');
        const stockStore = transaction.objectStore('stock');
        const progressStore = transaction.objectStore('progress');

        Promise.all([
            new Promise((res, rej) => {
                const request = remindersStore.delete(id);
                request.onsuccess = () => res();
                request.onerror = () => rej(new Error("Failed to delete reminder"));
            }),
            new Promise((res, rej) => {
                const request = stockStore.delete(id);
                request.onsuccess = () => res();
                request.onerror = () => rej(new Error("Failed to delete stock"));
            }),
            new Promise((res, rej) => {
                const request = progressStore.delete(id);
                request.onsuccess = () => res();
                request.onerror = () => rej(new Error("Failed to delete progress"));
            })
        ])
        .then(() => resolve())
        .catch((error) => reject(error));
    });
}

// Update medication progress
async function updateMedicationProgress(id, date) {
    const db = await initializeDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = (event) => {
            const progress = event.target.result || { id: id, takenDates: [] };
            
            if (!progress.takenDates.includes(date)) {
                progress.takenDates.push(date);
            }
            
            const putRequest = store.put(progress);
            
            putRequest.onsuccess = () => {
                resolve();
            };
            
            putRequest.onerror = () => {
                reject(new Error("Failed to update progress"));
            };
        };
        
        getRequest.onerror = () => {
            reject(new Error("Failed to get progress"));
        };
    });
}
