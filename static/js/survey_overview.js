document.addEventListener("DOMContentLoaded", async () => {
    const totalResponsesEl = document.getElementById("total-responses");
    const recommendPercentageEl = document.getElementById("recommend-percentage");
    const returnPercentageEl = document.getElementById("return-percentage");
    const surveyResponsesEl = document.getElementById("survey-responses");

    try {
        const response = await fetch('https://tikme-dine.onrender.com/api/survey/');
        
        if (!response.ok) {
            throw new Error(`Failed to fetch survey data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Survey Data Response:", data);

        if (!Array.isArray(data) || data.length === 0) {
            console.error("No survey data available.");
            return;
        }

        // Summary Stats
        const totalResponses = data.length;
        const recommendCount = data.filter(res => res.recommend === 'yes').length;
        const returnCount = data.filter(res => res.return_to_dine === 'yes').length;

        totalResponsesEl.textContent = totalResponses;
        recommendPercentageEl.textContent = `${((recommendCount / totalResponses) * 100).toFixed(2)}%`;
        returnPercentageEl.textContent = `${((returnCount / totalResponses) * 100).toFixed(2)}%`;

        // Populate Customer Feedback Table
        surveyResponsesEl.innerHTML = data.map((res, index) => `
            <tr>
                <td>${res.date || 'N/A'}</td>
                <td>${res.name || 'N/A'}</td>
                <td>${res.phone || 'N/A'}</td>
                <td>${res.email || 'N/A'}</td>
                <td>
                    <button class="btn btn-primary btn-sm view-feedback" data-index="${index}">
                        <i class="fa fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach event listeners to View buttons
        document.querySelectorAll(".view-feedback").forEach(btn => {
            btn.addEventListener("click", function () {
                const index = this.getAttribute("data-index");
                const feedback = data[index];

                document.getElementById("modalName").textContent = feedback.name || 'N/A';
                document.getElementById("modalEmail").textContent = feedback.email || 'N/A';
                document.getElementById("modalPhone").textContent = feedback.phone || 'N/A';
                document.getElementById("modalFoodQuality").textContent = feedback.food_quality || 'N/A';
                document.getElementById("modalOrderAccuracy").textContent = feedback.order_accuracy || 'N/A';
                document.getElementById("modalService").textContent = feedback.speed_of_service || 'N/A';
                document.getElementById("modalPrice").textContent = feedback.price || 'N/A';
                document.getElementById("modalAmbiance").textContent = feedback.ambiance || 'N/A';
                document.getElementById("modalCleanliness").textContent = feedback.cleanliness || 'N/A';
                document.getElementById("modalExperience").textContent = feedback.overall_experience || 'N/A';
                document.getElementById("modalRecommend").textContent = feedback.recommend === 'yes' ? 'Yes' : 'No';
                document.getElementById("modalReturn").textContent = feedback.return_to_dine === 'yes' ? 'Yes' : 'No';
                document.getElementById("modalComments").textContent = feedback.comments || 'No Comments';
                document.getElementById("modalLiked").textContent = feedback.most_liked || 'N/A';
                document.getElementById("modalDisliked").textContent = feedback.least_liked || 'N/A';
                document.getElementById("modalAdditionalComments").textContent = feedback.additional_comments || 'N/A';

                // Show modal
                new bootstrap.Modal(document.getElementById("feedbackModal")).show();
            });
        });

        // Render Charts
        renderCharts(data);

    } catch (error) {
        console.error("Error fetching survey data:", error);
    }
});

// Render Charts with Chart.js
function renderCharts(responses) {
    if (!responses.length) {
        console.error("No responses available for chart rendering.");
        return;
    }

    const totalResponses = responses.length;
    const averageRatings = {
        food_quality: (responses.reduce((sum, res) => sum + (res.food_quality || 0), 0) / totalResponses).toFixed(2),
        order_accuracy: (responses.reduce((sum, res) => sum + (res.order_accuracy || 0), 0) / totalResponses).toFixed(2),
        speed_of_service: (responses.reduce((sum, res) => sum + (res.speed_of_service || 0), 0) / totalResponses).toFixed(2),
        price: (responses.reduce((sum, res) => sum + (res.price || 0), 0) / totalResponses).toFixed(2),
        ambiance: (responses.reduce((sum, res) => sum + (res.ambiance || 0), 0) / totalResponses).toFixed(2),
        cleanliness: (responses.reduce((sum, res) => sum + (res.cleanliness || 0), 0) / totalResponses).toFixed(2)
    };

    const ratingCtx = document.getElementById("ratingChart").getContext("2d");
    const recommendCtx = document.getElementById("recommendChart").getContext("2d");

    if (!ratingCtx || !recommendCtx) {
        console.error("Chart.js Canvas Elements Not Found!");
        return;
    }

    // Destroy existing charts before creating new ones
    if (window.ratingChartInstance) window.ratingChartInstance.destroy();
    if (window.recommendChartInstance) window.recommendChartInstance.destroy();

    // Bar Chart - Average Ratings
    window.ratingChartInstance = new Chart(ratingCtx, {
        type: "bar",
        data: {
            labels: ["Food Quality", "Order Accuracy", "Service", "Price", "Ambiance", "Cleanliness"],
            datasets: [{
                label: "Average Rating",
                backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545", "#17a2b8", "#6c757d"],
                data: [
                    averageRatings.food_quality,
                    averageRatings.order_accuracy,
                    averageRatings.speed_of_service,
                    averageRatings.price,
                    averageRatings.ambiance,
                    averageRatings.cleanliness
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        }
    });

    // Pie Chart - Recommend
    const recommendCount = responses.filter(res => res.recommend === 'yes').length;
    window.recommendChartInstance = new Chart(recommendCtx, {
        type: "pie",
        data: {
            labels: ["Would Recommend", "Would Not Recommend"],
            datasets: [{
                backgroundColor: ["#28a745", "#dc3545"],
                data: [recommendCount, totalResponses - recommendCount]
            }]
        }
    });

    console.log("Charts Rendered Successfully!");
}
