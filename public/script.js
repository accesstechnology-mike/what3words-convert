const form = document.getElementById('convert-form');
const input = document.getElementById('w3w-input');
const resultsSection = document.getElementById('results');
const coordsP = document.getElementById('coords');
const errorP = document.getElementById('error');
const googleBtn = document.getElementById('google-link');
const appleBtn = document.getElementById('apple-link');
const copyGoogleBtn = document.getElementById('copy-google');
const copyAppleBtn = document.getElementById('copy-apple');
const mapFrame = document.getElementById('map-frame');

function buildLinks(lat, lng) {
  const google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const apple = `https://maps.apple.com/?q=${lat},${lng}`;
  return { google, apple };
}

async function handleSubmit(e) {
  e.preventDefault();
  errorP.classList.add('hidden');
  resultsSection.classList.add('hidden');

  const value = input.value.trim();
  if (!value) {
    return;
  }

  const payload = { w3w: value };
  try {
    const res = await fetch('/api/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Conversion failed');
    }

    const { latitude, longitude } = data;
    coordsP.textContent = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    const { google, apple } = buildLinks(latitude, longitude);
    googleBtn.onclick = () => window.open(google, '_blank');
    appleBtn.onclick = () => window.open(apple, '_blank');

    copyGoogleBtn.onclick = () => {
      navigator.clipboard.writeText(google);
      copyGoogleBtn.textContent = 'Copied!';
      setTimeout(() => (copyGoogleBtn.textContent = 'Copy Google Maps Link'), 1500);
    };
    copyAppleBtn.onclick = () => {
      navigator.clipboard.writeText(apple);
      copyAppleBtn.textContent = 'Copied!';
      setTimeout(() => (copyAppleBtn.textContent = 'Copy Apple Maps Link'), 1500);
    };

    mapFrame.src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

    resultsSection.classList.remove('hidden');
  } catch (err) {
    errorP.textContent = err.message;
    errorP.classList.remove('hidden');
  }
}

form.addEventListener('submit', handleSubmit);