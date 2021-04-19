import React from "react";

export default function LoginMessage({actionText}) {
    return (
        <div style={{textAlign: "center", width: "100%"}}>
            <p> Login to view your {actionText}.</p>
            <button
                className="map-upd-btn"
                onClick={() => {
                    location.href = "accounts/login";
                }}
                type="button"
            >
                Login
            </button>
        </div>
    );
}
