    // Edit promotion 
    function editPromotion(id) {
        const row = document.querySelector(`tr[data-promo-id="${id}"]`);
        const statusField = row.querySelector('td[data-field="promo_status"]');
        const currentStatus = statusField.textContent.trim();

        // Create a dropdown with options for ACTIVE and INACTIVE
        const dropdown = document.createElement('select');
        dropdown.className = 'status-edit';
        
        const activeOption = document.createElement('option');
        activeOption.value = 'ACTIVE';
        activeOption.textContent = 'ACTIVE';
        
        const inactiveOption = document.createElement('option');
        inactiveOption.value = 'INACTIVE';
        inactiveOption.textContent = 'INACTIVE';
        
        dropdown.appendChild(activeOption);
        dropdown.appendChild(inactiveOption);

        // Set the selected option based on the current status
        if (currentStatus === 'ACTIVE') {
            activeOption.selected = true;
        } else if (currentStatus === 'INACTIVE') {
            inactiveOption.selected = true;
        }

        // Replace the content with the dropdown
        statusField.innerHTML = '';
        statusField.appendChild(dropdown);

        // Change "Edit" button to "Save" button with green color
        const editButton = row.querySelector('.edit-button');
        editButton.textContent = 'Save';
        editButton.style.backgroundColor = '#40a347';
        editButton.style.color = 'white';
        editButton.onclick = () => savePromotion(id);
    }

    function savePromotion(id) {
    const row = document.querySelector(`tr[data-promo-id="${id}"]`);
    const fields = row.querySelectorAll('td');

    // Collect the updated values from the editable fields
    const updatedValues = {};
    fields.forEach(field => {
        updatedValues[field.getAttribute('data-field')] = field.innerText;
        field.contentEditable = false;
    });

    // Add the updated status to updatedValues
    const statusField = row.querySelector('td[data-field="promo_status"]');
    const statusValue = statusField.querySelector('select').value;
    updatedValues['promo_status'] = statusValue;

    // Send updatedValues to the server via an AJAX request for saving
    fetch(`/promotion/updatePromotion/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedValues),
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response, e.g., show success or error messages
        if (data.success) {
            // Data was successfully updated on the server
            // Update the status in the UI
            const statusField = row.querySelector('td[data-field="promo_status"]');
            const statusValue = data.promo_status; // Assuming the response includes the updated status
            statusField.innerHTML = `<div class="status ${statusValue}">${statusValue}</div>`;
        } else {
            // Handle the error
        }
    })
    .catch(error => {
        // Handle the fetch error
    });

    // Change "Save" button back to "Edit" button
    const saveButton = row.querySelector('.edit-button');
    saveButton.textContent = 'Edit';
    saveButton.style.backgroundColor = ''; // Remove the green color
    saveButton.onclick = () => editPromotion(id);
}

    document.getElementById('submitPromotion').addEventListener('click', function() {
    // Get the form data
    const pointsCost = document.querySelector('[name="pointsCost"]').value;
    const expirationDate = document.querySelector('[name="expirationDate"]').value;
    const description = document.querySelector('[name="promotionName"]').value; // Changed to "promotionName"
    const status = document.querySelector('[name="status"]').checked ? 'ACTIVE' : 'INACTIVE';

    // Create a new table row
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>New ID</td>
        <td>${description}</td>
        <td>${description}</td>
        <td>${pointsCost}</td>
        <td>${expirationDate}</td>
        <td class="${status}">${status}</td>
        <td><button class="edit-button" onclick="editPromotion('New ID')">Edit</button></td>
    `;

    // Append the new row to the table
    document.querySelector('.content-table tbody').appendChild(newRow);

    // After adding a new promotion, you should add an event listener for editing that new promotion.
    newRow.querySelector('.edit-button').addEventListener('click', function() {
        editPromotion('New ID'); // You can use a unique ID for the new promotion
    });
});