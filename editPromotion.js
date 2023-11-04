
    // Function to edit a promotion
    function editPromotion(id) {
        const row = document.querySelector(`tr[data-promo-id="${id}"]`);
        const fields = row.querySelectorAll('td[data-field]');

        fields.forEach(field => {
            const currentValue = field.textContent.trim();

            if (field.getAttribute('data-field') !== 'promo_status') {
                // Create an input element for editing other fields
                const input = document.createElement('input');
                input.value = currentValue;
                field.innerHTML = '';
                field.appendChild(input);
            }
        });

        // Create a dropdown with options for ACTIVE and INACTIVE for the "Status" field
        const statusField = row.querySelector('td[data-field="promo_status"]');
        const currentStatus = statusField.textContent.trim();
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

        // Replace the content of the "Status" field with the dropdown
        statusField.innerHTML = '';
        statusField.appendChild(dropdown);

        // Change the button text to "Save"
        const editButton = row.querySelector('.edit-button');
        editButton.textContent = 'Save';
        editButton.style.backgroundColor = '#40a347';
        editButton.style.color = 'white';
        editButton.onclick = () => savePromotion(id);
    }

    // Function to save a promotion
    function savePromotion(id) {
        const row = document.querySelector(`tr[data-promo-id="${id}"]`);
        const fields = row.querySelectorAll('td[data-field]');

        // Create an object to hold the updated values
        const updatedValues = {};

        fields.forEach(field => {
            const fieldName = field.getAttribute('data-field');
            
            if (fieldName === 'promo_status') {
                // Handle the "Status" field separately
                const statusField = row.querySelector('td[data-field="promo_status"]');
                const statusValue = statusField.querySelector('select').value;
                updatedValues[fieldName] = statusValue;
            } else {
                // Handle other fields
                const input = field.querySelector('input');
                updatedValues[fieldName] = input.value;
                field.innerHTML = input.value;
            }
        });

        // Send the updated values to the server via an AJAX request for saving
        fetch(`http://127.0.0.1:5000/updatepromotion/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedValues),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Log the response
            location.reload();  // Reset the form
        })
        .catch(error => {
            // Handle the fetch error
        });

        // Change the button text back to "Edit"
        const saveButton = row.querySelector('.edit-button');
        saveButton.textContent = 'Edit';
        saveButton.style.backgroundColor = '';
        saveButton.onclick = () => editPromotion(id);
    }
