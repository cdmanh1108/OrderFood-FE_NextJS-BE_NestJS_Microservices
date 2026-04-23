export function buildVerifyEmailHtml(input: {
  fullName: string;
  code: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Xác thực tài khoản</h2>
      <p>Xin chào ${input.fullName},</p>
      <p>Mã xác thực của bạn là:</p>
      <div style="font-size: 28px; font-weight: bold; margin: 16px 0;">
        ${input.code}
      </div>
      <p>Mã có hiệu lực trong vài phút.</p>
    </div>
  `;
}
