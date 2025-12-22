function otpEmailTemplate(otp) {
  return `
    <div style="font-family: Arial;">
      <h2>Email Verification</h2>
      <p>Your verification OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
    </div>
  `;
}

function resetPasswordTemplate(resetLink) {
  return `
    <div style="font-family: Arial;">
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire shortly.</p>
    </div>
  `;
}

module.exports = {
  otpEmailTemplate,
  resetPasswordTemplate,
};