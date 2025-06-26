const API_ENDPOINT = window.env.API_ENDPOINT;

const statusEl = document.getElementById("status");
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
  statusEl.textContent = "❌ No token provided in the URL.";
} else {
  verifyLoginToken(token);
}

async function verifyLoginToken(token) {
  try {
    const res = await fetch(`${API_ENDPOINT}/verify-login-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Token verification failed.");
    }

    if (data.parties && data.parties.length > 0) {
      const partyName = data.parties[0];

      // 🌐 Adjust this path if your SPA routing differs
      window.location.href = `admin.html?party=${encodeURIComponent(partyName)}`;
    } else {
      statusEl.textContent = `✅ Logged in as ${data.email}, but no parties found.`;
    }
  } catch (err) {
    console.error("Token verification error:", err);
    statusEl.textContent = `❌ ${err.message || "An unexpected error occurred."}`;
  }
}
