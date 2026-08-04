
const sendWelcomeMail = async(email)=>{

}
const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Your OTP Verification Code",
        text: `Your OTP is ${otp}. This OTP will expire in 2 minutes. Do not share this OTP with anyone.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                <h2>Email Verification</h2>

                <p>Hello,</p>

                <p>
                    Use the following One-Time Password (OTP) to verify your email address:
                </p>

                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 25px 0;">
                    ${otp}
                </div>

                <p>
                    This OTP is valid for <strong>2 minutes</strong>.
                </p>

                <p style="color: #d9534f;">
                    <strong>Security Notice:</strong> Never share this OTP with anyone.
                    Our team will never ask you to disclose your OTP.
                </p>

                <p>
                    If you did not request this verification code, you can safely ignore this email.
                </p>

                <p>
                    Regards,<br>
                    <strong>Your App Name</strong>
                </p>
            </div>
        `
    });
};

const sendPasswordResetMail = async(email)=>{

}


export {
    sendOTPEmail
};