import React from "react";

export default function LoadingModal({ message }) {
  return (
    <div
      style={{
        position: "fixed",
        zIndex: "100",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          alignItems: "center",
          backgroundColor: "white",
          border: "1.5px solid",
          borderRadius: "5px",
          display: "flex",
          margin: "20% auto",
          width: "fit-content",
        }}
      >
        <div style={{ padding: "1rem" }}>
          <div id="spinner" style={{ height: "2.5rem", position: "static", width: "2.5rem" }} />
        </div>
        <label style={{ margin: "0rem", marginRight: "1rem" }}>{message}</label>
      </div>
    </div>
  );
}
