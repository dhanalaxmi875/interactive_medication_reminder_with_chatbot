// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save the mode in localStorage to persist across pages
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Apply the mode on page load based on saved preference
window.onload = () => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
};

// Chat Modal functionality
const modal = document.getElementById("chatModal");
const btn = document.getElementById("medChatBtn");
const span = document.getElementsByClassName("close")[0];
const chatFrame = document.getElementById("chatFrame");

btn.onclick = function() {
  modal.style.display = "block";
  
  // Load the chatbot interface
  chatFrame.src = "http://localhost:8000";
}

span.onclick = function() {
  modal.style.display = "none";
  chatFrame.src = ""; // Clear the iframe content
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    chatFrame.src = "";
  }
}
