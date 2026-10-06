import { useState } from "react";

function Reservation() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    adults: 2,
    children: 0,
    date: "",
    time: "",
    note: "",
  });

  const [submitted, setSubmitted] =
    useState(false);

  const update = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="reservation-page">
        <div className="reservation-success">

          <span className="page-label">
            ĐẶT BÀN
          </span>

          <h1>
            Đặt bàn thành công
          </h1>

          <p>
            Nhân viên sẽ liên hệ với bạn
            để xác nhận thông tin.
          </p>

          <div className="reservation-summary">
            <p>
              <strong>
                Họ tên:
              </strong>{" "}
              {form.name}
            </p>

            <p>
              <strong>
                Số người:
              </strong>{" "}
              {Number(form.adults) +
                Number(form.children)}
            </p>

            <p>
              <strong>
                Thời gian:
              </strong>{" "}
              {form.time} - {form.date}
            </p>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="reservation-page">

      <span className="page-label">
        ĐẶT BÀN
      </span>

      <h1>
        Đặt bàn tại nhà hàng
      </h1>

      <form
        className="reservation-form"
        onSubmit={handleSubmit}
      >

        <label>
          Họ và tên

          <input
            required
            value={form.name}
            onChange={(e) =>
              update(
                "name",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Số điện thoại

          <input
            required
            value={form.phone}
            onChange={(e) =>
              update(
                "phone",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Người lớn

          <input
            type="number"
            min="1"
            value={form.adults}
            onChange={(e) =>
              update(
                "adults",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Trẻ em

          <input
            type="number"
            min="0"
            value={form.children}
            onChange={(e) =>
              update(
                "children",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Ngày

          <input
            type="date"
            required
            value={form.date}
            onChange={(e) =>
              update(
                "date",
                e.target.value
              )
            }
          />
        </label>

        <label>
          Giờ

          <input
            type="time"
            required
            value={form.time}
            onChange={(e) =>
              update(
                "time",
                e.target.value
              )
            }
          />
        </label>

        <label className="full-width">
          Ghi chú

          <textarea
            rows="4"
            placeholder="Bàn gần cửa sổ, sinh nhật, ghế trẻ em..."
            value={form.note}
            onChange={(e) =>
              update(
                "note",
                e.target.value
              )
            }
          />
        </label>

        <button
          type="submit"
          className="primary-button full-width"
        >
          Đặt bàn ngay
        </button>

      </form>

    </main>
  );
}

export default Reservation;