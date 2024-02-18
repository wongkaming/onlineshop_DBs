const express = require("express")
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
// const introRoutes = require("./routes/intro-routes");
const clothRoutes = require("./routes/clothes-routes");
const authRoutes = require("./routes/auth");
const allitemRoutes = require("./routes/allitem-routes");
const wishlistRoute = require("./routes/wishlist-route");
const cartRoute = require("./routes/cart-routes");
// const eventRoute = require("./routes/event-route");
const profileRoutes = require("./routes/profile-routes");
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
    origin: process.env.ORIGIN,
    credentials: true
}));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge:60000 },
    })
);
app.use(passport.initialize());
app.use(passport.session());


// app.use("/latest/intro", introRoutes);
app.use("/latest/clothes", clothRoutes);
// app.use("/latest/event", eventRoute);

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
app.use(
    "/latest/user/cart",
    passport.authenticate("jwt", { session: false }),
    cartRoute
);
app.use("/latest/profile", profileRoutes);

app.use((req, res, next) => {
    if(!req.session){
        return next(new Error('Oh no')) //handle error
    }
    next() //otherwise continue
})

app.listen(4040, () => {
    console.log("listening...");
})
