import React from "react";
import LaunchList from "./components/LaunchList";

const App = () => (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h1>SpaceX Launches</h1>
        <LaunchList />
    </div>
);

export default App;
