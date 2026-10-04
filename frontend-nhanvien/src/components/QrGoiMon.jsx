import React, { useState } from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import QRCode from "qrcode";
import { tao_qr_service } from "../services/staff_service";

const qrDaTao = new Map();

export default function QrGoiMon({ hoaDon, tenBan }) {
  const [show, setShow] = useState(false);
  const [qr, setQr] = useState(() => qrDaTao.get(hoaDon._id) || null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const taoQr = async () => {
    if ((qr || hoaDon.qrHetHan) && !window.confirm("Cấp QR mới sẽ vô hiệu mã cũ. Tiếp tục?")) return;
    setBusy(true);
    setError("");
    setQr(null);
    qrDaTao.delete(hoaDon._id);
    try {
      const data = await tao_qr_service(hoaDon._id);
      const image = await QRCode.toDataURL(data.accessUrl, { width: 320, margin: 2 });
      qrDaTao.set(hoaDon._id, { ...data, image });
      setQr({ ...data, image });
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  };
  return <>
    <Button size="sm" variant="outline-dark" onClick={() => setShow(true)}>QR gọi món</Button>
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton><Modal.Title>QR gọi món — {tenBan}</Modal.Title></Modal.Header>
      <Modal.Body className="text-center">
        {error && <Alert variant="danger">{error}</Alert>}
        {qr ? <>
          <img src={qr.image} alt={"QR gọi món " + tenBan} className="img-fluid" />
          <p>Hết hạn: {new Date(qr.expiresAt).toLocaleString("vi-VN")}</p>
          <a href={qr.accessUrl} target="_blank" rel="noreferrer">Mở trang gọi món</a>
        </> : <p>Tạo QR cho lượt khách này. Mã có hiệu lực 4 giờ và kết thúc khi hóa đơn được thanh toán hoặc hủy.</p>}
        <div className="mt-3"><Button disabled={busy} onClick={taoQr}>
          {busy ? "Đang tạo..." : qr || hoaDon.qrHetHan ? "Cấp QR mới" : "Tạo QR"}
        </Button></div>
      </Modal.Body>
    </Modal>
  </>;
}
