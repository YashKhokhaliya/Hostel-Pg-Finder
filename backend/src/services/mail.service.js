const sendWelcomeEmail = async (email, username) => {
    await transporter.sendMail({
        from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Welcome to Hostel-PG-Find 🎉",
        text: `Welcome to Hostel-PG-Find, ${username}!

Your account has been successfully created.

You can now explore hostels and PGs, connect with owners, and find the perfect place for your stay.

Thank you for joining us.

Regards,
Hostel-PG-Find Team

This is an automated email. Please do not reply to this message.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
                
                <h2 style="text-align: center;">
                    Welcome to Hostel-PG-Find 🎉
                </h2>

                <p>Hello <strong>${username}</strong>,</p>

                <p>
                    We are excited to have you with us!
                    Your account has been successfully created.
                </p>

                <p>
                    With <strong>Hostel-PG-Find</strong>, you can:
                </p>

                <ul>
                    <li>Find suitable hostels and PG accommodations</li>
                    <li>Connect with hostel and PG owners</li>
                    <li>Explore available stays easily</li>
                </ul>

                <p>
                    We hope you find the perfect place for your stay.
                </p>

                <p>
                    Thank you for joining our platform.
                </p>

                <p>
                    Regards,<br>
                    <strong>Hostel-PG-Find Team</strong>
                </p>

                <hr>

                <p style="font-size: 12px; color: #777;">
                    This is an automated email. Please do not reply to this message.
                </p>

            </div>
        `
    });
};

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Your OTP Verification Code",
        text: `Your OTP is ${otp}. This OTP will expire in 2 minutes. Do not share this OTP with anyone.

Please do not reply to this email.`,
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
                    <strong>Hostel-PG-Find</strong>
                </p>

                <hr>

                <p style="font-size: 12px; color: #777;">
                    This is an automated email. Please do not reply to this message.
                </p>
            </div>
        `
    });
};

// const sendPasswordResetMail = async(email)=>{

// }


export {
    sendOTPEmail,
    sendWelcomeEmail
};