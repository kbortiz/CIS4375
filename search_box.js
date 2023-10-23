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
table_headings.forEach((head, i) => {
    let sort_asc = true;
    head.onclick = () => {
        table_headings.forEach(head => head.classList.remove('active'));
        head.classList.add('active');

        document.querySelectorAll('td').forEach(td => td.classList.remove('active'));
        table_rows.forEach(row => {
            row.querySelectorAll('td')[i].classList.add('active');
        })

        head.classList.toggle('asc', sort_asc);
        sort_asc = head.classList.contains('asc') ? false : true;

        sortTable(i, sort_asc);
    }
})


function sortTable(column, sort_asc) {
    const sortedRows = [...table_rows].sort((a, b) => {
        let first_row = a.querySelectorAll('td')[column].textContent.toLowerCase();
        let second_row = b.querySelectorAll('td')[column].textContent.toLowerCase();

        return sort_asc ? (first_row < second_row ? 1 : -1) : (first_row < second_row ? -1 : 1);
    });

    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Clear the tbody content

    sortedRows.forEach(sorted_row => {
        tbody.appendChild(sorted_row); // Append each sorted row to the tbody
    });
}

});