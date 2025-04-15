
const popCommentBtn =  document.getElementById('commentPoperBtn')
console.log(popCommentBtn)
const commentArea = document.getElementById('commentingArea')
const commitForm = document.getElementById('commentSubmitForm')
const comment = document.getElementById('comment')
let modalInput = document.getElementById('modalEditComment')

let commentId = '';
let modalOpen = false;
let saveCommentBtn =  document.getElementById('saveComment')


popCommentBtn.addEventListener('click', (e)=>checkCommentArea(e))

commitForm.addEventListener('submit', (e)=>{
    checkCommentArea()
})
let isOpen = false;
function checkCommentArea(e){
    e.preventDefault()
 if(!isOpen){
    commentArea.style.display = "block"
    isOpen = true;
console.log(isOpen)

 }else{
    commentArea.style.display = "none"
    isOpen = false;
 }
}
const icon = document.querySelector('.settingIcon')
const editDeleteBtn = document.querySelector('.editAndDeleteBtn')
//----------------------------------------------------------------------
// edit comment functionality
var posts = []
 const getPosts = async()=>{
   try{
    const res = await axios.get('http://localhost:3000/api/comments')
    console.log(res.data)
    posts = res.data
   }catch(err){
      console.log(err)
   }
 }
 getPosts()

//LISTEN :: as for one single array , no need to loop through the array to find its keys just double find() if nested inside 

// modal popup
   const div= document.querySelector('#commentList')
   div.addEventListener('click', (e)=>{
    e.preventDefault()

    if(!div){
        console.log('class does not exist')
        return;
    }

    if(e.target.classList.contains('editButton')){
        const div =  e.target.closest('.liComment')
         console.log(div)
         commentId = div.dataset.id

        const foundPost = posts.find((p)=>{
             return p.comments.find((comment)=> comment.comment_Id === commentId)
        })
        const foundComment = foundPost.comments.find((comment)=> comment.comment_Id === commentId).comment;
        modalInput.value = foundComment
     document.getElementById('formModal').style.display = "block"
    }
})



// submtting update form
saveCommentBtn.addEventListener('click', (e)=>{
    e.preventDefault()
    updateComment(commentId)
//  document.getElementById('formModal').style.display = "none"
})

// update comment 
const updateComment = async(commId)=>{
let updatedComment = modalInput.value
    let API_URL = 'http://localhost:3000/'
   try{
    const res = await axios.patch(`${API_URL}api/comment/${commId}/update`,
        {modalInput : updatedComment}
    )
    let comment = res.data.newComment
    console.log(comment)
    document.getElementById('commentText').textContent = comment
    modalInput.value = comment;
   }catch(err){
    console.log(err)
   }
}

//  closing functionality
const openCloseModal = (e)=>{
    e.preventDefault()
       document.getElementById('formModal').style.display = "none"
  
}

