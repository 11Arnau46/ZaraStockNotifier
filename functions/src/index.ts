const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { Builder, By, until } = require("selenium-webdriver");
require("chromedriver");

admin.initializeApp();
const db = admin.firestore();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "trackerzara@gmail.com", // Replace with your email
        pass: "cdtm2025", // Replace with your email password
    },
});

exports.scrapeZaraProducts = functions.https.onCall(async (data: any, context: any) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;

    const productsSnapshot = await db.collection("products").where("userId", "==", userId).where("selected", "==", true).get();
    if (productsSnapshot.empty) {
        return { message: "No selected products found for this user." };
    }

    let driver = await new Builder().forBrowser("chrome").build();
    let productDetails = [];

    try {
        for (let doc of productsSnapshot.docs) {
            const product = doc.data();
            await driver.get(product.productUrl);

            try {
                await driver.wait(until.elementLocated(By.className("size-selector-sizes__size")), 10000);
            } catch (error) {
                console.log("Size selector not found", error);
            }

            const title = await driver.findElement(By.tagName("h1")).getText();
            const price = await driver.findElement(By.className("price"))?.getText() || "N/A";
            let availability = "Out of Stock";

            const sizeElements = await driver.findElements(By.className("size-selector-sizes__size"));
            for (let sizeElement of sizeElements) {
                const sizeText = await sizeElement.getText();
                if (sizeText.includes(product.size)) {
                    availability = "In Stock";
                    break;
                }
            }

            productDetails.push({ title, price, availability, productUrl: product.productUrl });
        }
    } finally {
        await driver.quit();
    }

    // Send email notification
    const emailContent = productDetails.map(p => `Product: ${p.title}\nPrice: ${p.price}\nAvailability: ${p.availability}\nURL: ${p.productUrl}`).join("\n\n");
    await transporter.sendMail({
        from: "your-email@gmail.com",
        to: userEmail,
        subject: "Zara Product Update",
        text: emailContent,
    });

    return { message: "Scraping complete, email sent." };
});
