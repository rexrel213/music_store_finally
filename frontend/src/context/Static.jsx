import React from "react";

const UmamiDashboardLink = () => {
    return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            margin: 0,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <iframe
            src="https://cloud.umami.is/share/YcldVvEvgGiaZbiy/87.228.102.111:3000"
            title="Umami Public Dashboard"
            style={{ border: "none", width: "100%", height: "100%" }}
            allowFullScreen
          />
        </div>
      );
    };

export default UmamiDashboardLink;
