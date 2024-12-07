import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoKXRdQA1AkI1kUvthhIUQlgO5eq1UW-M",
  authDomain: "hack-47aaf.firebaseapp.com",
  projectId: "hack-47aaf",
  storageBucket: "hack-47aaf.firebasestorage.app",
  messagingSenderId: "198405218492",
  appId: "1:198405218492:web:2bc37cd69160508e5d30b9",
  measurementId: "G-734SCT0SX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log(app)
console.log(auth)

// Google provider for OAuth
const provider = new GoogleAuthProvider();

// Function to show alert using SweetAlert
function showAlert(title, message, type = "success") {
  Swal.fire({ title, text: message, icon: type, confirmButtonText: "OK" });
}

// Signup Function
async function signup(event) {
  event.preventDefault();

  const emailField = document.getElementById('signupEmail');
  const passwordField = document.getElementById('signupPassword');
  const usernameField = document.getElementById('username');
  const roleField = document.getElementById('role');
  
  const email = emailField.value.trim();
  const password = passwordField.value;
  const username = usernameField.value.trim();
  const role = roleField.value.trim();

  console.log(email, password, username, role);

  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('User signed up:', user);

    // Save user details to Firestore with `uid` as the document ID
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: username,
      role: role,
      createdAt: new Date()
    });
    console.log("User details submitted to Firestore");

    // Show success message
    showAlert('Welcome!', `Welcome ${username || user.email}!`, 'success');

    // Clear the input fields
    emailField.value = "";
    passwordField.value = "";
    usernameField.value = "";
    roleField.value = "";

    // Redirect to signin.html
    setTimeout(() => {
      window.location.href = "signin.html";
    }, 1000);
  } catch (error) {
    console.error('Signup error:', error);

    // Show error message
    showAlert('Error!', error.message, 'error');
  }
}

document.getElementById('signupForm')?.addEventListener('submit', signup);

// Login Function
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    // Sign in user with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Retrieve the user's role from Firestore
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;
      console.log("Role:", role);

      // Redirect based on the user's role
      if (role === "doctor") {
        window.location.href = 'doctor.html';
        showAlert("Success", "Logged in successfully as Doctor!", "success");
      } else if (role === "patient") {
        window.location.href = 'patient.html';
        showAlert("Success", "Logged in successfully as Patient!", "success");
      } else {
        console.error("No role assigned to the user.");
        window.location.href = 'home.html'; // Redirect to home if role is undefined
      }
    } else {
      console.error("No user data found in Firestore.");
      showAlert("Error", "User data not found in Firestore", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Error", error.message, "error");
  }
});

// Google Login Function
document.getElementById('googleLoginButton')?.addEventListener('click', async (event) => {
  const button = event.target;
  button.disabled = true; // Disable the button to prevent multiple clicks

  try {
    // Sign in user with Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log('User logged in with Google:', user);

    // Firestore reference to the user's document
    const userRef = doc(db, "users", user.uid);
    let userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // If user data doesn't exist, create a new user record in Firestore
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: "patient", // Default role for new Google users
        createdAt: new Date()
      });
      console.log("New user data created in Firestore");
      userDoc = await getDoc(userRef); // Re-fetch the user's data after creation
    }

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role;
      console.log("Role:", role);

      // Redirect based on the user's role
      if (role === "doctor") {
        window.location.href = 'doctor.html';
        showAlert("Welcome!", "Logged in successfully as Doctor!", "success");
      } else if (role === "patient") {
        window.location.href = 'patient.html';
        showAlert("Welcome!", "Logged in successfully as Patient!", "success");
      } else {
        console.error("No role assigned to the user.");
        window.location.href = 'home.html'; // Redirect to home if role is undefined
        showAlert("Note", "Logged in, but no role is assigned!", "info");
      }
    } else {
      console.error("User data not found in Firestore.");
      showAlert("Error", "User data not found in Firestore", "error");
    }
  } catch (error) {
    console.error("Google login error:", error);
    showAlert("Error!", error.message, "error");
  } finally {
    button.disabled = false; // Re-enable the button after process
  }
});

// Logout
async function logout() {
  try {
    await signOut(auth);
    console.log("Sign-out successful.");
    // M.toast({ html: "Sign-out successful.", classes: "teal" });

    setTimeout(() => {
      window.location.pathname = './index.html';
    }, 1000);
  } catch (error) {
    console.log(error);
  //   M.toast({ html: error.message, classes: "red" });
  // }
}
}
document.getElementById('logoutButton')?.addEventListener('click', logout);

//select the form
const form = document.getElementById("patient-form");

form?.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Capture form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    appointment_date: form.appointment_date.value,
    department: form.department.value,
    phone: form.phone.value,
    message: form.message.value || "No message provided.",
  };

  try {
    // Save to Firestore
    await addDoc(collection(db, "appointments"), formData);
    alert("Appointment request submitted successfully!");
    form.reset(); // Clear the form
  } catch (error) {
    console.error("Error adding document: ", error);
    alert("Failed to submit appointment. Please try again.");
  }
});

// Get data from Firestore
const container = document.querySelector("#pat-list-row");

document.addEventListener("DOMContentLoaded", async () => {
  // const container = document.querySelectorAll("#patient-list .row");

  // if (!container) {
  //   console.error("The container element #patient-list .row was not found.");
  //   return;
  // }

  try {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    console.log(querySnapshot)

    querySnapshot.forEach((doc) => {
      const appointment = doc.data();
      console.log(appointment)

      const card = document.createElement("div");
      card.classList.add("col-md-4");
      card.innerHTML = `
        <div class="card border-0 shadow-sm">
          <div class="patient-header card-header text-dark">
            <h5 class="mb-0">${appointment.name}</h5>
          </div>
          <div class="card-body p-4">
            <p><strong>Email:</strong> ${appointment.email}</p>
            <p><strong>Date:</strong> ${appointment.appointment_date}</p>
            <p><strong>Department:</strong> ${appointment.department}</p>
            <p><strong>Phone:</strong> ${appointment.phone}</p>
            <p><strong>Message:</strong> ${appointment.message}</p>
            <a href="#" class="pat-btn btn btn-primary btn-sm">View Details</a>
          </div>
        </div>
      `;

      container?.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching documents: ", error);
  }
});


