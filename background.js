// Function to get the stored GitHub token
function getGitHubToken() {
    return new Promise((resolve, reject) => {
        browser.storage.local.get('githubToken', (result) => {
            if (browser.runtime.lastError) {
                reject(new Error('Error retrieving the GitHub token.'));
            } else {
                resolve(result.githubToken);
            }
        });
    });
}

// Function to get clipboard contents
function getClipboardContents() {
    // This function needs to be adjusted based on how you plan to capture clipboard data
    return new Promise((resolve, reject) => {
        navigator.clipboard.readText().then(
            text => resolve(text),
            err => reject('Failed to read clipboard contents: ' + err)
        );
    });
}

// Function to upload contents to GitHub
async function uploadToGitHub(content) {
    try {
        const token = await getGitHubToken();
        if (!token) {
            console.error('GitHub token is not set.');
            return;
        }

        const {userAndRepo: repo = ""} = await browser.storage.local.get('userAndRepo') || {};
        let {path: repoPath = ""} = await browser.storage.local.get('path') || {}; // TODO: trim repoPath
        repoPath += `${(new Date()).toISOString()}.md`;

        // Set up GitHub API request details
        const url = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
        const data = {
            message: 'Update from Clipboard Extension',
            content: btoa(content)  // Base64 encode the content
        };

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'token ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const jsonResponse = await response.json();
        console.log('Upload response:', jsonResponse);
    } catch (error) {
        console.error('Error uploading to GitHub:', error);
    }
}

// Listening for a message from the popup or content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'uploadToGitHub') {
        getClipboardContents().then(content => {
            uploadToGitHub(content);
        }).catch(err => {
            console.error(err);
        });
    }
});
