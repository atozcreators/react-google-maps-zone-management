import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  DrawingManager,
  Polygon,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import "./App.css";
import { zoneData, pinZoneData, vendorData } from "../../data/data";

const ZONE_PALETTE = [
  "#F44336", "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#E91E63", "#3F51B5", "#FF5722", "#607D8B",
];

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 11.0168, lng: 76.9558 };
const LIBRARIES = ["drawing"];

function FilterPanel({ open, onClose, zoneData, pinZoneData, selectedPincodes, setSelectedPincodes, selectedPincode, setSelectedPincode, selectedZoneIds, setSelectedZoneIds }) {
  const [tempPincodes, setTempPincodes] = useState(selectedPincodes);
  const [tempPincode, setTempPincode] = useState(selectedPincode);
  const [tempZoneIds, setTempZoneIds] = useState(selectedZoneIds);

  useEffect(() => {
    if (open) {
      setTempPincodes(selectedPincodes);
      setTempPincode(selectedPincode);
      setTempZoneIds(selectedZoneIds);
    }
  }, [open]);

  const pincodeKeys = Object.keys(zoneData);
  const pinZoneKeys = tempPincode ? Object.keys(pinZoneData[tempPincode] || {}) : [];

  const handleSave = () => {
    setSelectedPincodes(tempPincodes);
    setSelectedPincode(tempPincode);
    setSelectedZoneIds(tempZoneIds);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="filter-overlay">
      <div className="filter-panel">
        <div className="filter-header">
          <h3>Area Filter</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="filter-body">
          {/*Filter by pincode*/}
          <div className="filter-col">
            <label className="filter-label">Filter by Pincode</label>
            <div className="checkbox-group">
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={tempPincodes.length === pincodeKeys.length}
                  onChange={(e) => setTempPincodes(e.target.checked ? [...pincodeKeys] : [])}
                />
                All
              </label>
              {pincodeKeys.map((pin) => (
                <label key={pin} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={tempPincodes.includes(pin)}
                    onChange={(e) =>
                      setTempPincodes((prev) =>
                        e.target.checked ? [...prev, pin] : prev.filter((p) => p !== pin)
                      )
                    }
                  />
                  {pin}
                </label>
              ))}
            </div>
          </div>

          {/*Right: filter by Zone*/}
          <div className="filter-col">
            <label className="filter-label">Filter by Zone</label>
            <select
              className="filter-select"
              value={tempPincode || ""}
              onChange={(e) => { setTempPincode(e.target.value); setTempZoneIds([]); }}
            >
              <option value="">Select Pincode</option>
              {Object.keys(pinZoneData).map((pin) => (
                <option key={pin} value={pin}>{pin}</option>
              ))}
            </select>

            {tempPincode && pinZoneData[tempPincode] && (
              <div className="checkbox-group" style={{ marginTop: 10 }}>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={tempZoneIds.length === pinZoneKeys.length}
                    onChange={(e) => setTempZoneIds(e.target.checked ? [...pinZoneKeys] : [])}
                  />
                  All
                </label>
                {pinZoneKeys.map((zone) => (
                  <label key={zone} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={tempZoneIds.includes(zone)}
                      onChange={(e) =>
                        setTempZoneIds((prev) =>
                          e.target.checked ? [...prev, zone] : prev.filter((z) => z !== zone)
                        )
                      }
                    />
                    Zone - {zone}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="filter-footer">
          <button className="save-btn" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [selectedZoneIds, setSelectedZoneIds] = useState([]);

  // Drawing state
  const [drawnZone, setDrawnZone] = useState(null);

  // Vendor popup
  const [activeVendor, setActiveVendor] = useState(null);

  //Build zone objects to display
  const displayZones = useMemo(() => {
    const zones = [];

    // Pincode level zones
    selectedPincodes.forEach((pin) => {
      if (zoneData[pin]) zones.push({ name: pin, points: zoneData[pin] });
    });

    // Sub zones inside selected pincode
    if (selectedPincode && pinZoneData[selectedPincode]) {
      selectedZoneIds.forEach((zid) => {
        if (pinZoneData[selectedPincode][zid]) {
          zones.push({ name: zid, points: pinZoneData[selectedPincode][zid] });
        }
      });
    }

    return zones;
  }, [selectedPincodes, selectedPincode, selectedZoneIds]);

  //Zone color map
  const zoneColors = useMemo(() => {
    const colors = {};
    displayZones.forEach((zone, i) => {
      const color = ZONE_PALETTE[i % ZONE_PALETTE.length];
      colors[zone.name] = { fillColor: color + "66", strokeColor: color };
    });
    return colors;
  }, [displayZones]);

  //Vendors to display
  const displayVendors = useMemo(() => {
    const vendors = [];

    selectedPincodes.forEach((pin) => {
      if (!vendorData[pin]) return;
      //For pincode level: show vendors that have no zone_id (belong to pincode directly)
      vendorData[pin]
        .filter((v) => !v.zone_id)
        .forEach((v) => vendors.push({ ...v, zoneKey: pin }));
    });

    if (selectedPincode && vendorData[selectedPincode]) {
      selectedZoneIds.forEach((zid) => {
        vendorData[selectedPincode]
          .filter((v) => v.zone_id === zid)
          .forEach((v) => vendors.push({ ...v, zoneKey: zid }));
      });
    }

    return vendors;
  }, [selectedPincodes, selectedPincode, selectedZoneIds]);

  //Fit map bounds when zones change
  useEffect(() => {
    if (mapRef.current && displayZones.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      displayZones.forEach((z) => z.points.forEach((p) => bounds.extend(p)));
      displayVendors.forEach((v) => bounds.extend(v.location));
      mapRef.current.fitBounds(bounds);
    }
  }, [displayZones, displayVendors]);

  const handlePolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const coords = [];
    for (let i = 0; i < path.getLength(); i++) {
      const p = path.getAt(i);
      coords.push({ lat: p.lat(), lng: p.lng() });
    }
    setDrawnZone(coords);
    polygon.setMap(null); //Remove native drawing; react renders it
  };

  return (
    <div className="App">
      <h2>Delivery Zone Demo</h2>

      {/*Toolbar*/}
      <div className="toolbar">
        <div className="selected-tags">
          {selectedPincodes.map((pin) => (
            <span key={pin} className="tag">
              {pin}
              <button onClick={() => setSelectedPincodes((prev) => prev.filter((p) => p !== pin))}>✕</button>
            </span>
          ))}
          {selectedPincode && selectedZoneIds.map((zid) => (
            <span key={zid} className="tag tag-zone">
              Zone {zid}
              <button onClick={() => setSelectedZoneIds((prev) => prev.filter((z) => z !== zid))}>✕</button>
            </span>
          ))}
        </div>
        <button className="filter-btn" onClick={() => setFilterOpen(true)}>⚙ Filter</button>
      </div>

      {/*Filter panel*/}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        zoneData={zoneData}
        pinZoneData={pinZoneData}
        selectedPincodes={selectedPincodes}
        setSelectedPincodes={setSelectedPincodes}
        selectedPincode={selectedPincode}
        setSelectedPincode={setSelectedPincode}
        selectedZoneIds={selectedZoneIds}
        setSelectedZoneIds={setSelectedZoneIds}
      />

      {/*Map*/}
      <div className="map-container">
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY}
          libraries={LIBRARIES}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={(map) => { mapRef.current = map; setMapLoaded(true); }}
          >
            {/*Drawing tool*/}
            {mapLoaded && (
              <DrawingManager
                onPolygonComplete={handlePolygonComplete}
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                  },
                  polygonOptions: {
                    fillColor: "#FFEB3B",
                    fillOpacity: 0.3,
                    strokeColor: "#F9A825",
                    strokeWeight: 2,
                    editable: false,
                  },
                }}
              />
            )}

            {/*Pincode, sub zone, polygons*/}
            {displayZones.map((zone) => {
              const color = zoneColors[zone.name];
              return (
                <Polygon
                  key={zone.name}
                  paths={zone.points}
                  options={{
                    fillColor: color.fillColor,
                    fillOpacity: 0.4,
                    strokeColor: color.strokeColor,
                    strokeWeight: 2,
                    clickable: false,
                  }}
                />
              );
            })}

            {/*Drawn zone preview*/}
            {drawnZone && (
              <Polygon
                paths={drawnZone}
                options={{
                  fillColor: "#FFEB3B66",
                  fillOpacity: 0.4,
                  strokeColor: "#F9A825",
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
            )}

            {/*Vendor markers*/}
            {displayVendors.map((vendor) => {
              const strokeColor = zoneColors[vendor.zoneKey]?.strokeColor || "#E53935";
              return (
                <Marker
                  key={vendor.vendor_id}
                  position={vendor.location}
                  onClick={() => setActiveVendor(vendor)}
                  icon={{
                    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="6" ry="2" fill="rgba(0,0,0,0.25)"/>
      <path d="M18 2 C9.16 2 2 9.16 2 18 C2 29 18 42 18 42 C18 42 34 29 34 18 C34 9.16 26.84 2 18 2Z"
        fill="${strokeColor}" stroke="none" stroke-width="2"/>
      <circle cx="18" cy="18" r="6" fill="white" opacity="0.9"/>
    </svg>
  `)}`,
                    scaledSize: mapLoaded ? new window.google.maps.Size(36, 44) : undefined,
                    anchor: mapLoaded ? new window.google.maps.Point(18, 44) : undefined,
                    labelOrigin: mapLoaded ? new window.google.maps.Point(18, -8) : undefined,
                  }}
                  label={{
                    text: vendor.vendor_name,
                    color: "#ffffff",
                    fontSize: "11px",
                    fontWeight: "bold",
                    className: "vendor-label",
                  }}
                />
              );
            })}

            {/*Vendor info popup*/}
            {activeVendor && (
              <InfoWindow
                position={activeVendor.location}
                onCloseClick={() => setActiveVendor(null)}
              >
                <div className="info-window">
                  <p><strong>ID:</strong> {activeVendor.vendor_id}</p>
                  <p><strong>Name:</strong> {activeVendor.vendor_name}</p>
                  <p><strong>Type:</strong> {activeVendor.vendor_type}</p>
                  <p><strong>Phone:</strong> {activeVendor.vendor_phone}</p>
                  <p><strong>Address:</strong> {activeVendor.vendor_address}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

export default App;