document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('uploadButton');
    const userAndRepoInput = document.getElementById('userAndRepo');
    const pathInput = document.getElementById('path');
    const statusDiv = document.getElementById('status');

    // Function to update the status message in the popup
    function updateStatus(message) {
        statusDiv.textContent = message;
    }

    // Function to save the userAndRepo and path to local storage
    function saveOptions(userAndRepo, path) {
        browser.storage.local.set({ userAndRepo, path });
    }

    // Function to restore the userAndRepo and path from local storage
    function restoreOptions() {
        browser.storage.local.get(['userAndRepo', 'path'], function(items) {
            if (items.userAndRepo) {
                userAndRepoInput.value = items.userAndRepo;
            }
            if (items.path) {
                pathInput.value = items.path;
            }
        });
    }

    // Restore options when the popup is loaded
    restoreOptions();

    // Add click event listener to the upload button
    uploadButton.addEventListener('click', function() {
        const userAndRepo = userAndRepoInput.value.trim();
        const path = pathInput.value.trim();

        if (userAndRepo === '') {
            updateStatus('Please enter a valid user/repo and path.');
            return;
        }

        updateStatus('Uploading...');

        // Save the userAndRepo and path
        saveOptions(userAndRepo, path);

        // Send a message to the background script to upload the clipboard content
        browser.runtime.sendMessage({action: 'uploadToGitHub', userAndRepo, path}).then(response => {
            updateStatus('Upload successful!');
        }).catch(error => {
            console.error('Error:', error);
            updateStatus('Error: ' + error.message);
        });
    });
});
