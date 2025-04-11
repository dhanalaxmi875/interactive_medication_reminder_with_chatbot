// app.js

// Store user data in localStorage for persistence (temporary solution, can be replaced with backend later)
const storeUserData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Retrieve user data
const getUserData = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

// Add medication
const addMedication = (event) => {
    event.preventDefault();

    const medName = document.getElementById('med-name').value;
    const dose = document.getElementById('dose').value;
    const frequency = document.getElementById('frequency').value;
    const time = document.getElementById('time').value;

    // Retrieve existing medications or initialize an empty array
    const medications = getUserData('medications') || [];

    // Create new medication entry
    const newMedication = {
        medName,
        dose,
        frequency,
        time,
    };

    // Add new medication to the list
    medications.push(newMedication);

    // Save updated medications list in localStorage
    storeUserData('medications', medications);

    // Redirect to the progress page
    window.location.href = 'progress.html';
};

// Track medication progress (update progress bar)
const updateProgress = () => {
    const medications = getUserData('medications');
    if (medications && medications.length > 0) {
        const progress = medications.length * 100 / 10; // Example logic: 1 task = 10% progress
        const progressBar = document.getElementById('progress');
        progressBar.value = Math.min(progress, 100); // Ensure progress doesn't exceed 100%
    }
};

// Refill pills logic
const refillPills = () => {
    const pillStock = document.getElementById('pill-stock').value;
    const currentStock = getUserData('pillStock') || 30;
    const newStock = parseInt(currentStock) + parseInt(pillStock);

    // Store the new stock value
    storeUserData('pillStock', newStock);
};

// Set up event listeners for forms and buttons
document.addEventListener('DOMContentLoaded', () => {
    // Medication page form
    const medicationForm = document.querySelector('.medication-form');
    if (medicationForm) {
        medicationForm.addEventListener('submit', addMedication);
    }

    // Update progress bar
    const progressPage = document.getElementById('progress');
    if (progressPage) {
        updateProgress();
    }

    // Refill page logic
    const refillForm = document.querySelector('.refill-form');
    if (refillForm) {
        refillForm.addEventListener('submit', (event) => {
            event.preventDefault();
            refillPills();
        });
    }
});
