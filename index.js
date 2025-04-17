import ejs from "ejs"
import express, { Router } from "express"
import bodyParser from "body-parser"
import { v4 as uuidv4 } from 'uuid';
import methodOverride from 'method-override'
import session from "express-session"
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";




var app = express()

import data from "./data/data.js";
const {posts, users} = data;

// routes
import postsRoute from './routes/home.js'


let __fileName = fileURLToPath(import.meta.url)
let __dirname = path.dirname(__fileName)


const port = process.env.PORT || 3000;


app.use(session({
    secret: process.env.SESSION_SECRET || 'hello world',  // Secret key to sign the session cookie
    resave: false,               // Don't save session if it wasn't modified
    saveUninitialized: true,     // Save sessions even if they are not initialized
    cookie: { secure: false }    // Set to true for HTTPS, false for development (HTTP)
}));
// to access logged in users all view files including "partials"
app.use((req, res, next) => {
    if (req.session.userId) {
        // of users locals
        res.locals.loggedInUser = users.find(user => user.userId === req.session.userId) || null;

        // of notifications local info
        res.locals.Notifications = Notifications.filter((n)=> n.userId === req.session.userId)
    } else {
        res.locals.loggedInUser = null;
        res.locals.Notifications = []
    }
    next();
});

// delete image middleware
let deleteImage = (img)=>{
    return (req,res, next) =>{
        if(!img) return next();
// unlike deletes the old file
       const cleanImg = img.startsWith('/') ? img.slice(1) : img;
       const fullPath = path.join(__dirname, 'public' + img)
       fs.unlink(fullPath, err =>{
          if(err){
             return res.send('something is worong ' + err)
          }

            console.log('message deleted successfully !')
           res.locals.imageDelete = `Image deleted successfully !`
          next()
       })
    }        
}

const storage = multer.diskStorage({
    destination : 'public/uploads/',
    filename : (req,file, cb) =>{
        // to rename the uploadedf file to avoid name conflict
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage});

app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static('public'));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const logUpload = (req,res, next)=>{
    console.log('image uploading...')
    next()
}

// routes
app.use('/', postsRoute)
// routes 

// app.get('/', postsRoute)


app.get('/new', (req,res)=>{
     const loggedInUser = req.session.userId
     if(!loggedInUser){
        console.log('plese log in first ')
        return res.redirect('/login')
     }

        res.render('newBlog.ejs')
});


app.post('/new', logUpload, upload.single('image'),(req,res)=>{
    let newDate = new Date()
    const uInfo = {
        id : uuidv4(),
        memory : req.body.memory,
        img : '/uploads/'+ req.file.filename,
        cdate : `${newDate.getDate()},${newDate.getMonth() + 1},${newDate.getFullYear()}`,
        userid : req.session.userId,
        likes: [],
        countLikes : 0,
        comments : [],
        shareContent : [],
        sharedBy : []
    }
    console.log('/uploads/' + req.file.filename)
     posts.push(uInfo)
    res.redirect('/')
})

// show route 

app.get('/show/:id', (req,res)=>{
    const postId = req.params.id;
     const ourposts = posts.find((post)=>{
        console.log(typeof postId, typeof post.id)
        return  typeof postId === "string" && post.id === postId
    })
    res.render('showpost.ejs', {post : ourposts})
})


app.get('/edit/:id',(req,res)=>{
    let postId = req.params.id;
    const allPosts = posts.find((post)=>{
        return post.id === postId})
    if(allPosts === -1){
        res.send('400 not found')
    }
    res.render('editPost.ejs', {post: allPosts})
})

// // patch request GET
// app.get('/update/:id', (req,res)=>{
//     let postId = req.params.id;
//     const ourposts = posts.find((post)=>{
//         return post.id === postId})
//     if(ourposts === -1){
//         res.send('400 not found')
//     }
//     res.render('updated-patch.ejs', {user: ourposts})
// })

// // PATCH ROUTE !
// app.patch('/update/:id', (req,res)=>{
//     const {id} = req.params;
//     const {fname} = req.body

//     const ourposts = posts.find((post)=>{
//         console.log(post.fname)
//         return post.id === id
//     })
//     ourposts.fname = fname
//     res.redirect('/')

// })

app.put('/update/:id',logUpload, upload.single('image'), (req,res)=>{
    // post id.. route id
    const {id} = req.params;
    const oldImage = posts.find((post)=> post.id === id).img
     deleteImage(oldImage)
    const updatedposts = {
        id : uuidv4(),
        memory : req.body.memory,
        img : '/uploads/' + req.file.filename,
        cdate : new Date().toISOString().split('T')[0],
        userid : req.session.userId,
        likes: [],
        countLikes : 0,
        comments : [],
        shareContent : [],
        sharedBy : []
    }

  // Find index of the post
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  // Replace the entire post object (full update)
  posts[postIndex] = updatedposts
  res.redirect('/')
})


// delete route

app.delete('/delete/:postId',(req,res)=>{
    const { postId } = req.params; // Extract the post ID from the request
// custom delete posts 
    const foundPost = posts.find((post)=> post.id === postId)
    console.log("postid " +postId + " and deleting post " + JSON.stringify(foundPost))
    if(!foundPost){
        return res.send(' no post found !')
    }
    console.log(posts.indexOf(foundPost))

    const index = posts.indexOf(foundPost)
    const postIndex = posts[index]

    if(postIndex !== -1){
     deleteImage(foundPost.img)
    posts.splice(index, 1)
    console.log('post successfully deleted !')
    }
    console.log(JSON.stringify(posts))
    res.redirect('/')
})


// USERS & USER LOGIN ROUTES

app.get('/users/signup', (req,res)=>{
    const userExist = req.session.userExistMsg

    delete req.session.userExistMsg
    res.render('users/sign-up.ejs', {userExistMsg : userExist})
})

app.post('/users/signup', logUpload, upload.single('image'),(req,res)=>{

    const newUser = {
        userId : uuidv4(),
        firstName : req.body.fname,
        lastName :  req.body.lname,
        email :     req.body.email,
        password :  req.body.password,
        avatar : '/uploads/' + req.file.filename,
    }

    // getting the current user
    const existingUser = users.find((user) => user.email === newUser.email)
    if(existingUser){
       req.session.userExistMsg = `Email is already registered !`
       return res.redirect('/users/signup')
    }

    users.push(newUser)
    // creates a session with an id for new user signed in
    req.session.userId = newUser.userId
    req.session.welcomeMessage = `welcome ${newUser.firstName} to my app`
    console.log("Welcome " + newUser.firstName + " to MemoryDom App")
    res.redirect('/')
})

// login form
app.get('/login', (req,res)=>{
    const signUpMsg = req.session.signUpMessage
    res.render('users/login.ejs', {signUpMsg : signUpMsg})
})

app.post('/user/login', (req,res)=>{

    const {email, password} = req.body
   const existingUser = users.find((user)=> user.email === email && user.password === password)
      if(existingUser){
        req.session.userId = existingUser.userId
        req.session.welcomeBack = `welcome back ! ${existingUser.firstName}`
        res.redirect('/')
        console.log('welcome back ! mr : ', existingUser.firstName)
      }else{
         req.session.signUpMessage = `Please sign up first !`
         console.log('please sign up first')
         res.redirect('/login')
      }
})


// log out route

app.get('/logout', (req,res)=>{
    const user = users.find((u)=> u.userId === req.session.userId)
let goodByeMsg = ''
    if(user){
        goodByeMsg = `see you again ${user.firstName}`
       
    }
    req.session.destroy((err)=>{
        if(err){
            return res.send(res.json({message : "destruction problem"})).status()
        }
        res.cookie('goodbye', goodByeMsg, {maxAge : 3000})
        res.redirect('/')
        console.log('user logged out successfully !')
    })
})

// logged in user profile 
app.get('/userProfile', (req,res)=>{
    const loggedInUser = users.find((user)=>user.userId === req.session.userId)

    if(!loggedInUser){
         console.log('user not found')
        return res.json({message :"User not found"})
    }

    const ActiveUserPosts = posts.filter((post)=> {
        return post.userid === loggedInUser.userId
    })

    console.log("userprofile posts " + JSON.stringify(ActiveUserPosts, null, 2))
    res.render('users/userProfile.ejs', {posts : ActiveUserPosts})
})

// post owner profile
app.get('/postOwnerProfile/:id', (req,res)=>{
    const userId = req.params.id

    // find the user on whose post gets clicked !
    const OwnerUser = users.find((user)=> user.userId === userId)
    console.log('user : ' + OwnerUser.userId, "userId" + userId)
    if(!OwnerUser){
        console.log('user not found')
        return res.send(res.json({message : "user not found"}))
    }

    // showing/filtering the owner user posts
    const ownerPost = posts.filter((post)=> post.userid === OwnerUser.userId)

    if(!ownerPost){
       return res.send(res.json({message : "no posts found"}))
    }
    
    console.log('the user has ' + ownerPost.length)
    console.log(JSON.stringify("owner posts : "  +JSON.stringify(ownerPost, null, 2)))
    res.render('users/postOwnerProfile.ejs',{user : OwnerUser , posts: ownerPost} )
})

// post likes
app.post('/posts/:id/like', (req,res)=>{
    const postId = req.params.id
    const loggedInUser = users.find((user)=>user.userId === req.session.userId)
    if(!loggedInUser){
        console.log('please log in and like!')
        return res.redirect('/login')
    }

    // finding the post which a user like 
    const post = posts.find((post)=>post.id === req.params.id)
     // notification method parameters 
     const postOwnerId = post.userid
     const notMessage = `${loggedInUser.firstName} has liked your post !`
     const notType = 'like'
     const postid = post.id
     const fromUserId = loggedInUser.userId
   
    if(post.likes.includes(loggedInUser.userId)){
        console.log('you have already has liked the post')
        // until we alert user the bottom
        post.likes = post.likes.filter((userId) => userId !== loggedInUser.userId)
        post.countLikes =  post.countLikes - 1;
    }else{
        const liker = post.likes.push(loggedInUser.userId)
        post.countLikes += 1    
    }
    
    
//  send notification except the owner liking
    if(post.userid !== loggedInUser.userId){
        // function call
        createNotification(postOwnerId, notMessage, notType, postid, fromUserId) 
    }
        

    
    
    console.log('hey ' + loggedInUser + " logged in, you have " + Notifications.length +  " notifications")
     console.log("posts likes" + JSON.stringify(post.likes,null ,2))


    console.log('NOTIFICATIONS after likes : ' + JSON.stringify(Notifications, null ,2))
    res.redirect('/')
})
   


// post comments 

app.post('/posts/:id/comment', (req,res)=>{
    const postId = req.params.id
    const newComment = req.body.comment;

    const loggedInUser = users.find((user)=>user.userId === req.session.userId)
    if(!loggedInUser){
        console.log('please log in and comment !')
        return res.redirect('/login')
    }

    const post = posts.find((post)=> post.id === postId)
    const commentContent = {
        comment_Id : uuidv4(), 
        comment :newComment, 
        author : loggedInUser.firstName, 
        commenterId : loggedInUser.userId}
   
    if(post?.userid && loggedInUser?.userId && post.userid === loggedInUser.userId){
        console.log('same user ')
        commentContent.author = 'me'
    }

    post.comments.push(commentContent)
    console.log(JSON.stringify(post, null, 2))

    //  send notification except the owner liking
    if(post.userid !== loggedInUser.userId){
        // function call
        createNotification(post.userid, `${loggedInUser.firstName} has commented on your post`, 'Comment', post.id, loggedInUser.userId)
    }
    

    return res.redirect('/')

})

// edit a comment
app.get('/api/comments',(req,res)=>{
    res.json(posts)
} )

// UPDATE COMMNET

app.patch('/comment/:id/update', (req,res)=>{
    // /api/comment/27557dca-2287-427d-ac84-fedb09ae3513/update
    const {id} = req.params;
    const modalInput = req.body.modalEditComment;
    let commentFound = false;
    // steps to update a comment
    // 1. if the current user is the creator of the comment
    const loggdInUser = users.find((u) => u.userId === req.session.userId)
    if(!loggdInUser){
        return res.send('please log in first !')
    }

    let postcomment = {}
    //2 if the user is the owner of the comment
    posts.forEach((p)=>{
       const post = p.comments.find((c) => c.comment_Id === id)
       if(post){
        console.log(modalInput) 
        // post.comment = modalInput

       }
    })
})


// delete a comment

app.delete('/comment/:id/delete', (req,res)=>{
    const {id}  = req.params

  let commentDeleted = false;
    let commentLength = null;
    const loggedInUser = req.session.userId;
    if(!loggedInUser){
        return res.send('please log in first !')
    }

    posts.forEach((post)=>{
        commentLength = post.comments.length;
        let comment = post.comments.find((comment)=> comment.comment_Id === id)
        if(comment){
         post.comments =  post.comments.filter((comment)=> comment.comment_Id !== id)
        }

        if(post.comments < commentLength){
            commentDeleted = true;
        }
    })

    if(commentDeleted){
        console.log('comment successfully deleted ')
    }
    res.redirect('/')
})


// share a post

app.post('/posts/:id/share', (req,res)=>{
    const postId = req.params.id

    // first condtion = who clicks 
    // const user = req.session.userId;
    const loggedInUser = users.find((u)=> u.userId === req.session.userId)
    if(!loggedInUser){
        return res.send('please log in !')
    }

    const post = posts.find((post)=> post.id === postId)
    // main creator of the post
    const user =   users.find(((user)=> user.userId === post.userid))


    if(post.sharedBy.includes(loggedInUser.userId)){
        return res.send('you have once shared this post')
    }
    const sharedPost = {
            postId : uuidv4(),
            description : post.memory,
            postDate : post.cdate,
            postImg : post.img,
            originalUserId : post.userid,
            originalUser : user,
            sharingDate : new Date().toISOString().split('T')[0]
    };
    // make sure shareContent key of our post is an array
    // IN JS = SINGLE LINE IF-STATEMENT
//    looping through the posts



    const postsAndSharer = posts.map((post)=>{
        console.log("postid " + post.id)
        console.log("shareByIds" + post.sharedBy)

        return Object.assign({}, post, {
             postSharer : post.sharedBy.map((sharedById)=>{
             const user =   users.find((user)=>user.userId === sharedById)
             console.log('looking for user Id ' + sharedById, " found :" + JSON.stringify(user, null, 2))
             return user || null 
            })
        })
    })
    post.shareContent.push(sharedPost)
    post.sharedBy.push(loggedInUser.userId)

      //  send notification except the owner liking
      if(post.userid !== loggedInUser.userId){
        // function call
        createNotification(post.userid, `${loggedInUser.firstName} has shared on your post`, 'Share', post.id, loggedInUser.userId)
    }
    console.log(JSON.stringify(postsAndSharer, null , 2))
    res.redirect('/')
})



// notifications 

app.get('/notifications/:id', (req,res)=>{
    const notId = req.params.id

    const loggedInUser =  users.find((u)=> u.userId === req.session.userId)

    if(!loggedInUser){
        return res.send('please log in !')
    }

    const notification = Notifications.find((not)=> not.notId === notId)

    if(notification){
        notification.isRead = true;
        const post = posts.find((post)=> post.id === notification.postId)

        var notificationsWithPosts =  Object.assign({}, notification, {post : post})
        console.log(notificationsWithPosts)
        res.render('notifications/notifications.ejs', {notification : notificationsWithPosts})
    }
   
})




// var newDate = new Date();
// var users = [
//     {
//         userId : uuidv4(),
//         firstName : 'abedkhan',
//         lastName : 'noori',
//         email : 'a@gmail.com',
//         password : '123'
//     }, 

//     {
//         userId : uuidv4(),
//         firstName : 'khaibar',
//         lastName : 'ansar',
//         email : 'kh@gmail.com',
//         password : '54321'
//     }, 

// ]

// var posts = [
        // {
        // id : uuidv4(), 
        // memory : 'once upon a time when i had a step mother !',
        // cdate : `${newDate.getDate()},${newDate.getMonth() + 1},${newDate.getFullYear()}`,
        // img : '/uploads/images/ejsImage.jpg',
        // likes: [],
        // countLikes :0,
        // comments : [],
        // shareContent : [],
        // sharedBy : []
        // },
        // {
        // id : uuidv4(),
        // memory : 'whenever you smile i smile',
        // cdate : `${newDate.getDate()},${newDate.getMonth() + 1},${newDate.getFullYear()}`,
        // img : '/uploads/images/ejsImage.jpg',
        // likes: [],
        // countLikes :0,
        // comments : [],
        // shareContent : [],
        // sharedBy : []
        // }
    // ]


    // notifications 

    var Notifications = []

    // we need five things 1. userid 2. the massage 3. type of notif. 4. postId= whic post is affected 5. who render the function the post
    function createNotification(userid, message, type, postid, fromUserId){
        const notifications = {
            notId : uuidv4(),
            userId : userid,
            message : message,
            type : type,
            postId : postid,
            fromUserId : fromUserId,
            timestamp : new Date().toISOString(),
            isRead :false
        }
        Notifications.push(notifications)
    }

    var sameContent = function sameUserSameContent(loggedInUser, postOwner){
        if(loggedInUser.userId === postOwner){
            console.log('the owner of the post')
            return res.json({message : "you have liked your own content !"})
       }
    }
    app.listen(port, ()=>{
        console.log('port 3000')
    })