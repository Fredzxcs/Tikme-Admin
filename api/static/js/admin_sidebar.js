const body = document.querySelector("body"),
      modeToggle = body.querySelector(".mode-toggle");
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");
      mainContent = document.querySelector(".main-content");

let getStatus = localStorage.getItem("status");
if (getStatus && getStatus === "close") {
    sidebar.classList.add("close");
    mainContent.style.marginLeft = "60px";
    mainContent.style.width = "calc(100% - 60px)";
}

// Sidebar Toggle Function
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    
    // Adjust main content when sidebar toggles
    if (sidebar.classList.contains("close")) {
        mainContent.style.marginLeft = "60px";
        mainContent.style.width = "calc(100% - 60px)";
        localStorage.setItem("status", "close"); // Save collapsed state
    } else {
        mainContent.style.marginLeft = "250px";
        mainContent.style.width = "calc(100% - 250px)";
        localStorage.setItem("status", "open"); // Save open state
    }
});

// Dropdown Toggle Functionality
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            
            const parent = toggle.parentElement;
            const submenu = parent.querySelector('.submenu');
            const arrow = toggle.querySelector('.dropdown-arrow');

            // Close other dropdowns
            document.querySelectorAll('.dropdown').forEach(item => {
                if (item !== parent) {
                    item.classList.remove('active');
                    const otherSubmenu = item.querySelector('.submenu');
                    const otherArrow = item.querySelector('.dropdown-arrow');
                    if (otherSubmenu) otherSubmenu.style.display = 'none';
                    if (otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current dropdown
            parent.classList.toggle('active');
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
            arrow.style.transform = parent.classList.contains('active') 
                ? 'rotate(180deg)' 
                : 'rotate(0deg)';
        });
    });

    // Profile and Notification Dropdown Toggle Functionality
    // Profile Dropdown
    const profileSection = document.querySelector('.profile-section');
    const profileDropdown = document.querySelector('.profile-section .dropdown-menu');
    
    if (profileSection && profileDropdown) {
        profileSection.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from propagating to the document
            profileDropdown.classList.toggle('show'); // Toggle visibility
        });

        // Hide the dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileSection.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Notification Dropdown
    const notificationSection = document.querySelector('.notification-section');
    const notificationDropdown = document.querySelector('.notification-section .dropdown-menu');
    
    if (notificationSection && notificationDropdown) {
        notificationSection.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the click from propagating to the document
            notificationDropdown.classList.toggle('show'); // Toggle visibility
        });

        // Hide the dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationSection.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }
});
