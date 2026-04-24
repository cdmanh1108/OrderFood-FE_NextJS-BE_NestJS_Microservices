export function buildVerifyEmailHtml(input: {
  fullName: string;
  code: string;
}): string {
  return `
    <div style="margin:0;padding:24px;background-color:#fafafa;">
      <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;line-height:1.6;">
        <div style="padding:20px 24px;background:linear-gradient(135deg,#fff8e1 0%,#fbc02d 100%);border-bottom:1px solid #e5e7eb;">
          <div style="font-size:18px;font-weight:700;color:#5d4037;">
            Bún Đậu Làng Mơ
          </div>
          <div style="font-size:14px;color:#4b5563;margin-top:4px;">
            Xác thực tài khoản
          </div>
        </div>

        <div style="padding:24px;">
          <h2 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#5d4037;">
            Mã xác thực của bạn
          </h2>
          <p style="margin:0 0 10px 0;font-size:15px;color:#374151;">
            Xin chào ${input.fullName},
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;color:#4b5563;">
            Vui lòng nhập mã OTP dưới đây để hoàn tất xác thực tài khoản.
          </p>

          <div style="margin:18px 0 20px 0;padding:14px 16px;text-align:center;background-color:#fff8e1;border:1px dashed #f59e0b;border-radius:12px;">
            <span style="display:inline-block;font-size:32px;letter-spacing:8px;font-weight:700;color:#5d4037;">
              ${input.code}
            </span>
          </div>

          <p style="margin:0 0 6px 0;font-size:13px;color:#6b7280;">
            Mã có hiệu lực trong vài phút. Không chia sẻ mã này cho bất kỳ ai.
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
          </p>
        </div>

        <div style="padding:14px 24px;background-color:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
          (c) 2026 Bún Đậu Làng Mơ
        </div>
      </div>
    </div>
  `;
}
