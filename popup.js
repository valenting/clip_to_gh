// DOM elements
const targetListElement = document.getElementById('target-list');
const listPanelElement = document.getElementById('list-panel');
const addNewButton = document.getElementById('add-new');
const newTargetForm = document.getElementById('new-target-form');
const githubUserRepoInput = document.getElementById('github-user-repo');
const githubPathInput = document.getElementById('github-path');
const githubTokenInput = document.getElementById('github-token');
const openAfterCheckbox = document.getElementById('open-after');
const saveTargetButton = document.getElementById('save-target');
const deleteTargetButton = document.getElementById('delete-target');
let targetElement = null;

const turndownService = new TurndownService({headingStyle: "atx", bulletListMarker: "-"});
// Github flavored markdown
turndownService.use(turndownPluginGfm.gfm);

// Original handler of li element.
let originalLi = turndownService.rules.array.filter((e) => e.filter == "li")[0];
// Make sure nested lists are properly indented
turndownService.addRule("indent-list", {
  filter: ["li"],
  replacement: function (content, node, options) {
    let indentLevel = 0;
    let parent = node.parentNode;
    while (parent) {
      if (parent.nodeName === 'OL' || parent.nodeName === 'LI' || parent.nodeName === 'UL') {
        indentLevel = indentLevel + 1;
      }
      parent = parent.parentNode;
    }
    if (indentLevel > 0) {
      indentLevel = indentLevel - 1;
    }
    let indentation = "    ".repeat(indentLevel);
    return indentation + originalLi.replacement(content, node, options);
  }
});

// Load existing targets from localStorage
let targets = JSON.parse(localStorage.getItem('targets')) || [];

// Function to save targets to localStorage
function saveTargets() {
  localStorage.setItem('targets', JSON.stringify(targets));
}

// Function to create a list item for a target
function createListItem(target, index) {
  const listItem = document.createElement('li');
  
  const uploadButton = document.createElement('button');
  uploadButton.textContent = `⇪ ${target.github_user_repo} - ${target.path}`;
  uploadButton.onclick = () => uploadToTarget(target);
  listItem.appendChild(uploadButton);

  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.onclick = () => editTarget(index);
  listItem.appendChild(editButton);

  return listItem;
}

// Function to load and display targets
function loadTargets() {
  targetListElement.innerHTML = ''; // Clear existing list
  targets.forEach((target, index) => {
    targetListElement.appendChild(createListItem(target, index));
  });
}

function formatPath(path) {
  // Remove the leading '/' if it exists
  if (path.startsWith('/')) {
    path = path.substring(1);
  }

  // If the path is not empty and doesn't end with a '/', add one
  if (path && !path.endsWith('/')) {
    path += '/';
  }

  return path;
}

function bytesToBase64(bytes) {
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

// https://developer.mozilla.org/en-US/docs/Glossary/Base64#the_unicode_problem
function unicodeStringTob64(string) {
  let bytes = new TextEncoder().encode(string);
  const binString = String.fromCodePoint(...bytes);
  return btoa(binString);
}

// Function to handle the upload action
function uploadToTarget(target) {

  let getClipboard = () => {
    if (navigator.clipboard.read) {
      return navigator.clipboard.read();
    }
    return navigator.clipboard.readText();
  }

  getClipboard().then(async clipboardContent => {
    console.log("clipping");
    let content = "";
    if (typeof clipboardContent != "string") {
      if (clipboardContent[0].types.includes("text/html")) {  
        let blob = await clipboardContent[0].getType("text/html");
        content = await blob.text();
        content = turndownService.turndown(content);
      } else {
        let blob = await clipboardContent[0].getType("text/plain");
        content = await blob.text();
      }
    }
    let path = formatPath(target.path);
    path = `${path}${(new Date()).toISOString()}.md`;
    let githubApiUrl = `https://api.github.com/repos/${target.github_user_repo}/contents/${path}`;
    let base64Content = unicodeStringTob64(content);
    let message = "File uploaded from Clipboard";
    let data = {
      message: message,
      content: base64Content
    };

    fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + target.token,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Network response was not ok.');
    })
    .then(data => {
      console.log(data);

      if (target.openAfter) {        
          let link = data?.content?._links?.html;
          browser.tabs.create({
            url: link
          });
      }

      document.getElementById('status').textContent = 'Upload successful!';
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('status').textContent = 'Upload failed.';
    });
  }).catch(error => {
    console.error('Error:', error);
    document.getElementById('status').textContent = 'Failed to read clipboard.';
  });
}


// Function to show the form for adding a new target
addNewButton.addEventListener('click', function() {
  listPanelElement.style.display = 'none';
  deleteTargetButton.style.display = 'none';
  newTargetForm.style.display = 'block';
});

// Function to save a new or updated target
saveTargetButton.addEventListener('click', function() {
  const githubUserRepo = githubUserRepoInput.value.trim();
  const githubPath = githubPathInput.value.trim();
  const githubToken = githubTokenInput.value.trim();
  const openAfter = openAfterCheckbox.checked;

  if (githubUserRepo && githubToken) {
    if (!targetElement) {
        targetElement = {};
        targets.push(targetElement);
    }
    targetElement.github_user_repo = githubUserRepo;
    targetElement.path = githubPath;
    targetElement.token = githubToken;
    targetElement.openAfter = openAfter;
    targetElement = null;

    saveTargets();
    closeEditPanel();
  } else {
    document.getElementById('status').textContent = 'Please fill in all fields.';
  }
});

function closeEditPanel() {
    loadTargets();
    newTargetForm.style.display = 'none';
    githubUserRepoInput.value = '';
    githubPathInput.value = '';
    githubTokenInput.value = '';
    listPanelElement.style.display = 'block';
    deleteTargetButton.style.display = 'block';
}

deleteTargetButton.addEventListener('click', function() {
    if (!targetElement) {
        return;
    }
    deleteTarget(targets.indexOf(targetElement));
});

// Function to edit an existing target
function editTarget(index) {
  const target = targets[index];
  githubUserRepoInput.value = target.github_user_repo;
  githubPathInput.value = target.path;
  githubTokenInput.value = target.token;
  openAfterCheckbox.checked = target.openAfter;
  newTargetForm.style.display = 'block';
  listPanelElement.style.display = 'none';
  targetElement = targets[index];
}

// Function to delete a target
function deleteTarget(index) {
  targets.splice(index, 1);
  saveTargets();
  closeEditPanel();
}

// Initial load of targets
loadTargets();
