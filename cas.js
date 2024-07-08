import express from "express";
import session from "express-session";
import redis from "redis";
import connectRedis from "connect-redis";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { v4 as uuid } from "uuid";
import redisUtils from "./utils/redis.js";
import { engine } from "express-handlebars";

const cas = express();
const port = process.env.PORT || 3000;

cas.engine("handlebars", engine());
cas.set("view engine", "handlebars");
cas.set("views", "./views/cas");

const RedisStore = connectRedis(session);

const redisClient = redis.createClient({
    url: "redis://localhost:6379",
    legacyMode: true
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient
    .connect()
    .then(() => console.log("Connected to Redis server"))
    .catch(console.error);

export default redisClient;

//cookie-parser, body-parser
cas.use(bodyParser.urlencoded({ extended: true }));
cas.use(cookieParser());

cas.use(
    session({
        store: new RedisStore({ client: redisClient }),
        secret: "CAS",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 3600000
        }
    })
);

// user data -> later could move to Redis
const users = { username: "1", password: "1" };

cas.get("/login", (req, res) => {
    // Check if session cookie exists and is valid
    if (req.session.username) {
        console.log("req.session: ", req.session);
        const ticket = req.session.ticket;
        res.redirect(`/serviceValidate?ticket=${ticket}`);
    } else {
        // If no valid session, show login form
        console.log(req.query);
        const { service } = req.query;

        const decodedServiceUrl = decodeURIComponent(service);
        console.log("decodedServiceUrl: ", decodedServiceUrl);

        res.render("login", {
            serviceUrl: decodedServiceUrl
        });
    }
});

cas.post("/login", async (req, res) => {
    const { username, password, service } = req.body;
    console.log("service: ", service);
    if (!service) {
        return res.status(400).send("Service URL is required.");
    }

    if (users.username && users.password === password) {
        //create ticket
        const ticket = "ST-" + uuid();

        redisUtils.setRedisValue(ticket, JSON.stringify({ username, service }), 3600000);

        const redirectUrl = `${service}?ticket=${ticket}`;
        console.log("/login redirectUrl: ", redirectUrl);

        req.session.authenticated = true;
        req.session.username = username;
        req.session.ticket = ticket;

        console.log(req.session);

        res.setHeader("Set-Cookie", "isCASLoggedIn=true");

        res.redirect(redirectUrl);
    } else {
        res.status(401).send("Login failed");
    }
});

cas.get("/serviceValidate", async (req, res) => {
    try {
        const { ticket, service } = req.query;

        const ticketDataJson = await redisUtils.getRedisValue(ticket);
        const ticketData = JSON.parse(ticketDataJson);

        console.log("Value retrieved:", ticketData);
        console.log("/serviceValidate ticketData parsed: ", ticketData);

        if (ticketData && ticketData.service === service) {
            console.log("Construct CAS response XML");

            const redirectUrl = new URL(service);
            redirectUrl.searchParams.append("ticket", ticket);

            redisUtils.deleteRedisValue(ticket);

            res.json({
                serviceResponse: {
                    authenticationSuccess: {
                        user: ticketData.username,
                        redirectUrl: redirectUrl.toString()
                    }
                }
            });
        } else {
            console.log("Invalid ticket");
            res.status(400).send("Invalid ticket");
        }
    } catch (err) {
        console.log("Error:", err);
        res.status(500).send("Server error while retrieving ticket");
    }
});

//start server
cas.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
