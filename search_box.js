document.addEventListener('DOMContentLoaded', function() {

const search = document.querySelector('#searchData');
const table_rows = document.querySelectorAll('.content-table tbody tr');
const table_headings = document.querySelectorAll('.content-table thead tr th');

// Searching for specific data of HTML table
search.addEventListener('input', searchTable);

function searchTable() {
    const search_data = search.value.toLowerCase();
    
    table_rows.forEach((row, i) => {
        let cells = row.querySelectorAll('td');
        let rowMatches = Array.from(cells).some(cell => cell.textContent.toLowerCase().includes(search_data));

        if (rowMatches) {
            row.classList.remove('hide');
        } else {
            row.classList.add('hide');
        }
        row.style.setProperty('--delay', i / 25 + 's');
    });

    document.querySelectorAll('.content-table tbody tr:not(.hide)').forEach((visible_row, i) => {
        visible_row.style.backgroundColor = (i % 2 == 0) ? 'transparent' : '#0000000b';
    });
}


// Sorting
    let sortColumn = null;
    let sortAsc = true;

    // Add click event listeners to table headings for sorting
    table_headings.forEach((head, i) => {
        head.addEventListener('click', () => {
            // Toggle active class for sorting indication
            table_headings.forEach(h => h.classList.remove('active'));
            head.classList.add('active');
    
            // Toggle sorting order
            if (i === sortColumn) {
                sortAsc = !sortAsc;
            } else {
                sortColumn = i;
                sortAsc = true;
            }
    
            sortTable(i, sortAsc);
        });
    });

    function sortTable(column, sort_asc) {
        const sortedRows = [...table_rows].sort((a, b) => {
            const first_cell = a.querySelectorAll('td')[column];
            const second_cell = b.querySelectorAll('td')[column];
            const first_value = first_cell.textContent.trim();
            const second_value = second_cell.textContent.trim();
    
            if (column === 3) {
                // Handle date values in "MM/DD/YYYY" format
                const firstDateParts = first_value.split('/');
                const secondDateParts = second_value.split('/');
                const firstDate = new Date(firstDateParts[2], firstDateParts[0] - 1, firstDateParts[1]);
                const secondDate = new Date(secondDateParts[2], secondDateParts[0] - 1, secondDateParts[1]);
                return sort_asc ? firstDate - secondDate : secondDate - firstDate;
            } else if (!isNaN(first_value) && !isNaN(second_value)) {
                // Handle numeric values
                return sort_asc ? first_value - second_value : second_value - first_value;
            } else {
                // Fallback to string comparison for other columns
                return sort_asc ? first_value.localeCompare(second_value) : second_value.localeCompare(first_value);
            }
        });
    
        const tbody = document.querySelector('.content-table tbody');
        tbody.innerHTML = '';
        sortedRows.forEach(sorted_row => {
            tbody.appendChild(sorted_row);
        });
    }
    
    
    function isDate(value) {
        // Check if a string is in a date format (you might need to adjust this based on your date format)
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }

});