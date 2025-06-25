// feed.js
const API_ENDPOINT = window.env.API_ENDPOINT;
const S3_BUCKET_URL = window.env.S3_BUCKET_URL;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const party = params.get('party');
  const gallery = document.getElementById('photoGallery');
  const status = document.getElementById('status');

  if (!party) {
    status.textContent = '❌ No party specified.';
    return;
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/get-photos-by-party?partyName=${encodeURIComponent(party)}`);
    const data = await response.json();

    if (response.ok && Array.isArray(data.photos)) {
      if (data.photos.length === 0) {
        status.textContent = 'No photos yet.';
        return;
      }

      status.textContent = `📸 ${data.photos.length} photo(s) for "${party}"`;

      data.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.signedUrl || `${S3_BUCKET_URL}/${photo.photoKey}`;
        img.alt = 'Party Photo';
        img.className = 'gallery-photo';
        gallery.appendChild(img);
      });
    } else {
      status.textContent = data.message || 'Error loading photos.';
    }
  } catch (err) {
    console.error(err);
    status.textContent = '⚠️ Failed to load photos.';
  }
});
