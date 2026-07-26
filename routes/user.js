const {Router} = require("express")
const multer = require('multer')
const cloudinary = require("../services/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const User = require ("../models/user")
const {signupUserSchema,signinUserSchema} = require('../validators/auth-validator')

const router = Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "yarnblog/profile-images",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

router.get('/signin',(req,res)=>{
    return res.render("signin");
})

router.get('/signup',(req,res)=>{
    return res.render("signup");
})

router.post('/signup', upload.single('profileImage'), async (req,res)=>{
    const result = signupUserSchema.safeParse(req.body);
    if(!result.success)
    {
        const message = result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect('/user/signup'); 
    }

    const {fullName,email,password} = result.data;
    try {
        const userData = { fullName, email, password };
        if (req.file) {
            userData.profileImageURL = req.file.path;
        }
        await User.create(userData);
        return res.redirect("/user/signin");
    } catch (error) {
        if (error.code === 11000) 
        {
            req.flash("errors", "An account with this email already exists.");
            return res.redirect('/user/signup');
        }
        req.flash("errors", "Something went wrong. Please try again.");
        return res.redirect('/user/signup');
    }
});

router.post('/signin',async(req,res)=>{
    const result = signinUserSchema.safeParse(req.body);
    if(!result.success)
    {
        const message = result.error.issues[0].message;
        req.flash("errors",message);
        return res.redirect('/user/signin'); 
    }
    const {email,password} = result.data;
    try
    {
        const token = await User.matchPasswordAndGenerateToken(email,password);
        //console.log("token: ",token);
        return res.cookie("token",token).redirect("/");
    } catch(error) {
        req.flash("errors", "Incorrect email or password.");
        return res.redirect('/user/signin');
    }
});

router.get('/logout',(req,res)=>{
    res.clearCookie('token').redirect('/');
})


module.exports = router;
