
const popCommentBtn =  document.getElementById('commentPoperBtn')
console.log(popCommentBtn)
const commentArea = document.getElementById('commentingArea')
const commitForm = document.getElementById('commentSubmitForm')
const comment = document.getElementById('comment')


popCommentBtn.addEventListener('click', (e)=>checkCommentArea(e))

commitForm.addEventListener('submit', (e)=>checkCommentArea())
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

console.log(icon, editDeleteBtn)
icon.addEventListener('click',(e)=>{
    
})

