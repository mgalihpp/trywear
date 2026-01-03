import * as React from "react";

interface EmailTemplateProps {
  url?: string;
  type: "reset-password" | "verify-email" | "password-changed";
}

export function EmailTemplate({ url, type }: EmailTemplateProps) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        padding: 24,
        background: "#ffffff",
        borderRadius: 8,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#111827",
        boxShadow: "0 2px 6px rgba(16,24,40,0.05)",
      }}
    >
      <h1 style={{ margin: "0 0 12px", fontSize: 20 }}>
        {type === "verify-email" && "Verifikasi Email Anda"}
        {type === "reset-password" && "Reset Password"}
        {type === "password-changed" && "Password Berhasil Diubah"}
      </h1>

      <p style={{ margin: "0 0 20px", lineHeight: 1.5 }}>
        {type === "verify-email" &&
          "Terima kasih telah membuat akun. Silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini."}
        {type === "reset-password" &&
          "Anda meminta reset password. Klik tombol di bawah ini untuk memilih password baru."}
        {type === "password-changed" &&
          "Password Anda telah berhasil diubah. Jika Anda melakukan perubahan ini, tidak ada tindakan lebih lanjut yang diperlukan."}
      </p>

      {type === "password-changed" && (
        <>
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 6,
              padding: 16,
              margin: "20px 0",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#15803d" }}>
              ✓ Akun Anda sekarang aman dengan password baru Anda.
            </p>
          </div>

          <p style={{ margin: "20px 0 8px", fontSize: 14, fontWeight: 600 }}>
            Jika Anda tidak melakukan perubahan ini:
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6 }}>
            Silakan hubungi tim dukungan kami segera. Seseorang mungkin memiliki
            akses tidak sah ke akun Anda.
          </p>
        </>
      )}

      {(type === "verify-email" || type === "reset-password") && url && (
        <>
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                background: "#0b74ff",
                color: "#ffffff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              {type === "verify-email" ? "Verifikasi Email" : "Reset Password"}
            </a>
          </div>

          <p style={{ margin: "0 0 8px", fontSize: 14 }}>
            Jika tombol tidak berfungsi, salin dan tempel tautan di bawah ini ke
            browser Anda:
          </p>
          <p
            style={{
              wordBreak: "break-all",
              fontSize: 13,
              color: "#0b74ff",
              margin: "0 0 20px",
            }}
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0b74ff", textDecoration: "none" }}
            >
              {url}
            </a>
          </p>
        </>
      )}

      {type !== "password-changed" && (
        <p style={{ margin: "0 0 8px", fontSize: 14 }}>
          Jika Anda tidak meminta ini, Anda dapat mengabaikan email ini dengan aman.
        </p>
      )}

      <div style={{ marginTop: 28, fontSize: 13, color: "#6b7280" }}>
        <div>Terima kasih,</div>
        <div style={{ fontWeight: 600, marginTop: 6 }}>Tim Kami</div>
      </div>

      <hr
        style={{
          border: "none",
          borderTop: "1px solid #eef2f7",
          margin: "20px 0",
        }}
      />

      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
        {type === "password-changed"
          ? "Pemberitahuan ini dikirim untuk tujuan keamanan."
          : "Tautan ini akan kedaluwarsa dalam 24 jam."}
      </p>
    </div>
  );
}
