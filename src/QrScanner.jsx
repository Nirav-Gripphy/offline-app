import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const QrScanner = () => {
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    setScannedResult(null);
    setIsScanning(true);

    await new Promise((res) => setTimeout(res, 100));

    const html5QrCode = new Html5Qrcode(readerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.UPC_A,
          ],
        },
        (decodedText, result) => {
          console.log("Decoded:", result);
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
    <div style={styles.container}>
      <h1 style={styles.title}>📷 QR & Barcode Scanner</h1>

      {!isScanning && !scannedResult && (
        <button style={styles.button} onClick={startScanner}>
          Start Scan
        </button>
      )}

      {isScanning && (
        <div id="reader" ref={readerRef} style={styles.readerBox}></div>
      )}

      {scannedResult && (
        <div style={styles.resultSection}>
          <h3>✅ Scan Result:</h3>
          <div style={styles.resultBox}>{scannedResult}</div>
          <button
            style={{ ...styles.button, marginTop: 20 }}
            onClick={startScanner}
          >
            🔄 Re-Scan
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    backgroundColor: "#fdfdfd",
  },
  title: {
    marginBottom: "20px",
  },
  button: {
    padding: "12px 25px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  readerBox: {
    width: "100%",
    maxWidth: "500px",
    margin: "auto",
  },
  resultSection: {
    marginTop: "30px",
  },
  resultBox: {
    padding: "15px",
    backgroundColor: "#28a745",
    color: "#fff",
    borderRadius: "6px",
    fontSize: "18px",
    wordBreak: "break-word",
    marginTop: "10px",
  },
};

export default QrScanner;
