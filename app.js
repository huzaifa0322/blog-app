  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
  import {getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut}
from "https://www.gstatic.com/firebasejs/10.2.0/firebase-auth.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-analytics.js";
import {doc,getDoc,setDoc, query, collection, where, getDocs,getFirestore, addDoc} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCwUL5pQ1rTqwKfscIzjoGU_IjwU18W1u4",
    authDomain: "smit-3110f.firebaseapp.com",
    projectId: "smit-3110f",
    storageBucket: "smit-3110f.appspot.com",
    messagingSenderId: "832296365657",
    appId: "1:832296365657:web:e8048c2751a39bf88bcb48",
    measurementId: "G-0DH1FQXCR6"
  };
import { redirectTo,getCurrentUrl } from "./index.js";
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// const signUpForm = document.getElementById('signup')
const loginForm = document.getElementById('login')
const signUpForm = document.getElementById('signup')
const createAccountContainer = document.getElementById('createAccountContainer')
const post_container = document.getElementById('post_container')
const welcome = document.getElementById('welcome')
const post_form = document.getElementById('post_form')
const profile_ele = document.getElementById("profile_name");
const my_blogs_heading = document.getElementById("my_blogs_heading");
const profile_pic = document.getElementById('profile_pic');
const user_name = document.getElementById('user_name');
const editModalBtn = document.querySelectorAll(".editModal")
const logout = document.getElementById('logout')
if(logout){
    logout.addEventListener('click', logoutUser)
}

if(signUpForm){
    signUpForm.addEventListener('submit', signup)
}
if(loginForm){
    loginForm.addEventListener('submit', login)
}
if(post_form){
post_form.addEventListener('submit', submitPost)
}
if(editModalBtn.length >0 ){
    editModalBtn.forEach(element => {
        element.addEventListener("click", editModal);
    });
}
function checkIfUserIsLoggedIn(user) {
    const isUserLoggedIn = localStorage.getItem("isUserLoggedIn");

    if (isUserLoggedIn.toLowerCase() === "true" && user) {
        if (getCurrentUrl().includes('/login.html')) {
            redirectTo('/home.html');
        }
    } else {
        if (getCurrentUrl().includes('/home.html') || getCurrentUrl().includes('/profile.html')) {
            redirectTo('/login.html');
        }
    }
}
function logoutUser() {
    signOut(auth).then(() => {
        // Sign-out successful.
        localStorage.setItem('isUserLoggedIn',false);
        redirectTo('/login.html')
    }).catch((error) => {
        // An error happened.
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const uid = user.uid;
        checkIfUserIsLoggedIn(user);
        console.log('User uid-->', uid)
        displayItemList(uid)
        console.log(auth.currentUser.uid)
        const info = await getUserInfo(uid)
        if(profile_ele){
            profile_ele.text = info.name;
        }
        // ...
        if(profile_pic || user_name){
            profile_pic.addEventListener('DOMContentLoaded',updatePicAndUserName(uid))
        }
        
    } else {
        console.log('User is not logged in')
        checkIfUserIsLoggedIn(user);
    }
});

function signup(e) {
    e.preventDefault();
    
    const first_name = document.getElementById('signup_first_name').value;
    const last_name = document.getElementById('signup_last_name').value;
    const name = first_name + " " + last_name;
    const email = document.getElementById('signup_email').value;
    const password = document.getElementById('signup_password').value;
    console.log("in signup function")
    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            const userInfo = {
                name,
            };
            const usersCollection = collection(db, 'users');
            const userDocRef = doc(usersCollection, user.uid);

            await setDoc(userDocRef, userInfo);
            
            console.log("User registered successfully!");
            localStorage.setItem('isUserLoggedIn',true);

            redirectTo('/login.html');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            // Display error message to the user
            const errorElement = document.getElementById('error-message');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        });
}

function login(e) { 
    e.preventDefault()
    console.log("in login")
    const email = document.getElementById('login_email').value
    const password = document.getElementById('login_password').value
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      localStorage.setItem('isUserLoggedIn',true)
      redirectTo('/home.html')
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(error.message)
    });
 }

 
async function submitPost(e) {
    e.preventDefault()
    const title = document.getElementById('post_title').value
    const description = document.getElementById('post_desc').value
    const postObj = {
        title,
        description,
        uid: auth.currentUser.uid,
        created_at: new Date().getTime().toString(),
        u_ref: "/users/"+auth.currentUser.uid,
    }

    const postRef = collection(db, 'user_post')
    await addDoc(postRef, postObj)
    displayItemList(auth.currentUser.uid)
    post_form.reset()
}


async function getUserInfo(uid) {
    const userRef = doc(db, "users", uid); // Collection name "users"
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document!");
        return null;
    }
}

async function displayItemList(userUid) {
    const itemList = document.getElementById("post_container");
    if(post_container){
        post_container.innerHTML = null
        try {
            const itemsCollection = collection(db, "user_post"); // Replace "items" with your collection name
            const querySnapshot = await getDocs(query(itemsCollection, where("uid", "==", userUid)));
            console.log(querySnapshot)
            if(querySnapshot.docs.length > 0){
                if(my_blogs_heading){
                    my_blogs_heading.style.display = "block";
                }
                querySnapshot.forEach(async doc => {
                    const itemData = doc.data();
                    console.log(doc.id);
                    const { title, created_at, uid, description
                    } = itemData;
                const userInfo = await getUserInfo(uid);
                //     const card = `<div class="card">
                //     <div class="card-title card-userInfo">
                //       <span> Post By  ${userName} </span> 
                //       <span> ${new Date().toLocaleDateString()} </span> 
                     
                //     </div>
                //     <div class="card-title">
                //      ${title}
                //     </div>
                //     <div class="card-body"> ${description} </div>
                //   </div>`
                console.log(userInfo)
                const created_date_time = formatTimestamp(created_at);
                const card = `                
                        <div class="post_wrapper">
                            <div class="post_header">
                                <div class="img_wrapper">
                                    <img src="${userInfo['url']}" alt="">
                                </div>
                                <div>
                                    <h2>${title}</h2><br>
                                    <h5>${userInfo['name']}</h5><br>
                                    <h5>${created_date_time}</h5>
                                </div>
                            </div>
                            <div class="post_body">
                                ${description}
                            </div>
                            <div class="post_footer">
                                <button data-doc_id="${doc.id}}" class="editModal">Edit</button>
                                <button class="deletebutton">Delete</button>
                            </div>
                        </div>`;
            
                    post_container.innerHTML += card
                    // const listItem = document.createElement("li");
                    // listItem.textContent = itemData.name; // Assuming each document has a "name" field
    
                    // itemList.appendChild(listItem);
                });
            }else{
                if(my_blogs_heading){
                    my_blogs_heading.style.display = "none";
                }
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    }
}


function formatTimestamp(timestamp) {
    console.log(timestamp)
    const date = new Date(parseInt(timestamp)); // Convert timestamp to a Date object
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Function to add appropriate suffix for day
    const getDayWithSuffix = (day) => {
        if (day >= 11 && day <= 13) {
            return day + "th";
        }
        switch (day % 10) {
            case 1: return day + "st";
            case 2: return day + "nd";
            case 3: return day + "rd";
            default: return day + "th";
        }
    };

    const formattedDateTime = `${month} ${getDayWithSuffix(day)} ${year} ${hours}:${minutes.toString().padStart(2, '0')}`;
    return formattedDateTime;

}

async function updatePicAndUserName(uid) {
    const userInfo = await getUserInfo(uid);
    if(profile_pic){
        profile_pic.src = userInfo['url'];
    }
    if(user_name){
        user_name.innerText = userInfo['name'];
    }
}

function editModal(_this){
    console.log("edit modal button clicked")
    console.log(_this);
}