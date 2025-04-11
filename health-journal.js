// // Elements
// const moodButtons = document.querySelectorAll(".mood-btn");
// const selectedMood = document.getElementById("selected-mood");
// const journalEntry = document.getElementById("journal-entry");
// const saveEntryBtn = document.getElementById("save-entry-btn");
// const calendar = document.getElementById("calendar");

// // Variables
// let currentMood = "None";
// const journalData = JSON.parse(localStorage.getItem("journalData")) || {};

// // Handle mood selection
// moodButtons.forEach((button) => {
//     button.addEventListener("click", () => {
//         currentMood = button.dataset.mood;
//         selectedMood.textContent = `Mood: ${currentMood}`;
//     });
// });

// // Save journal entry
// saveEntryBtn.addEventListener("click", () => {
//     const date = new Date().toISOString().split("T")[0]; // Get today's date
//     const entry = {
//         mood: currentMood,
//         text: journalEntry.value,
//     };

//     journalData[date] = entry;
//     localStorage.setItem("journalData", JSON.stringify(journalData));

//     alert("Journal entry saved!");
//     updateCalendar();
//     journalEntry.value = ""; // Clear entry
// });

// // Populate calendar with entries
// function updateCalendar() {
//     calendar.innerHTML = "";
//     const daysInMonth = new Date().getDate();

//     for (let i = 1; i <= daysInMonth; i++) {
//         const day = i.toString().padStart(2, "0");
//         const date = new Date().toISOString().slice(0, 8) + day;

//         const dayElement = document.createElement("div");
//         dayElement.className = "calendar-day";
//         dayElement.textContent = day;

//         if (journalData[date]) {
//             dayElement.classList.add("entry-exists");
//             dayElement.addEventListener("click", () => {
//                 const entry = journalData[date];
//                 alert(`Mood: ${entry.mood}\nEntry: ${entry.text}`);
//             });
//         }

//         calendar.appendChild(dayElement);
//     }
// }

// // Initialize calendar on load
// updateCalendar();




// Elements
const moodButtons = document.querySelectorAll(".mood-btn");
const selectedMood = document.getElementById("selected-mood");
const journalEntry = document.getElementById("journal-entry");
const saveEntryBtn = document.getElementById("save-entry-btn");
const calendar = document.getElementById("calendar");

// Variables
let currentMood = "None";
const journalData = JSON.parse(localStorage.getItem("journalData")) || {};

// Handle mood selection
moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentMood = button.dataset.mood;
        selectedMood.textContent = `Mood: ${currentMood}`;
    });
});

// Save journal entry
saveEntryBtn.addEventListener("click", () => {
    const date = new Date().toISOString().split("T")[0]; // Get today's date
    const entry = {
        mood: currentMood,
        text: journalEntry.value,
    };

    // Save the entry in journalData and localStorage
    journalData[date] = entry;
    localStorage.setItem("journalData", JSON.stringify(journalData));

    alert("Journal entry saved!");
    updateCalendar();
    journalEntry.value = ""; // Clear entry
});

// Populate calendar with only created entries
function updateCalendar() {
    calendar.innerHTML = ""; // Clear the calendar display

    // Iterate over the actual dates present in journalData
    for (const date in journalData) {
        if (journalData.hasOwnProperty(date)) {
            const day = date.split("-")[2]; // Extract the day part from the date

            const dayElement = document.createElement("div");
            dayElement.className = "calendar-day";
            dayElement.textContent = day;

            // Highlight and add a click event for existing entries
            dayElement.classList.add("entry-exists");
            dayElement.addEventListener("click", () => {
                const entry = journalData[date];
                alert(`Mood: ${entry.mood}\nEntry: ${entry.text}`);
            });

            calendar.appendChild(dayElement);
        }
    }
}

// Initialize calendar on load
updateCalendar();
