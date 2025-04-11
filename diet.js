// script.js
// document.getElementById('diet-form').addEventListener('submit', async function (e) {
//     e.preventDefault();
//     const foodQuery = document.getElementById('food').value.trim();
//     const resultsContainer = document.getElementById('results');
//     resultsContainer.innerHTML = '<p>Loading recommendations...</p>';

//     // Replace with your API key
//     const API_KEY = '/LOQvKKB/eDR42q310INFw==B6GYYtVxmIjoeLTr';

//     try {
//         // Fetch data from CalorieNinjas API
//         const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${foodQuery}`, {
//             method: 'GET',
//             headers: { 'X-Api-Key': API_KEY },
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch data');
//         }

//         const data = await response.json();

//         // Clear previous results
//         resultsContainer.innerHTML = '';

//         // Display analysis
//         if (data.items.length > 0) {
//             data.items.forEach((item) => {
//                 const result = document.createElement('div');
//                 result.className = 'diet-item';
//                 result.innerHTML = `
//             <h3>${item.name}</h3>
//             <p><strong>Calories:</strong> ${item.calories}</p>
//             <p><strong>Protein:</strong> ${item.protein_g}g</p>
//             <p><strong>Carbs:</strong> ${item.carbohydrates_total_g}g</p>
//             <p><strong>Fats:</strong> ${item.fat_total_g}g</p>
//           `;
//                 resultsContainer.appendChild(result);
//             });
//         } else {
//             resultsContainer.innerHTML = '<p>No data found for your query. Try another search.</p>';
//         }
//     } catch (error) {
//         resultsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
//     }
// });
