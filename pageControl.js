document.addEventListener('DOMContentLoaded', () => {
    // Function to initialize pagination for a specific page
    function initializePagination(totalItems, itemsPerPage, prevButtonId, nextButtonId, currentPageId) {
        let currentPage = 1;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const prevPageButton = document.getElementById(prevButtonId);
        const nextPageButton = document.getElementById(nextButtonId);
        const currentPageElement = document.getElementById(currentPageId);

        function updateTable() {
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;

            const rows = document.querySelectorAll('.content-table tbody tr');
            rows.forEach((row, index) => {
                if (index >= start && index < end) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            });

            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = currentPage === totalPages;
            updateCurrentPage();
        }

        function updatePaginationButtons() {
            prevPageButton.disabled = currentPage === 1;
            nextPageButton.disabled = currentPage === totalPages;
        }

        function updateCurrentPage() {
            currentPageElement.textContent = currentPage;
        }

        // Attach click event listeners to pagination buttons
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
                updatePaginationButtons();
            }
        });

        nextPageButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
                updatePaginationButtons();
            }
        });

        // Initial update of the current page number
        updateCurrentPage();
    }

    // Example usage on a specific page
    // Replace the parameters with actual values for your specific page
    initializePagination(100, 25, 'prevPageButton', 'nextPageButton', 'currentPage');
});
