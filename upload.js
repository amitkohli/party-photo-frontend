// upload.js

const API_ENDPOINT = window.env.API_ENDPOINT;

const uploadForm = document.getElementById('uploadForm');
const photoInput = document.getElementById('photoInput');
const photoGallery = document.getElementById('photoGallery');

// Extract partyName from URL
const urlParams = new URLSearchParams(window.location.search);
const partyName = urlParams.get('partyName');

if (!partyName) {
  alert('Missing party name in URL');
}

// Load existing photos
async function loadPhotos() {
  const res = await fetch(`${API_ENDPOINT}/get-photos-by-party?partyName=${partyName}`);
  const photos = await res.json();

  photoGallery.innerHTML = '';
  photos.forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.signedUrl;
    img.alt = photo.photoKey;
    img.style.maxWidth = '200px';
    img.style.margin = '10px';
    photoGallery.appendChild(img);
  });
}

// Upload selected files
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const files = photoInput.files;
  if (!files.length) return alert('Please select at least one photo.');

  for (const file of files) {
    // Get presigned URL
    const res = await fetch(`${API_ENDPOINT}/get-upload-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partyName,
        fileName: file.name,
        contentType: file.type,
      }),
    });

    const { uploadUrl } = await res.json();

    // Upload photo to S3
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    });
  }

  photoInput.value = '';
  await loadPhotos();
});

// Initialize
loadPhotos();
