// // const soundButtons = document.querySelectorAll('.sound-btn');
// // const alarmAudio = document.getElementById('alarm-audio');
// // const alarmSource = document.getElementById('alarm-source');

// // soundButtons.forEach(button => {
// //     button.addEventListener('click', () => {
// //         const sound = button.getAttribute('data-sound');
// //         alarmSource.src = `assets/sounds/${sound}.mp3`;
// //         alarmAudio.load();
// //         alarmAudio.play();
// //     });
// // });

// // Prefill alarm time from localStorage
// document.addEventListener("DOMContentLoaded", function () {
//     const alarmTime = localStorage.getItem("alarmTime");
//     if (alarmTime) {
//         document.getElementById("alarm-time").value = alarmTime;
//     }
// });

// // Alarm Form Logic
// document
//     .getElementById("alarmForm")
//     .addEventListener("submit", function (event) {
//         event.preventDefault();

//         const alarmTime = document.getElementById("alarm-time").value;
//         const selectedSound = document.getElementById("alarm-sound").value;

//         const alarmMessage = document.getElementById("alarmMessage");
//         alarmMessage.style.display = "block";

//         scheduleAlarm(alarmTime, selectedSound);

//         this.reset();
//     });

// function scheduleAlarm(time, soundId) {
//     const now = new Date();
//     const [hours, minutes] = time.split(":").map(Number);

//     const alarmTime = new Date();
//     alarmTime.setHours(hours, minutes, 0, 0);

//     if (alarmTime < now) {
//         alarmTime.setDate(alarmTime.getDate() + 1);
//     }

//     const timeUntilAlarm = alarmTime - now;

//     setTimeout(() => {
//         playSound(soundId);
//         alert("Alarm ringing!");
//     }, timeUntilAlarm);
// }

// function playSound(soundId) {
//     const sound = document.getElementById(soundId);
//     if (sound) {
//         sound.play();
//     }
// }

document.addEventListener("DOMContentLoaded", function () {
    const previewBtn = document.getElementById("preview-btn");
    const saveBtn = document.getElementById("save-btn");
    let selectedAlarm = "";

    // Preview the selected alarm sound
    previewBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="alarm"]:checked');
        if (!selected) {
            alert("Please select an alarm to preview!");
            return;
        }
        selectedAlarm = selected.value;
        const audio = new Audio(selectedAlarm);
        audio.play();
    });

    // Save the selected alarm to localStorage
    saveBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="alarm"]:checked');
        if (!selected) {
            alert("Please select an alarm to save!");
            return;
        }
        localStorage.setItem("selectedAlarm", selected.value);
        alert("Alarm sound saved successfully!");
    });
});
