const z = require('zod')

const signupUserSchema = z.object({
        fullName: z
            .string()
            .trim() 
            .min(3,{message:"Name must be atleast 3 characters long"})
            .max(50,{message:"Name must be atmost 50 characters long"}),
        email: z
            .string()
            .trim() 
            .email({message:"Please enter a valid email address."}),
        password: z
            .string()
            .min(5,{message:"Password must be atleast 5 characters long"})
            .max(50,{message:"Password must be atmost 50 characters long"}),
})
        
const signinUserSchema = z.object({
        email: z
            .string()
            .trim() 
            .email({message:"Please enter a valid email address."}),
        password: z
            .string()
            .min(5,{message:"Password must be atleast 5 characters long"})
            .max(50,{message:"Name must be atmost 50 characters long"})
})

module.exports=({
    signupUserSchema,
    signinUserSchema
})