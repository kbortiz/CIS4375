document.addEventListener('DOMContentLoaded', () => {
    // Control amount of items on a single page
    let currentPage = 1;
    const totalItems = document.getElementById('totalCustomers').textContent;
    const itemsPerPage = 25; // Specify the number of items per page
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');
    const currentPageElement = document.getElementById('currentPage');

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
});
