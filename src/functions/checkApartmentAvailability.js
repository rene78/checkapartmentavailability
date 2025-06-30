const { app } = require('@azure/functions');
const nodemailer = require('nodemailer');

app.timer('checkApartmentAvailability', {
    schedule: '0 0 8,18 * * *',//Run every day at 08:00 and 18:00 UTC, i.e. 0 seconds & 0 minutes & 8,18 hours → 8 AM and 8 PM & * every day of the month & * every month & * every day of the week
    handler: async (myTimer, context) => {
        context.log('Timer function processed request.');

        const timeStamp = new Date().toISOString();
        context.log('checkApartmentAvailability function ran!', timeStamp);

        // Get configuration from environment variables
        const targetUrl = process.env.TARGET_URL;
        const keywords = JSON.parse(process.env.KEYWORDS_TO_FIND);
        context.log(keywords);

        if (!targetUrl || !keywords) {
            context.log.error("Error: TARGET_URL or KEYWORDS_TO_FIND is not set in Application Settings.");
            return;
        }

        try {
            // --- Step 1: Fetch the website content using native fetch ---
            context.log(`Fetching content from ${targetUrl}...`);

            // Note: fetch() is available globally in modern Node.js runtimes on Azure Functions
            const response = await fetch(targetUrl);

            // !! IMPORTANT: Manually check if the request was successful !!
            if (!response.ok) {
                // Throw an error to be caught by the catch block
                throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
            }

            // Get the response body as a text string
            const htmlContent = await response.text();
            // context.log(htmlContent);

            // --- Step 2: Check for the keyword ---
            function findKeywords() {
                const foundKw = [];
                for (let i = 0; i < keywords.length; i++) {
                    if (htmlContent.toLowerCase().includes(keywords[i].toLowerCase())) {
                        foundKw.push(keywords[i]);
                    }
                }
                return foundKw;
            }

            const foundKeywordsArray = findKeywords();
            // context.log(foundKeywordsArray);

            // We use .toLowerCase() to make the search case-insensitive
            if (foundKeywordsArray.length > 0) {
                context.log("this code does not get executed");
                context.log(`SUCCESS: Keywords "${foundKeywordsArray.join(", ")}" found on the page!`);

                // --- Step 3: Send the notification email ---
                await sendNotificationEmail(context, foundKeywordsArray, targetUrl);

            } else {
                context.log(`Keywords "${keywords}" were not found.`);
            }

        } catch (error) {
            context.log.error("An error occurred during the process.");
            context.log.error(error.message); // Log the specific error message
        }
    }
});

// Helper function to send an email using Nodemailer
async function sendNotificationEmail(context, foundKeywordsArray, url) {
    const recipientEmail = process.env.RECIPIENT_EMAIL;
    const senderHost = process.env.SENDER_HOST;
    const senderUserName = process.env.SENDER_USER_NAME;
    const senderEmail = process.env.SENDER_EMAIL;
    const senderPassword = process.env.SENDER_PASSWORD;

    if (!recipientEmail || !senderHost || !senderUserName || !senderEmail || !senderPassword) {
        context.log.error("Email credentials are not fully configured.");
        return;
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: senderHost,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: senderUserName,// email username
            pass: senderPassword // email password
        }
    });

    let mailOptions = {
        from: `"Azure Function Alert" <${senderEmail}>`,
        to: recipientEmail, // list of receivers
        subject: `🎉 ${foundKeywordsArray.length == 1 ? "Keyword" : "Keywords"} Found: ${foundKeywordsArray.join(", ")}`, // Subject line
        html: `
            <h2>Good News!</h2>
            <p>The ${foundKeywordsArray.length == 1 ? "keyword" : "keywords"} "<b>${foundKeywordsArray.join(", ")}</b>" ${foundKeywordsArray.length == 1 ? "was" : "were"} found on the website.</p>
            <p>Check it out here: <a href="${url}">${url}</a></p>
        `,
    };

    // send mail with defined transport object
    try {
        context.log("Sending email notification...");
        let info = await transporter.sendMail(mailOptions);
        context.log("Email sent successfully! Message ID: " + info.messageId);
        // Email sent successfully! Message ID: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    } catch (error) {
        context.log.error("Failed to send email.");
        context.log.error(error);
    }
}