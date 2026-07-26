require('dotenv').config({ override: true })

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const session = require("express-session");
const flash = require("connect-flash");


const Blog = require("./models/blog")
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const checkForAuthenticationCookie = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URL)
.then((e)=> console.log("Mongodb connected!"))
.catch(err => console.log(err))



app.set('view engine','ejs')
app.set('views',path.resolve("./views"));

app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')))  // so that everything in public folder should be served staticallly
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.errors = req.flash("errors");
    res.locals.success = req.flash("success");
    next();
});


app.get('/', async (req,res)=>{
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });  // -1 for desc order sort
    res.render('home',{user:req.user , blogs:allBlogs}) 
})

app.use('/user',userRoute)
app.use('/blog',blogRoute)


app.listen(PORT, ()=> console.log(`Server started at PORT: ${PORT}`))