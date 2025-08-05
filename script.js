// Existing side menu code...

function toggleMenu() {
  const menu = document.getElementById('side-menu');
  menu.classList.toggle('hidden');
}

// Placeholder user info (replace with Google Sign-In info later)
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('dashboard.html')) {
    // Simulate signed-in user
    document.getElementById('user-name').textContent = 'John Doe';
    document.getElementById('profile-pic').src = 'https://randomuser.me/api/portraits/men/1.jpg';
  }
});

function openSettings() {
  alert('Settings modal would open here.');
}

function deleteAccount() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    alert('Account deletion would be handled here.');
  }
}
