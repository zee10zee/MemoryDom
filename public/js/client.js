
// public/app.js or inline in your HTML
if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker Registered"));
  }
  
const popCommentBtn =  document.getElementById('commentPoperBtn')
console.log(popCommentBtn)
const commentArea = document.getElementById('commentingArea')
const commitForm = document.getElementById('commentSubmitForm')
const comment = document.getElementById('comment')
let modalInput = document.getElementById('modalEditComment')
const signupForm = document.getElementById('signUpForm')
let commentId = '';
let saveCommentBtn =  document.getElementById('saveComment')
// const commentopenter = document.querySelector('.popCommentBtn')

// avatar camera
const camera = document.getElementById('cameraBtn')
// 
camera.addEventListener('click', (e)=>{
    document.getElementById('img').click()
})
window.addEventListener('DOMContentLoaded', () => {
    popCommentBtn.addEventListener('click', (e)=>checkCommentArea(e));
  });


// commitForm.addEventListener('submit', (e)=>{
//     checkCommentArea(e)
// })
// let isOpen = false;
// function checkCommentArea(e){
//     e.preventDefault()
//  if(!isOpen){
//     commentArea.style.display = "block"
//     isOpen = true;
// console.log(isOpen)

//  }else{
//     commentArea.style.display = "none"
//     isOpen = false;
//  }
// }
// if profilePic not selected



const icon = document.querySelector('.settingIcon')
const editDeleteBtn = document.querySelector('.editAndDeleteBtn')
//----------------------------------------------------------------------