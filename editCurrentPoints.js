// Function to edit the "Current Points" cell and make it editable
function editCurrentPoints(phoneNumber) {
    const cell = document.querySelector(`tr[data-phoneNumber="${phoneNumber}"] td:nth-child(5)`); // Target the "Current Points" cell
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
    editButton.onclick = () => saveCurrentPoints(phoneNumber);
}

// Function to save the updated "Current Points"
function saveCurrentPoints(phoneNumber) {
    const row = document.querySelector(`tr[data-phoneNumber="${phoneNumber}"]`);
    const cell = row.querySelector('td:nth-child(5)'); // Target the "Current Points" cell
    const input = cell.querySelector('input');
    const newPoints = input.value;

    // Send the updated "Current Points" to the server via an AJAX request for saving
    updateCurrentPoints(phoneNumber, newPoints);

    // Remove the input element and update the cell with the new value
    cell.innerHTML = newPoints;

    // Change the button text back to "Edit"
    const saveButton = row.querySelector('.edit-button');
    saveButton.textContent = 'Edit';
    saveButton.style.backgroundColor = '';
    saveButton.onclick = () => editCurrentPoints(phoneNumber);
}

// Function to send an update request to the server
async function updateCurrentPoints(phoneNumber, newPoints) {
    try {
        const response = await fetch(`/reward/updateCurrentPoints/${phoneNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPoints })
        });

        if (response.ok) {
            console.log('Current Points updated successfully.');
        } else {
            console.error('Failed to update Current Points.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
