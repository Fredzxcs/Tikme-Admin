document.addEventListener("DOMContentLoaded", () => {
    const menuContainer = document.getElementById("menuContainer");

    // Fetch menu items from the API
    const fetchMenuItems = async () => {
        try {
            const response = await fetch("/api/logistics/menu"); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch menu items");
            }
            const menuItems = await response.json();
            renderMenuItems(menuItems);
        } catch (error) {
            console.error("Error fetching menu items:", error);
            menuContainer.innerHTML = "<p>Error loading menu items. Please try again later.</p>";
        }
    };

    // Render menu items
    const renderMenuItems = (menuItems) => {
        menuContainer.innerHTML = ""; // Clear loading message
        menuItems.forEach((item) => {
            const menuItem = document.createElement("div");
            menuItem.classList.add("menu-item");
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <p><strong>${item.price} PHP</strong></p>
                <label for="quantity-${item.id}">Quantity:</label>
                <input type="number" id="quantity-${item.id}" name="menuItems[${item.id}]" min="0" max="10">
            `;
            menuContainer.appendChild(menuItem);
        });
    };

    // Call the fetch function
    fetchMenuItems();
});
