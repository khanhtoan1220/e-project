import React, { useEffect, useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import QRCode from "qrcode";
import ENV from "../constants/ENV";

export default function QrGoiMon({ banId, tenBan }) {
  const [show, setShow] = useState(false);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const accessUrl = new URL(
    "/order?banId=" + encodeURIComponent(banId),
    ENV.customer_url,
  ).toString();

  useEffect(() => {
    let dangHoatDong = true;
    QRCode.toDataURL(accessUrl, { width: 360, margin: 2 })
      .then((data) => {
        if (dangHoatDong) setImage(data);
      })
      .catch(() => {
        if (dangHoatDong) setError("Không hiển thị được mã QR.");
      });
    return () => {
      dangHoatDong = false;
    };
  }, [accessUrl]);

  const saoChepLink = async () => {
    try {
      await navigator.clipboard.writeText(accessUrl);
    } catch {
      window.prompt("Sao chép đường dẫn QR cố định:", accessUrl);
    }
  };

  return <>
    <Button size="sm" variant="outline-dark" onClick={() => setShow(true)}>
      Mã QR cố định
    </Button>
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Mã QR bàn {tenBan}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {error && <Alert variant="danger">{error}</Alert>}
        {image && <img src={image} alt={"Mã QR cố định bàn " + tenBan} className="img-fluid" />}
        <p className="small text-secondary">Mã này luôn mở trang gọi món của bàn {tenBan}.</p>
        <div className="small text-break mb-3">{accessUrl}</div>
        <a
          className="btn btn-primary mb-2"
          href={accessUrl}
          target="_blank"
          rel="noreferrer"
        >
          Mở trang gọi món
        </a>
        <div />
        <a className="btn btn-dark" href={image} download={"qr-ban-" + tenBan + ".png"}>
          Tải ảnh QR để in
        </a>
        {" "}
        <Button variant="outline-secondary" onClick={saoChepLink}>
          Sao chép đường dẫn
        </Button>
      </Modal.Body>
    </Modal>
  </>;
}
