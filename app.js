const express = require("express")
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
// const introRoutes = require("./routes/intro-routes");
// const clothRoutes = require("./routes/clothes-routes");
const authRoutes = require("./routes/auth");
const allitemRoutes = require("./routes/allitem-routes");
const wishlistRoute = require("./routes/wishlist-route");
// const eventRoute = require("./routes/event-route");
const profileRoutes = require("./routes/profile-routes");
const Cloth = require("./models/clothes");
const Event = require("./models/event");

const cors = require("cors");
const passport = require("passport");
require("./config/passport")(passport);
require('dotenv').config();
const session = require("express-session")

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("連結mongoDB..");
}).catch((e)=>{
    console.log(e);
});

// middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);
app.use(passport.initialize());
app.use(passport.session());


// app.use("/latest/intro", introRoutes);
// app.use("/latest/clothes", clothRoutes);
// app.use("/latest/event", eventRoute);
app.get("/latest/clothes/all", async (req, res) => {
    try {
        let data = await Cloth.find({}).exec(); // [产品数据...]
        const page = parseInt(req.query.page) || 1; 
        const perPage = parseInt(req.query.perPage) || 10;

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedProducts = data.slice(startIndex, endIndex);

        return res.send(paginatedProducts)
    } catch(e) {
        return res.status(500).render("not-found")
    }
})
app.get("/latest/event/all", async (req, res) => {
    try {
        let data = await Event.find({}).exec();
        return res.send(data)
    } catch(e) {
        return res.status(500).render("not-found")
    }
})


app.use("/latest/result", allitemRoutes);
app.use("/latest/user", authRoutes);
app.use(
    "/latest/user/wishlist",
    passport.authenticate("jwt", { session: false }),
    wishlistRoute
);
app.use("/latest/profile", profileRoutes);

app.use((err, req, res, next) => {
    return res.status(400).render("error")
})

app.listen(4040, () => {
    console.log("listening...");
})