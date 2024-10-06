// Import the dependencies
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const Cronofy = require("cronofy");

// Enable dotenv
dotenv.config();

// Setup
const PORT = 7070;

// Setup Express
const app = express();
app.set("view engine", "ejs");
const path = require('path');
app.set("views", path.join(__dirname, "templates"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/"));

// Add the Cronofy client setup here
const cronofyClient = new Cronofy({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    data_center: process.env.DATA_CENTER
});

// Route: home
app.get("/", async (req, res) => {
    // Homepage code goes here
    const codeQuery = req.query.code;
    if (codeQuery) {
        const codeResponse = await cronofyClient
            .requestAccessToken({
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                grant_type: "authorization_code",
                code: codeQuery,
                redirect_uri: "http://localhost:7070/",
            })
            .catch((err) => {
                if (err.error === "invalid_grant") {
                    console.warn(
                        "\x1b[33m",
                        "\nWARNING:\nThere was a problem validating the `code` response. The provided code is not known, has been used, or was not paired with the provided redirect_uri.\n",
                        "\x1b[0m"
                    );
                } else {
                    console.warn(
                        "\x1b[33m",
                        "\nWARNING:\nThere was a problem validating the `code` response. Check that your CLIENT_ID, CLIENT_SECRET, and SUB environment variables are correct.\n",
                        "\x1b[0m"
                    );
                }
            });
    }

    const token = await cronofyClient
        .requestElementToken({
            version: "1",
            permissions: ["managed_availability", "account_management"],
            subs: [process.env.SUB],
            origin: "http://localhost:7070",
        })
        .catch(() => {
            console.error(
                "\x1b[31m",
                "\nERROR:\nThere was a problem generating the element token. Check that your CLIENT_ID, CLIENT_SECRET, and SUB environment variables are correct.\n",
                "\x1b[0m"
            );
            return { element_token: { token: "invalid" } };
        });

    return res.render("home", {
        element_token: token.element_token.token,
        client_id: process.env.CLIENT_ID,
        data_center: process.env.DATA_CENTER,
    });
});

// Route: availability
app.get("/availability", async (req, res) => {
    // Availability code goes here

    return res.render("availability", {
        token: "YOUR_TOKEN_GOES_HERE",
        sub: process.env.SUB,
    });
});

// Route: submit
app.get("/submit", async (req, res) => {
    // Submit code goes here

    return res.render("submit", {
        meetingDate: "MEETING_DATE_GOES_HERE",
        start: "START_TIME_GOES_HERE",
        end: "END_TIME_GOES_HERE",
    });
});

app.listen(PORT);
console.log("serving on http://localhost:7070");
