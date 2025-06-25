// login-token.js
const API_ENDPOINT = window.env.API_ENDPOINT;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const partyListDiv = document.getElementById('partyList');
  const statusEl = document.getElementById('status');

  if (!token) {
    statusEl.textContent = 'No login token provided in the URL.';
    return;
  }

  try {
    const res = await fetch(`${API_ENDPOINT}/verify-login-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (res.ok && Array.isArray(data.parties)) {
      if (data.parties.length === 0) {
        statusEl.textContent = 'No parties associated with this login.';
        return;
      }

      statusEl.textContent = 'Choose a party to manage:';

      data.parties.forEach(partyName => {
        const link = document.createElement('a');
        link.href = `admin.html?party=${encodeURIComponent(partyName)}`;
        link.textContent = partyName;
        link.style.display = 'block';
        partyListDiv.appendChild(link);
      });
    } else {
      statusEl.textContent = data.message || 'Invalid or expired token.';
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    statusEl.textContent = 'An error occurred while verifying your token.';
  }
});
