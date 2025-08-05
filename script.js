// Side menu toggle
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  menu.classList.toggle('hidden');
}

// Google Sign-In callback (used in login/signup)
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  localStorage.setItem('user', JSON.stringify({
    name: data.name,
    picture: data.picture,
    email: data.email
  }));
  window.location.href = 'dashboard.html';
}

// JWT decode helper
function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

// Dashboard user info loading
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('dashboard.html')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      document.getElementById('user-name').textContent = user.name;
      document.getElementById('profile-pic').src = user.picture;
    } else {
      window.location.href = 'login.html';
    }
  }
});

// Logout utility
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Account settings modal
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

// Delete Account
function deleteAccount() {
  if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
    localStorage.removeItem('user');
    alert('Your account info has been deleted from this app.');
    window.location.href = 'login.html';
  }
}
