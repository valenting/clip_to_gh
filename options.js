// Saves options to browser.storage
function saveOptions() {
  var token = document.getElementById('token').value;
  browser.storage.local.set({
    githubToken: token
  }, function() {
    // Update status to let user know options were saved
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in browser.storage
function restoreOptions() {
  // Use default value blank ('')
  browser.storage.local.get({
    githubToken: ''
  }, function(items) {
    document.getElementById('token').value = items.githubToken;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
