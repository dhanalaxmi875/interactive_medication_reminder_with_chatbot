const form = document.getElementById("pill-form");
const resultsDiv = document.getElementById("pill-info");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const pillName = document.getElementById("pill-name").value.trim();
    resultsDiv.innerHTML = "Searching for pill information...";

    try {
        const response = await fetch(
            `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${pillName}"&limit=1`
        );
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = "No results found. Please try another pill.";
            return;
        }

        const medication = data.results[0];
        const uses = medication.purpose
            ? medication.purpose.join(", ")
            : "Uses not listed.";
        const warnings = medication.warnings
            ? medication.warnings.join("<br>")
            : "Warnings not listed.";

        resultsDiv.innerHTML = `
      <h4>Uses:</h4>
      <p>${uses}</p>
      <h4>Warnings:</h4>
      <p>${warnings}</p>
    `;
    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "An error occurred. Please try again.";
    }
});


