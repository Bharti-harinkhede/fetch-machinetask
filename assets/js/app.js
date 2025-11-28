const cl = console.log

const postContainer = document.getElementById("postContainer")
const blogForm = document.getElementById("blogForm")
const titleCntrl = document.getElementById("title")
const contentCntrl = document.getElementById("content")
const userIdCntrl = document.getElementById("userId")
const addPostBtn = document.getElementById("addPostBtn")
const updatePostBtn = document.getElementById("updatePostBtn")
const loader = document.getElementById("loader")

let BASE_URL = `https://blog-task-43dea-default-rtdb.firebaseio.com`
let POST_URL = `${BASE_URL}/blogs.json`

function toggleSpinner(flag){
      if (flag === true) {
        loader.classList.remove('d-none')
    } else {
        loader.classList.add('d-none')
    }
}

function snackBar(title, icon){
    Swal.fire({
        title,
        icon,
        timer: 1000
    })
}

const createCards = arr =>{
    let res = arr.map(post=>{
        return `
        <div class="card mb-3 shadow rounded" id="${post.id}">
                    <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${post.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div>
                </div> `;
    }).join("")
    cl(res)
    postContainer.innerHTML = res;
}

function blogObjToArr (obj){
    let blogsArr = []
    for (const key in obj) {
        obj[key].id = key
        blogsArr.push(obj[key])
    }
    return blogsArr
}

function fetchAllBlogs(){
    toggleSpinner(true)
    fetch(POST_URL, {
       method: "GET",
       body: null,
       headers : {
        Auth : "Token From LS",
        "content-type" : "application/json"
       }
    })
    .then(res => {
        return res.json()
    })
    .then(data => {
        cl(data)
        let blogsArr = blogObjToArr(data)
        createCards(blogsArr)
    })
    .catch(cl)
    .finally(()=>{
        toggleSpinner(false)
    })
}
fetchAllBlogs()


const onRemove = (ele) => {
 Swal.fire({
  title: "Do you want to remove the Blogs?",
  showCancelButton: true,
  confirmButtonText: "Remove it!",
}).then((result) => {
  if (result.isConfirmed) {
  let REMOVE_ID = ele.closest(".card").id
  cl(REMOVE_ID)
  const REMOVE_URL = `${BASE_URL}/blogs/${REMOVE_ID}.json`
  toggleSpinner(true)
  fetch(REMOVE_URL, {
    method: "DELETE",
       body: null,
       headers : {
        Auth : "Token From LS",
        "content-type" : "application/json"
       }
  })
  .then(res => {
    return res.json()
  })
  .then(data => {
    cl(data)
    ele.closest(".card").remove();
    snackBar(`Blog Removed Successfully!!`, "success")
  })
  .catch(err => {
    cl(err)
    snackBar(`Something Went Wrong While Removig Blog!!`, "error")
  })
  .finally(()=>{
    toggleSpinner(false)
  })
  } 
});
}

function onBlogAdd(eve){
eve.preventDefault()
const blogObj = {
    title : titleCntrl.value,
    content : contentCntrl.value,
    userId : userIdCntrl.value
}
toggleSpinner(true)

fetch(POST_URL, {
    method: "POST",
       body: JSON.stringify(blogObj),
       headers : {
        Auth : "Token From LS",
        "content-type" : "application/json"
       }
})
.then(res => {
    if(res.status >= 200 && res.status < 300){
        return res.json()
    }
})
.then(data => {
    cl(data)
    blogForm.reset()

    let card = document.createElement("div")
    card.className = `card mb-3 shadow rounded`
    card.id = data.name;
    card.innerHTML = `
    <div class="card-header">
                        <h3 class="m-0">${blogObj.title}</h3>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">
                        ${blogObj.content}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="onRemove(this)">Remove</button>
                    </div> `;
                    postContainer.append(card)
})
.catch(err => {
    snackBar(`Something Went Wrong While Creting Blog!!`, "error")
})
.finally(()=>{
    toggleSpinner(false)
})
}

function onEdit(ele){
    toggleSpinner(true)
    let EDIT_ID = ele.closest(".card").id;
    cl(EDIT_ID)
    localStorage.setItem("EDIT_ID",EDIT_ID)

    const EDIT_URL = `${BASE_URL}/blogs/${EDIT_ID}.json`
    cl(EDIT_URL)

    blogForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
    setTimeout(()=>{
    titleCntrl.focus();
    },500)

    fetch(EDIT_URL, {
        method: "GET",
       body: null,
       headers : {
        Auth : "Token From LS",
        "content-type" : "application/json"
       }
    })
    .then(res =>  res.json()
    )
    .then(data => {
        titleCntrl.value = data.title;
        contentCntrl.value = data.content;
        userIdCntrl.value - data.userId;

        updatePostBtn.classList.remove("d-none")
        addPostBtn.classList.add("d-none")
    })
    .catch(err => snackBar(`err`, "error"))
    .finally(()=>{
        toggleSpinner(false)
    })
}

function onUpdate(){
    toggleSpinner(true)
  let UPDATE_ID = localStorage.getItem("EDIT_ID")
  cl(UPDATE_ID);

  const UPDATE_URL = `${BASE_URL}/blogs/${UPDATE_ID}.json`
  cl(UPDATE_URL)

  let UPDATE_OBJ = {
    title : titleCntrl.value,
    content : contentCntrl.value,
    id : UPDATE_ID
  }
  cl(UPDATE_OBJ)
  fetch(UPDATE_URL, {
     method: "PATCH",
       body: JSON.stringify(UPDATE_OBJ),
       headers : {
        Auth : "Token From LS",
        "content-type" : "application/json"
       }
  })
   .then(res => res.json())
   .then(data => {
    cl(data)
    const card = document.getElementById(UPDATE_ID)
    card.querySelector(".card-header h3").innerHTML = data.title;
    card.querySelector(".card-body p").innerHTML = data.content;

    card.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
    card.classList.add("border", "border-success");
    setTimeout(()=>{
     card.classList.remove("border", "border-success");
    },1200)
    blogForm.reset()
    
    updatePostBtn.classList.add("d-none")
   addPostBtn.classList.remove("d-none")
  
   snackBar(`The Blog Updated Successfully!!`, "success")
   })
   .catch(err => {
    cl(err)
    snackBar(`Something Went Wrong While Updating Blog!!`, "error")
   })
   .finally(()=>{
    toggleSpinner(false)
   })
}






updatePostBtn.addEventListener("click", onUpdate);
blogForm.addEventListener("submit", onBlogAdd)