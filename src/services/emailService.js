const { Resend } = require("resend");

const resend = new Resend(
    process.env.RESEND_API_KEY
);

const sendOTPEmail = async (email, otp) => {

    const result = await resend.emails.send({

        from: "Shubham <shubham@noisy.co.in>",

        to: email,

        subject:
            "Smart Food Waste - Email Verification",

        html: `
            <div style="
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 24px;
                font-family: Arial, Helvetica, sans-serif;
                color: #1f2937;
            ">

                <h2 style="
                    color: #111827;
                    margin-bottom: 20px;
                ">
                    Smart Food Waste
                </h2>

                <p>
                    Thank you for registering
                    with Smart Food Waste.
                </p>

                <p>
                    Use the verification code below
                    to verify your email address.
                </p>

                <div style="
                    margin: 30px 0;
                    padding: 20px;
                    border: 1px solid #e5e7eb;
                    border-radius: 10px;
                    text-align: center;
                ">

                    <span style="
                        font-size: 32px;
                        letter-spacing: 8px;
                        font-weight: bold;
                        color: #111827;
                    ">
                        ${otp}
                    </span>

                </div>

                <p>
                    This OTP is valid for
                    <strong>10 minutes</strong>.
                </p>

                <p style="
                    font-size: 13px;
                    color: #6b7280;
                ">
                    If you did not request this code,
                    please ignore this email.
                </p>

            </div>
        `
    });

    return result;
};

module.exports = {
    sendOTPEmail
};