import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QrScanner = () => {
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    setIsScanning(true);
    await new Promise((r) => setTimeout(r, 100)); // Wait for DOM update

    const html5QrCode = new Html5Qrcode(readerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setScannedResult(decodedText);
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
            setIsScanning(false);
          });
        },
        (errorMessage) => {
          console.warn("Scan error:", errorMessage);
        }
      )
      .catch((err) => {
        console.error("Camera start error:", err);
        setIsScanning(false);
      });
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>QR Code Reader using React</h1>

      {!isScanning && !scannedResult && (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button onClick={startScanner} style={buttonStyle}>
            Start Scan
          </button>
        </div>
      )}

      {isScanning && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div id="reader" ref={readerRef} style={{ width: "500px" }}></div>
        </div>
      )}

      {scannedResult && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <h4>Scan Result</h4>
          <div className="result">{scannedResult}</div>
        </div>
      )}

      <style>{`
        .result {
          background-color: green;
          color: white;
          padding: 20px;
          display: inline-block;
        }
        #reader__scan_region {
          background: white;
        }
      `}</style>
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default QrScanner;
