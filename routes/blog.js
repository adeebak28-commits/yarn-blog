const {Router} = require("express")
const multer = require('multer')
const cloudinary = require("../services/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "yarnblog/blogs",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    }
});

function requireAuth(req, res, next) {
    if (!req.user) return res.redirect('/user/signin');
    next();
}

router.get('/add-new', requireAuth, (req,res)=>{
    return res.render('addBlog',{user:req.user})
});

router.post('/', requireAuth, upload.single('coverImage'), async(req,res)=>{
    const {title,body} = req.body;
    try {
        const blog = await Blog.create({
            body, title,
            createdBy: req.user._id,
            coverImageURL: req.file ? req.file.path : undefined
        });
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        req.flash("errors", "Title and body are required.");
        return res.redirect('/blog/add-new');
    }
});

router.get('/:id',async (req,res)=>{
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    if (!blog) 
        return res.status(404).send("Blog not found");
    const comments = await Comment.find({blogId: req.params.id}).populate("createdBy");
    console.log("Comments: ", comments);
    return res.render('blog',{user:req.user, blog:blog ,comments:comments});
});


// comment routers
router.post('/comment/:blogId', requireAuth,  async (req,res)=>{
    try {
        const comment = await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
    return res.redirect(`/blog/${req.params.blogId}`)
    }
})



module.exports = router;