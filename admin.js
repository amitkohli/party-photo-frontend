// admin.js

const API_ENDPOINT = window.env.API_ENDPOINT;

const partySelect = document.getElementById('partySelect');
const photoInput = document.getElementById('photoInput');
const uploadBtn = document.getElementById('uploadBtn');
const photoGallery = document.getElementById('photoGallery');

let selectedParty = null;

// Fetch parties from localStorage (set by login-token.js)
function loadParties() {
  const parties = JSON.parse(localStorage.getItem('parties') || '[]');
  partySelect.innerHTML = '';
  parties.forEach(p => {
    const option = document.createElement('option');
    option.value = p;
    option.textContent = p;
    partySelect.appendChild(option);
  });

  if (parties.length > 0) {
    selectedParty = parties[0];
    partySelect.value = selectedParty;
    loadPhotos();
  }
}

partySelect.addEventListener('change', () => {
  selectedParty = partySelect.value;
  loadPhotos();
});

uploadBtn.addEventListener('click', async () => {
  const files = photoInput.files;
  if (!selectedParty || !files.length) return alert('Select a party and choose photos.');

  for (const file of files) {
    const res = await fetch(`${API_ENDPOINT}/get-upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partyName: selectedParty, fileName: file.name, contentType: file.type }),
    });
    const { uploadUrl, photoKey } = await res.json();
    await fetch(uploadUrl, { method: 'PUT', body: file });
  }

  loadPhotos();
});

async function loadPhotos() {
  if (!selectedParty) return;

  photoGallery.innerHTML = '<p>Loading photos...</p>';
  const res = await fetch(`${API_ENDPOINT}/get-photos-by-party?partyName=${selectedParty}`);
  const photos = await res.json();

  photoGallery.innerHTML = '';
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.signedUrl;
    img.style.maxWidth = '200px';
    img.style.margin = '10px';

    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.onclick = async () => {
      await fetch(`${API_ENDPOINT}/soft-delete-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyName: selectedParty, photoKey: photo.photoKey }),
      });
      loadPhotos();
    };

    const container = document.createElement('div');
    container.appendChild(img);
    container.appendChild(btn);
    photoGallery.appendChild(container);
  });
}

loadParties();
