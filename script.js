// --- Side menu ---
function toggleMenu() {
  const menu = document.getElementById('side-menu');
  menu.classList.toggle('hidden');
}

// --- Google Sign-In callback ---
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

// --- Dashboard user info loading and friends list ---
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('dashboard.html')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return window.location.href = 'login.html';
    document.getElementById('user-name').textContent = user.name;
    document.getElementById('profile-pic').src = user.picture;
    document.getElementById('user-username').textContent = user.username ? ("@" + user.username) : "(No username set)";
    renderFriends();
  }
  // Pre-fill username input if on dashboard
  if (document.getElementById('username-input')) {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('username-input').value = user?.username || "";
  }
});

// --- Username Management ---
function saveUsername() {
  const usernameInput = document.getElementById('username-input');
  const usernameError = document.getElementById('username-error');
  let newUsername = usernameInput.value.trim();

  if (!newUsername.match(/^[a-zA-Z0-9_]{3,16}$/)) {
    usernameError.textContent = "Username must be 3-16 chars, letters/numbers/_ only.";
    return;
  }

  // Check for uniqueness across all users (using localStorage for demo)
  let allUsernames = JSON.parse(localStorage.getItem('allUsernames') || '{}');
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return window.location.href = 'login.html';

  if (allUsernames[newUsername] && allUsernames[newUsername] !== user.email) {
    usernameError.textContent = "Username is already taken!";
    return;
  }
  // Remove previous username if changing
  Object.keys(allUsernames).forEach(u => {
    if (allUsernames[u] === user.email) delete allUsernames[u];
  });

  // Save username
  allUsernames[newUsername] = user.email;
  localStorage.setItem('allUsernames', JSON.stringify(allUsernames));

  // Save to user profile
  user.username = newUsername;
  localStorage.setItem('user', JSON.stringify(user));
  document.getElementById('user-username').textContent = "@" + newUsername;
  usernameError.textContent = "Username saved!";
  setTimeout(closeSettings, 800);
}

// --- Friends Logic ---
function addContact() {
  const input = document.getElementById('contact-username');
  const errorDiv = document.getElementById('add-contact-error');
  const username = input.value.trim();
  errorDiv.textContent = "";

  if (!username) return errorDiv.textContent = "Enter a username.";
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.username) return errorDiv.textContent = "Set your username in settings first.";

  let allUsernames = JSON.parse(localStorage.getItem('allUsernames') || '{}');
  if (!allUsernames[username]) return errorDiv.textContent = "No user found with that username.";
  if (username === user.username) return errorDiv.textContent = "You cannot add yourself.";

  // Get friends
  let contacts = JSON.parse(localStorage.getItem('contacts_' + user.email) || '[]');
  if (contacts.includes(username)) return errorDiv.textContent = "Already added!";

  contacts.push(username);
  localStorage.setItem('contacts_' + user.email, JSON.stringify(contacts));
  errorDiv.textContent = "Friend added!";
  input.value = "";
  renderFriends();
}

function renderFriends() {
  const user = JSON.parse(localStorage.getItem('user'));
  const friendsDiv = document.getElementById('friends-list');
  if (!friendsDiv) return;
  friendsDiv.innerHTML = "";
  let contacts = JSON.parse(localStorage.getItem('contacts_' + user.email) || '[]');
  let allUsernames = JSON.parse(localStorage.getItem('allUsernames') || '{}');
  let emailToUser = {};
  // Build lookup table for all users
  Object.entries(allUsernames).forEach(([uname, email]) => { emailToUser[email] = uname; });

  contacts.forEach(username => {
    let email = allUsernames[username];
    // Get friend's profile info from their localStorage (simulate "global" for demo)
    let friendDataRaw = window.localStorage.getItem('user_for_' + email);
    let friendData;
    if (friendDataRaw) {
      friendData = JSON.parse(friendDataRaw);
    } else {
      // Try to get from own user cache if friend has logged in on this browser
      friendData = JSON.parse(window.localStorage.getItem('user')) || {};
    }
    const card = document.createElement('div');
    card.className = "friend-card";
    card.innerHTML = `
      <img class="friend-pic" src="${friendData?.picture || 'https://via.placeholder.com/64'}" alt="Friend Pic">
      <div class="friend-username">@${username}</div>
      <div class="friend-email">${email}</div>
      <div class="friend-actions">
        <button onclick="openChat('${username}')">Chat</button>
        <button onclick="removeFriend('${username}')">Remove</button>
      </div>
    `;
    friendsDiv.appendChild(card);
  });
}

function removeFriend(username) {
  const user = JSON.parse(localStorage.getItem('user'));
  let contacts = JSON.parse(localStorage.getItem('contacts_' + user.email) || '[]');
  contacts = contacts.filter(u => u !== username);
  localStorage.setItem('contacts_' + user.email, JSON.stringify(contacts));
  renderFriends();
}

// --- Chat logic ---
function openChat(username) {
  document.getElementById('chat-section').classList.remove('hidden');
  document.getElementById('chat-with').textContent = username;
  renderMessages(username);
}
function closeChat() {
  document.getElementById('chat-section').classList.add('hidden');
}
function renderMessages(username) {
  const user = JSON.parse(localStorage.getItem('user'));
  const messagesDiv = document.getElementById('messages');
  if (!messagesDiv) return;
  let chatKey = 'chat_' + user.username + '_' + username;
  let messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
  messagesDiv.innerHTML = "";
  messages.forEach(msg => {
    const p = document.createElement('p');
    p.textContent = (msg.sender === user.username ? "You: " : username + ": ") + msg.text;
    messagesDiv.appendChild(p);
  });
}
function sendMessage() {
  const user = JSON.parse(localStorage.getItem('user'));
  const chatWith = document.getElementById('chat-with').textContent;
  const input = document.getElementById('chat-input');
  let chatKey = 'chat_' + user.username + '_' + chatWith;
  let messages = JSON.parse(localStorage.getItem(chatKey) || '[]');
  if (!input.value.trim()) return;
  messages.push({ sender: user.username, text: input.value.trim() });
  localStorage.setItem(chatKey, JSON.stringify(messages));
  input.value = "";
  renderMessages(chatWith);
}

// --- Modal and Utility ---
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
}
function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}
function deleteAccount() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return window.location.href = 'login.html';

  // Remove username from allUsernames
  let allUsernames = JSON.parse(localStorage.getItem('allUsernames') || '{}');
  Object.keys(allUsernames).forEach(u => {
    if (allUsernames[u] === user.email) delete allUsernames[u];
  });
  localStorage.setItem('allUsernames', JSON.stringify(allUsernames));
  localStorage.removeItem('user');
  localStorage.removeItem('contacts_' + user.email);
  alert('Your account info has been deleted from this app.');
  window.location.href = 'login.html';
}

// --- Save user info globally for demo (simulate "global" presence) ---
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.email) {
    localStorage.setItem('user_for_' + user.email, JSON.stringify(user));
  }
});
