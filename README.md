![React](https://img.shields.io/badge/React-18-blue)
![Google Maps](https://img.shields.io/badge/Google%20Maps-API-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## 🔗 Live Demo
👉 [Live Demo](https://google-maps-zone-manager.vercel.app)

# Google Map Zone — Delivery Zone Demo

A React-based interactive map demo for visualizing and managing delivery zones, sub-zones, and vendors using Google Maps.


## Preview

### Drawing a New Zone
![Drawing a zone](screenshots/01_drawing-zone.png)

### Filter Panel
![Area filter panel](screenshots/02_filters.png)

### Filter by Zone
![Filter by zone](screenshots/03_filter-by-zone.png)

### All zones vendor info popup when selecting location icon
![All zones vendor info popup when selecting location icon](screenshots/04_vendor-info-popup.png)

### See particular zone with vendors inside the zone
![See particular zone with vendors inside the zone](screenshots/05_cancel-filter-see-particular-zone.png)

### Filter by Pincode
![Filter by pincode](screenshots/06_filter-by-pincode.png)

## Features

- **Pincode-level Zones** — Display polygon boundaries for delivery pincodes on the map
- **Sub-zones** — View granular zones within a pincode (e.g. Zone 1000, 1001 inside pincode 641032)
- **Area Filter Panel** — Filter visible zones by pincode and/or sub-zone
- **Colored Vendor Markers** — Each vendor marker is colored to match its zone, with name labels
- **Vendor Info Popup** — Click any marker to see vendor ID, name, type, phone, and address
- **Drawing Tool** — Use the polygon drawing tool to sketch new delivery zones on the map
- **Selected Zone Tags** — Active filters shown as removable tags in the toolbar

---

## 🛠️ Tech Stack

- [React](https://reactjs.org/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api)


## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/atozcreators/google-maps-zone-manager.git
cd google-map-zone
```

### 2. Install dependencies

```bash
npm install / npm i
```

### 3. Set up your Google Maps API key

Create a `.env` file in the root of the project:

```env
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
```

> Make sure your API key has **Maps JavaScript API** and **Geocoding API** enabled in Google Cloud Console. Never commit your `.env` file — it's already in `.gitignore`.

### 4. Run the app

```bash
npm start
```

App will run at `http://localhost:3000`

---

## Data Structure

All data lives in `src/data/data.js` and is hardcoded for demo purposes.

### `zoneData`
Pincode-level polygon boundaries.
```js
{
  "641032": [{ lat, lng }, ...],
  "641033": [{ lat, lng }, ...],
}
```

### `pinZoneData`
Sub-zones nested inside each pincode.
```js
{
  "641032": {
    "1000": [{ lat, lng }, ...],
    "1001": [{ lat, lng }, ...],
  }
}
```

### `vendorData`
Vendors grouped by pincode, each with an optional `zone_id` linking to a sub-zone.
```js
{
  "641032": [
    { zone_id: "1000", vendor_id: 122331, vendor_name: "Praveen", ... },
  ]
}
```

---

## 🔑 Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Maps JavaScript API** and **Geocoding API**
4. Create an API key and paste it in your `.env` file

---

## 📌 Notes

- This is a **demo project** with hardcoded data — no backend or database
- In the production version, data is fetched from APIs and managed via Redux
- The drawing tool lets you sketch zones visually; saving is not wired in this demo you can save it you backend using coordinates data its very easy

---

## 📄 License

MIT
