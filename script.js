
let lastCoords = null;


const DIGIPIN_GRID = [
  ['F', 'C', '9', '8'],
  ['J', '3', '2', '7'],
  ['K', '4', '5', '6'],
  ['L', 'M', 'P', 'T']
];

const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5
};

function getDigiPin(lat, lon) {
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat) throw new Error("Latitude out of range");
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon) throw new Error("Longitude out of range");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let digiPin = "";

  for (let level = 1; level <= 10; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    let row = 3 - Math.floor((lat - minLat) / latDiv);
    let col = Math.floor((lon - minLon) / lonDiv);

    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    digiPin += DIGIPIN_GRID[row][col];
    if (level === 3 || level === 6) digiPin += "-";

    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);
    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin;
}

function getLatLngFromDigiPin(digiPin) {
  const pin = digiPin.replace(/-/g, "");
  if (pin.length !== 10) throw new Error("Invalid DIGIPIN");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < 10; i++) {
    const char = pin[i];
    let found = false, ri, ci;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) throw new Error("Invalid character in DIGIPIN");

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  return {
    latitude: ((minLat + maxLat) / 2).toFixed(6),
    longitude: ((minLon + maxLon) / 2).toFixed(6)
  };
}

// UI Hookups
function encode() {
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);
  try {
    const pin = getDigiPin(lat, lon);
    document.getElementById("pinResult").textContent = "DIGIPIN: " + pin;
  } catch (err) {
    document.getElementById("pinResult").textContent = err.message;
  }
}

function encode2() {
  const input = document.getElementById("coords").value.trim(); // 💡 Correct ID, correct var

  // Check if it includes comma
  if (!input.includes(",")) {
    document.getElementById("pinResult2").textContent = "Please enter both coordinates separated by a comma.";
    return;
  }

  // Split and clean values
  const [latStr, lonStr] = input.split(",");
  const lat = parseFloat(latStr.trim());
  const lon = parseFloat(lonStr.trim());

  // Check if they’re numbers
  if (isNaN(lat) || isNaN(lon)) {
    document.getElementById("pinResult2").textContent = "Invalid latitude or longitude.";
    return;
  }

  // Calculate DIGIPIN
  try {
    const pin = getDigiPin(lat, lon); // 💡 Make sure getDigiPin() is in scope
    document.getElementById("pinResult2").textContent = "DIGIPIN: " + pin;
  } catch (err) {
    document.getElementById("pinResult2").textContent = err.message;
  }
}


function decode() {
  const pin = document.getElementById("digi").value.trim().toUpperCase();
  try {
    const coords = getLatLngFromDigiPin(pin);
    document.getElementById("coordResult").textContent =
      `Latitude: ${coords.latitude}, Longitude: ${coords.longitude}`;

    lastCoords = coords; // Save coordinates for later use
    document.getElementById("gmapsBtn").style.display = "inline-block"; // Show button
  } catch (err) {
    document.getElementById("coordResult").textContent = err.message;
    document.getElementById("gmapsBtn").style.display = "none"; // Hide if there's an error
  }
}
function openInGMaps() {
  if (!lastCoords) return;
  const url = `https://www.google.com/maps?q=${lastCoords.latitude},${lastCoords.longitude}`;
  window.open(url, "_blank");
}


const copyPinBtn = document.getElementById("copyPinBtn");
const copyCoordBtn = document.getElementById("copyCoordBtn");

// Load the sound file
const clickSound = new Audio('soundfx/click.mp3');
const openinGMaps = new Audio('soundfx/message.mp3');


// Play sound on a button click
document.getElementById('getcord').addEventListener('click', () => {
  clickSound.currentTime = 0; // Reset in case it's still playing
  clickSound.play();
  navigator.vibrate(200);
});

// Play sound on a button click
document.getElementById('getcode').addEventListener('click', () => {
  clickSound.currentTime = 0; // Reset in case it's still playing
  clickSound.play();
  navigator.vibrate(130);
});

document.getElementById('getcode2').addEventListener('click', () => {
  clickSound.currentTime = 0; // Reset in case it's still playing
  clickSound.play();
  navigator.vibrate(150);
});


// Play sound on a gmapsbtnlclick
document.getElementById('gmapsBtn').addEventListener('click', () => {
  openinGMaps.currentTime = 0; // Reset in case it's still playing
  openinGMaps.play();
  navigator.vibrate(150);
});

function getLocationAndConvert() {
  clickSound.currentTime = 0;
  clickSound.play();

  if ("vibrate" in navigator) {
    navigator.vibrate(150);
  }


  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const pin = getDigiPin(lat, lon);
        document.getElementById("pinResult").textContent = `Your DIGIPIN: ${pin}`;
        document.getElementById("lat").value = lat.toFixed(6);
        document.getElementById("lon").value = lon.toFixed(6);
      } catch (err) {
        document.getElementById("pinResult").textContent = err.message;
      }
    },
    (error) => {
      alert("Unable to retrieve your location. Error: " + error.message);
    }
  );
}