// photos.js

const API_ENDPOINT = window.env.API_ENDPOINT;
const S3_BUCKET_URL = window.env.S3_BUCKET_URL;

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const partyName = params.get('partyName');
  const uploadEnabled = params.get('upload') !== 'false'; // default: true

  const photoGallery = document.getElementById('photoGallery');
  const uploadSection = document.getElementById('uploadSection');
  const statusEl = document.getElementById('status');

  if (!partyName) {
    statusEl.textContent = '❌ No party name provided.';
    return;
  }

  if (!uploadEnabled) {
    uploadSection.style.display = 'none';
  }

  document.getElementById('uploadBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('photoInput');
    const files = input.files;
    if (!files.length) return;

    statusEl.textContent = 'Uploading...';
    for (const file of files) {
      try {
        const res = await fetch(`${API_ENDPOINT}/get-upload-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            partyName,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload URL error');

        await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        // Show newly uploaded photo
        const img = document.createElement('img');
        img.src = `${S3_BUCKET_URL}/${data.photoKey}`;
        img.className = 'gallery-photo';
        photoGallery.appendChild(img);

      } catch (err) {
        console.error(err);
        statusEl.textContent = `❌ Error uploading ${file.name}`;
        return;
      }
    }
    statusEl.textContent = '✅ Uploaded successfully!';
  });

  // Load existing photos
  loadPhotos();

  async function loadPhotos() {
    try {
      statusEl.textContent = 'Loading photos...';
      const res = await fetch(`${API_ENDPOINT}/get-photos-by-party?partyName=${encodeURIComponent(partyName)}`);
      const data = await res.json();

      if (!res.ok) {
        statusEl.textContent = data.message || 'Failed to fetch photos.';
        return;
      }

      if (!data.photos.length) {
        statusEl.textContent = 'No photos yet.';
        return;
      }

      statusEl.textContent = `📸 ${data.photos.length} photo(s)`;
      data.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.signedUrl || `${S3_BUCKET_URL}/${photo.photoKey}`;
        img.className = 'gallery-photo';
        photoGallery.appendChild(img);
      });
    } catch (err) {
      console.error(err);
      statusEl.textContent = '❌ Error loading photos.';
    }
  }
});
