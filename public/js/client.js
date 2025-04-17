
document.addEventListener('DOMContentLoaded', ()=>{
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("Service Worker Registered"));
    }

    const inputImg = document.getElementById('signupImage')
    const preview = document.getElementById('previewImage')
   
    inputImg.addEventListener('change',()=>{
      handlePreviews(inputImg,preview)
    });

    

    const handlePreviews = (listeningImg, previewImage)=>{
     
        const file = listeningImg.files[0];
        if(file){
          const reader = new FileReader();
   
          reader.onload = ()=>{
             previewImage.src = reader.result;
             previewImage.style.display = "block"
          };
   
          reader.readAsDataURL(file)
        }
    }

  //   inputImg.addEventListener('change', (e)=>{
  //     const file = e.target.files[0]
  //     if(file){
  //       console.log('we have a file')
  //       let reader = new FileReader()
  //       reader.onload = ()=>{
  //         preview.src = reader.result
  //       }
  
  //       reader.readAsDataURL(file);
  //     }
  //  })


      // avatar camera
      const profilePicBtn = document.getElementById('previewImage')

      profilePicBtn.addEventListener('click', (e)=>{
          document.getElementById('signupImage').click()
      })
})


 
 
  
