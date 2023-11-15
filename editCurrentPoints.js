// Function to edit the "Current Points" cell and make it editable
function editCurrentPoints(phone_number) {
    const cell = document.querySelector(`tr[data-phone_number="${phone_number}"] td:nth-child(5)`); // Target the "Current Points" cell
    const currentValue = cell.textContent.trim();

    // Create an input element for editing the "Current Points"
    const input = document.createElement('input');
    input.value = currentValue;
    cell.innerHTML = '';
    cell.appendChild(input);

    // Change the button text to "Save"
    const editButton = cell.closest('tr').querySelector('.edit-button');
    editButton.textContent = 'Save';
    editButton.style.backgroundColor = '#40a347';
    editButton.style.color = 'white';
    editButton.onclick = () => saveCurrentPoints(phone_number);
}

// Function to save the updated "Current Points"
function saveCurrentPoints(phone_number) {
    const row = document.querySelector(`tr[data-phone_number="${phone_number}"]`);
    const cell = row.querySelector('td:nth-child(5)'); // Target the "Current Points" cell
    const input = cell.querySelector('input');
    const newPoints = input.value;

    // Send the updated "Current Points" to the server via an AJAX request for saving
    updateCurrentPoints(phone_number, newPoints);

    // Remove the input element and update the cell with the new value
    cell.innerHTML = newPoints;

    // Change the button text back to "Edit"
    const saveButton = row.querySelector('.edit-button');
    saveButton.textContent = 'Edit';
    saveButton.style.backgroundColor = '';
    saveButton.onclick = () => editCurrentPoints(phone_number);
}

// Function to send an update request to the server
function updateCurrentPoints(phone_number, newPoints) {
    try {
        fetch(`http://127.0.0.1:5000/updatepoints/${phone_number}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPoints })
        });

        if (response.ok) {
            console.log('Current Points updated successfully.');
            location.reload();
        } else {
            console.error('Failed to update Current Points.');
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}
