import { transporter } from "../config/mail.config.js";
import { ApiError } from "../utils/ApiError.js";

const sendOTPEmail = async (email, otp) => {
    try {
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
    } catch (error) {
        console.error('Error sending OTP-login email:',error)
        throw new ApiError(500,'Error while sending the email')
    }

};

const sendPasswordResetOTPEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Hostel-PG-Finder" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP - Hostel-PG-Finder",
            text: `Your OTP is ${otp}. This OTP will expire in 2 minutes. Do not share this OTP with anyone.
                    Please do not reply to this email.`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset OTP</title>
                </head>

                <body style="
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                    font-family: Arial, sans-serif;
                ">

                    <div style="
                        max-width: 600px;
                        margin: 40px auto;
                        background-color: #ffffff;
                        padding: 30px;
                        border-radius: 8px;
                    ">

                        <h2 style="color: #333333;">
                            Password Reset Request
                        </h2>

                        <p style="color: #555555;">
                            Hello,
                        </p>

                        <p style="color: #555555;">
                            We received a request to reset the password
                            associated with your account.
                        </p>

                        <p style="color: #555555;">
                            Your One-Time Password (OTP) is:
                        </p>

                        <div style="
                            text-align: center;
                            margin: 25px 0;
                        ">
                            <span style="
                                display: inline-block;
                                padding: 15px 30px;
                                background-color: #f1f1f1;
                                border-radius: 6px;
                                font-size: 28px;
                                font-weight: bold;
                                letter-spacing: 6px;
                                color: #222222;
                            ">
                                ${otp}
                            </span>
                        </div>

                        <p style="color: #555555;">
                            <strong>This OTP is valid for 2 minutes.</strong>
                        </p>

                        <h3 style="color: #333333;">
                            Security Notice
                        </h3>

                        <ul style="color: #555555; line-height: 1.6;">
                            <li>
                                Never share this OTP with anyone,
                                including our support team.
                            </li>

                            <li>
                                If you did not request a password reset,
                                please ignore this email. Your account
                                remains secure.
                            </li>

                            <li>
                                Please do not reply to this email.
                            </li>
                        </ul>

                        <p style="color: #555555;">
                            If you requested this password reset, enter the
                            OTP on the password reset page to continue.
                        </p>

                        <hr style="
                            border: none;
                            border-top: 1px solid #eeeeee;
                            margin: 30px 0;
                        ">

                        <p style="
                            color: #888888;
                            font-size: 13px;
                        ">
                            This is an automated email. Please do not reply
                            to this message.
                        </p>

                        <p style="
                            color: #888888;
                            font-size: 13px;
                        ">
                            Regards,<br>
                            <strong>Hostel PG Finder Team</strong>
                        </p>

                    </div>

                </body>
                </html>
            `
        });

    } catch (error) {
        console.error('Error sending OTP reset-password email:', error);
        throw new ApiError(500, "Error while sending the mail")
    }
};

const sendStudentWelcomeEmail = async (email, username) => {
    try {
        await transporter.sendMail({
            from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Welcome to Hostel-PG-Find 🎉",
            text: `Welcome to Hostel-PG-Find, ${username}!

Your account has been successfully created.

You can now explore hostels and PGs, view accommodation details, and find a suitable place for your stay.

With Hostel-PG-Find, you can:
- Search for hostels and PGs
- Explore available accommodations
- View accommodation details
- Connect with hostel and PG owners

We hope Hostel-PG-Find helps you find a comfortable and suitable place to stay.

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
                        Welcome to <strong>Hostel-PG-Find</strong>!
                        Your account has been successfully created.
                    </p>

                    <p>
                        You can now explore hostels and PGs and find
                        a comfortable and suitable place for your stay.
                    </p>

                    <p>
                        With <strong>Hostel-PG-Find</strong>, you can:
                    </p>

                    <ul>
                        <li>Search for suitable hostels and PGs</li>
                        <li>Explore available accommodations</li>
                        <li>View accommodation details</li>
                        <li>Connect with hostel and PG owners</li>
                    </ul>

                    <p>
                        We hope you find the perfect place for your stay.
                    </p>

                    <p>
                        Thank you for joining <strong>Hostel-PG-Find</strong>.
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
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw new ApiError(500, "Error while sending welcome email");
    }
};

const sendOwnerWelcomeEmail = async (email, username) => {
    try {
        await transporter.sendMail({
            from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Welcome to Hostel-PG-Find 🎉",

            text: `Welcome to Hostel-PG-Find, ${username}!

Your owner account has been successfully created.

You can now use Hostel-PG-Find to list and manage your hostel or PG accommodations and connect with students looking for a place to stay.

With Hostel-PG-Find, you can:
- Add and manage your hostel or PG listings
- Provide accommodation details and facilities
- Connect with students looking for accommodation
- Manage your listings conveniently

We hope Hostel-PG-Find helps you reach students and manage your accommodations easily.

Thank you for joining our platform.

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
                        Welcome to <strong>Hostel-PG-Find</strong>!
                        Your owner account has been successfully created.
                    </p>

                    <p>
                        You can now use Hostel-PG-Find to list and manage
                        your hostel or PG accommodations and connect with
                        students looking for a place to stay.
                    </p>

                    <p>
                        With <strong>Hostel-PG-Find</strong>, you can:
                    </p>

                    <ul>
                        <li>Add and manage your hostel or PG listings</li>
                        <li>Provide accommodation details and facilities</li>
                        <li>Connect with students looking for accommodation</li>
                        <li>Manage your listings conveniently</li>
                    </ul>

                    <p>
                        We hope Hostel-PG-Find helps you reach students
                        and manage your accommodations easily.
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
    } catch (error) {
        console.error("Error sending owner welcome email:", error);
        throw new ApiError(
            500,
            "Error while sending owner welcome email"
        );
    }
};

const sendAdminWelcomeEmail = async (email, username) => {
    try {
        await transporter.sendMail({
            from: `"Hostel-PG-Find" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Welcome to Hostel-PG-Find - Admin Account 🎉",

            text: `Welcome to Hostel-PG-Find, ${username}!

Your administrator account has been successfully created.

As an administrator, you can help maintain the quality and reliability of the Hostel-PG-Find platform by reviewing verification requests and managing platform activities assigned to you.

As an admin, you can:
- Review hostel and PG verification requests
- Verify submitted documents
- Approve or reject verification requests
- Manage verification activities for your assigned area
- Help maintain a reliable platform for students and owners

Please ensure that all verification requests are reviewed carefully and handled according to the platform's guidelines.

Thank you for being a part of the Hostel-PG-Find administration team.

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
                        Your <strong>administrator account</strong> has been
                        successfully created.
                    </p>

                    <p>
                        As an administrator, you help maintain the quality
                        and reliability of the <strong>Hostel-PG-Find</strong>
                        platform.
                    </p>

                    <p>
                        As an admin, you can:
                    </p>

                    <ul>
                        <li>Review hostel and PG verification requests</li>
                        <li>Verify submitted documents</li>
                        <li>Approve or reject verification requests</li>
                        <li>Manage verification activities for your assigned area</li>
                        <li>Help maintain a reliable platform for students and owners</li>
                    </ul>

                    <p>
                        Please ensure that verification requests are reviewed
                        carefully and handled according to the platform's
                        guidelines.
                    </p>

                    <p>
                        Thank you for being a part of the
                        <strong>Hostel-PG-Find administration team</strong>.
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
    } catch (error) {
        console.error("Error sending admin welcome email:", error);
        throw new ApiError(
            500,
            "Error while sending admin welcome email"
        );
    }
};

export {
    sendOTPEmail,
    sendStudentWelcomeEmail,
    sendOwnerWelcomeEmail,
    sendAdminWelcomeEmail,
    sendPasswordResetOTPEmail
};