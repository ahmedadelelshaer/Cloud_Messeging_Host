import firebase from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import'https://www.gstatic.com/firebasejs/9.6.5/firebase-database-compat.js'; // Add this l

const firebaseConfig = {
    apiKey: "AIzaSyBHHDOeDqWy15PgLi5ZkTs-LMyFAQlieYc",
    authDomain: "task2-3-687fd.firebaseapp.com",
    projectId: "task2-3-687fd",
    storageBucket: "task2-3-687fd.appspot.com",
    messagingSenderId: "883782646802",
    appId: "1:883782646802:web:bc5271320d6f9d1fe9accb",
    measurementId: "G-2QNYZV64FH",
    databaseURL: "https://task2-3-687fd-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Fetch notifications history from Realtime Database
db.ref('messages').orderByChild('message').once('value')
    .then((snapshot) => {
        const tableBody = document.querySelector('#notificationsTable tbody');
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.type}</td>
                <td>${data.topic}</td>
                <td>${data.notification.body}</td>
                <td>${new Date(data.timestamp).toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch((error) => {
        console.error("Error fetching notifications:", error);
    });