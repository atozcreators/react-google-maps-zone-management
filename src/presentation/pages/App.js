import React, { useRef, useState } from "react";
import {GoogleMap,LoadScript,DrawingManager,Polygon,} from "@react-google-maps/api";
import './App.css'

const containerStyle = {
  width: "70%",
  height: "500px",
};

const center = {
  lat: 11.0168,
  lng: 76.9558,
};

function App() {
  const [zones, setZones] = useState([]);
  const polygonRef = useRef(null);

  const [pincode, setPincode] = useState("");

  const onPolygonComplete = (polygon) => {
    const path = polygon.getPath();
    const coordinates = [];

    for (let i = 0; i < path.getLength(); i++) {
      const latLng = path.getAt(i);
      coordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
    }

    setZones((prev) => [...prev, coordinates]);
    polygonRef.current = polygon;

    console.log("Zone Coordinates:", coordinates);
  };

  const handleSearchByPincode = async () => {
    if(!pincode) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
      );

      const data = await response.json();

      console.log(data);

      if(data.status === "ok") {
        const location = data.result[0].geometry.location;

        const delta = 0.005;

        const squareZone = [
          {lat: location.lat + delta, lng: location.lng - delta},
          {lat: location.lat + delta, lng: location.lng + delta},
          {lat: location.lat - delta, lng: location.lng + delta},
          {lat: location.lat - delta, lng: location.lng - delta},
        ];

        setZones((prev) => [...prev, squareZone]);
      }
      else {
        alert("location not found for this pincode");
      }
    } catch (err) {
      console.log(err);
      alert("Error fetching location")
    }
  };

  return (
    <div className="App">
      <h2 style={{ textAlign: "center" }}>Zone Creation using Google Maps in React</h2>
      
      <div className="input-con">
        <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter a pincode"/>
        <button onClick={handleSearchByPincode}>Add</button>
      </div>
      
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY} libraries={["drawing", "geometry"]}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
          <DrawingManager
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                drawingModes: ["polygon"],
              },
              polygonOptions: {
                fillColor: "#2196f3",
                fillOpacity: 0.5,
                strokeWeight: 2,
                clickable: true,
                editable: false,
                draggable: false,
              },
            }}
          />

          {/* Draw saved zones */}
          {zones.map((zone, index) => (
            <Polygon
              key={index}
              paths={zone}
              options={{
                fillColor: "#4CAF50",
                fillOpacity: 0.3,
                strokeColor: "#388E3C",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                clickable: false,
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default App;
