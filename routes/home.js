import express from "express"
import { Router } from "express"
import data from '../data/data.js'
const {posts, users} =  data
let router = Router();

router.get('/',(req,res)=>{

    console.log("current user : " + res.locals.loggedInUser)

    var postsAndusersInfo = posts.map((post)=>{
         // Finding the user who created this post
        const user = users.find((user)=> user.userId === post.userid);
         return Object.assign({}, post, { user});
    })

    const msg = req.session.welcomeMessage
    const welcomeBackMsg = req.session.welcomeBack
    const deleteImgMsg = req.session.imageDelete
    const goodbyeMsg = req.session.goodbye
    
    delete req.session.welcomeMessage
    delete req.session.welcomeBack
    res.clearCookie('goodbye')
    postsAndusersInfo.sort().reverse();
       res.render('index.ejs', 
        {
            posts : postsAndusersInfo, 
            message : msg,
            welcomeBackMsg : welcomeBackMsg,
            goodbyeMsg : goodbyeMsg,
            deleteImgMsg : deleteImgMsg

        })
})


export default router;