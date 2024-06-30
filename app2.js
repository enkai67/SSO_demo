import express from "express";
import axios from "axios";
import cookieParser from "cookie-parser";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import { engine } from "express-handlebars";

const app = express();
const casPort = 3000;
const appPort = 2000;

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views/app");

const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
    url: "redis://localhost:6381",
    legacyMode: true
});
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient
    .connect()
    .then(() => console.log("Connected to Redis server"))
    .catch(console.error);

const CAS_URL = `http://localhost:${casPort}`;
const SERVICE_URL = `http://localhost:${appPort}`;

app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: "app2",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 3600000
        }
    })
);

app.use(cookieParser());

const checkAuthentication = async (req, res, next) => {
    const ticket = req.query.ticket;

    if (req.session?.authenticated) {
        // User is already authenticated and session is valid
        console.log("req.session.authenticated:", req.session?.authenticated);
        next();
    } else if (ticket) {
        // If there's a ticket, validate it
        res.redirect(`/validate?ticket=${ticket}`);
    } else {
        // If no ticket and not authenticated, redirect to login or show an error
        res.redirect("/login");
    }
};

app.get("/", checkAuthentication, (_req, res) => {
    res.render("homepage");
});

app.get("/login", (_req, res) => {
    const redirectUrl = `${CAS_URL}/login?service=${encodeURIComponent(SERVICE_URL)}`;
    res.redirect(redirectUrl);
});

app.get("/validate", async (req, res) => {
    const { ticket } = req.query;
    console.log("req.query", req.query);

    if (!ticket) {
        console.log("No ticket provided.");
        return res.redirect("/login");
    }

    try {
        const serviceValidateUrl = `${CAS_URL}/serviceValidate?service=${encodeURIComponent(
            SERVICE_URL
        )}&ticket=${ticket}`;
        console.log(serviceValidateUrl);

        let axiosResponse;
        try {
            axiosResponse = await axios.get(serviceValidateUrl);
            console.log("response.data: ", axiosResponse.data);
        } catch (error) {
            console.error("axios get error!!", error);
        }

        if (axiosResponse.data.serviceResponse.authenticationSuccess) {
            // User is authenticated
            const user = axiosResponse.data.serviceResponse.authenticationSuccess.user[0];

            req.session.authenticated = true;
            req.session.username = user;

            res.setHeader("Set-Cookie", "isApp2LoggedIn=true; Max-Age=80000");

            res.redirect("/");
        } else {
            // Authentication failed
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Failed to validate ticket:", error);
        res.status(500).send("Failed to validate ticket.");
    }
});

app.post("/logout", (req, res) => {
    res.setHeader("Set-Cookie", "isApp2LoggedIn=; Max-Age=0; Path=/");
    req.session.destroy((err) => {
        if (err) {
            console.log("Error destroying session");
            res.status(500).send("Failed to logout.");
        } else {
            console.log("Session destroyed successfully");
            // Redirect to the CAS logout URL or another appropriate URL
            res.send("logged out successfully");
        }
    });
});

// Start server
app.listen(appPort, () => {
    console.log(`Service server running on port ${appPort}`);
});
