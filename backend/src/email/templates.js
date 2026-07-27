// ─── Email HTML Templates ──────────────────────────────────

const config = require('../config');

const BASE_STYLES = `
  body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 0; background-color: #f7f8fa; direction: rtl; }
  .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
  .card { background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .logo { text-align: center; margin-bottom: 24px; }
  .logo h1 { color: #16a34a; font-size: 28px; margin: 0; }
  h2 { color: #18181b; font-size: 22px; margin: 0 0 12px 0; text-align: center; }
  p { color: #52525b; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; text-align: center; }
  .btn { display: inline-block; background: #16a34a; color: #ffffff !important; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 16px; font-weight: 700; margin: 16px 0; text-align: center; }
  .btn-wrapper { text-align: center; }
  .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #a1a1aa; }
  .footer a { color: #16a34a; text-decoration: none; }
  .token { text-align: center; font-size: 14px; color: #52525b; background: #f4f4f5; padding: 12px; border-radius: 8px; }
  hr { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
`;

function layout(content) {
  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>${BASE_STYLES}</style></head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo"><h1>📋 My Taske</h1></div>
          ${content}
          <hr>
          <div class="footer">
            <p style="font-size:12px;color:#a1a1aa;">
              © ${new Date().getFullYear()} My Taske. All rights reserved.<br>
              <a href="${config.app.frontendUrl}">${config.app.frontendUrl}</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function verifyEmail({ name, token }) {
  const url = `${config.app.frontendUrl}/verify-email?token=${token}`;
  return layout(`
    <h2>مرحباً ${name}! 👋</h2>
    <p>شكراً لانضمامك إلى My Taske! يرجى تأكيد عنوان بريدك الإلكتروني لبدء استخدام التطبيق.</p>
    <div class="btn-wrapper">
      <a href="${url}" class="btn">تأكيد البريد الإلكتروني</a>
    </div>
    <p style="font-size:13px;color:#71717a;">إذا لم يعمل الزر أعلاه، يمكنك نسخ الرابط التالي ولصقه في المتصفح:</p>
    <div class="token">${url}</div>
    <p style="font-size:13px;color:#71717a;margin-top:8px;">ينتهي صلاحية هذا الرابط خلال 24 ساعة.</p>
  `);
}

function resetPassword({ name, token }) {
  const url = `${config.app.frontendUrl}/reset-password?token=${token}`;
  return layout(`
    <h2>إعادة تعيين كلمة المرور 🔐</h2>
    <p>مرحباً ${name}،</p>
    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في My Taske. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة.</p>
    <div class="btn-wrapper">
      <a href="${url}" class="btn">إعادة تعيين كلمة المرور</a>
    </div>
    <p style="font-size:13px;color:#71717a;">ينتهي صلاحية هذا الرابط خلال ساعة واحدة.</p>
  `);
}

function welcomeEmail({ name }) {
  return layout(`
    <h2>أهلاً بك في My Taske! 🎉</h2>
    <p>مرحباً ${name}،</p>
    <p>تم تأكيد بريدك الإلكتروني بنجاح! أنت الآن جاهز لبدء تنظيم مهامك وعاداتك وجلسات التركيز.</p>
    <div style="text-align:center;padding:16px 0;">
      <div style="display:inline-block;background:#f0fdf4;border-radius:12px;padding:16px;margin:4px;">
        <div style="font-size:32px;">📋</div>
        <div style="font-size:13px;color:#15803d;font-weight:700;">إدارة المهام</div>
      </div>
      <div style="display:inline-block;background:#fefce8;border-radius:12px;padding:16px;margin:4px;">
        <div style="font-size:32px;">🔥</div>
        <div style="font-size:13px;color:#a16207;font-weight:700;">تتبع العادات</div>
      </div>
      <div style="display:inline-block;background:#f5f3ff;border-radius:12px;padding:16px;margin:4px;">
        <div style="font-size:32px;">⏱️</div>
        <div style="font-size:13px;color:#6d28d9;font-weight:700;">جلسات التركيز</div>
      </div>
    </div>
    <div class="btn-wrapper">
      <a href="${config.app.frontendUrl}/dashboard" class="btn">ابدأ الآن</a>
    </div>
  `);
}

module.exports = { verifyEmail, resetPassword, welcomeEmail };
