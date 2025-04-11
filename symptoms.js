// document.getElementById("symptom-form").addEventListener("submit", function (event) {
//     event.preventDefault();

//     const symptoms = document.getElementById("symptoms").value;
//     if (!symptoms) {
//         alert("Please enter symptoms.");
//         return;
//     }

//     fetchMedicationSuggestions(symptoms);
// });

// async function fetchMedicationSuggestions(symptoms) {
//     const apiUrl = `https://api.fda.gov/drug/label.json?search=symptoms:"${symptoms}"&limit=5`;

//     try {
//         const response = await fetch(apiUrl);
//         const data = await response.json();

//         if (data.results && data.results.length > 0) {
//             displayMedications(data.results);
//         } else {
//             document.getElementById("medications-result").innerHTML = "<p>No medication found for the given symptoms.</p>";
//         }
//     } catch (error) {
//         console.error("Error fetching medication data:", error);
//         document.getElementById("medications-result").innerHTML = "<p>There was an error retrieving the medication suggestions. Please try again later.</p>";
//     }
// }

// function displayMedications(medications) {
//     const resultDiv = document.getElementById("medications-result");
//     resultDiv.innerHTML = "<h2>Medication Suggestions:</h2>";

//     medications.forEach(medication => {
//         const medicationName = medication.openfda.brand_name ? medication.openfda.brand_name[0] : "Unknown";
//         const description = medication.description ? medication.description[0] : "No description available.";

//         const medicationDiv = document.createElement("div");
//         medicationDiv.classList.add("medication-item");
//         medicationDiv.innerHTML = `
//             <h3>${medicationName}</h3>
//             <p>${description}</p>
//         `;

//         resultDiv.appendChild(medicationDiv);
//     });
// }


document.getElementById("symptom-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const symptoms = document.getElementById("symptoms").value.trim();
    if (!symptoms) {
        alert("Please enter symptoms.");
        return;
    }

    fetchMedicationSuggestions(symptoms);
});

async function fetchMedicationSuggestions(symptoms) {
    const apiUrl = `https://api.fda.gov/drug/label.json?search=adverse_reactions:"${symptoms}"&limit=5`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            displayMedications(data.results);
        } else {
            document.getElementById("medications-result").innerHTML = `
                <p>No medication found for the symptoms "${symptoms}". Try entering different or more specific symptoms.</p>
            `;
        }
    } catch (error) {
        console.error("Error fetching medication data:", error);
        document.getElementById("medications-result").innerHTML = `
            <p>There was an error retrieving medication suggestions. Please check your internet connection or try again later.</p>
        `;
    }
}

function displayMedications(medications) {
    const resultDiv = document.getElementById("medications-result");
    resultDiv.innerHTML = "<h2>Medication Suggestions:</h2>";

    medications.forEach(medication => {
        const medicationName = medication.openfda.brand_name ? medication.openfda.brand_name[0] : "Unknown Name";
        const purpose = medication.purpose ? medication.purpose[0] : "No purpose available.";
        const description = medication.description ? medication.description[0] : "No description available.";

        const medicationDiv = document.createElement("div");
        medicationDiv.classList.add("medication-item");
        medicationDiv.innerHTML = `
            <h3>${medicationName}</h3>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Description:</strong> ${description}</p>
        `;

        resultDiv.appendChild(medicationDiv);
    });
}
