
// Firebase configuration
var firebaseConfig = {
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
var app = firebase.initializeApp(firebaseConfig);
var messaging = firebase.messaging(app);
const db = firebase.firestore();
const realTimeDB = firebase.database();  // Realtime Database initialization


// Create the collection if it doesn't exist
db.collection('subscriptions').doc('init').set({
    initialized: true,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => {
    console.log("Collection initialized successfully");
})
.catch((error) => {
    console.error("Error initializing collection:", error);
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up button interactions
    document.getElementById('subscribeBtn').addEventListener('click', function() {
        var topic = prompt('Enter topic to subscribe:');
        if (topic) {
            subscribeToTopic(topic);
        }
    });

    document.getElementById('unsubscribeBtn').addEventListener('click', function() {
        var topic = prompt('Enter topic to unsubscribe:');
        if (topic) {
            unsubscribeFromTopic(topic);
        }
    });
});

// Handle subscription to a topic
function subscribeToTopic(topic) {
    
    
    // Add message data to Firestore
    db.collection('subscriptions').add({
        type: 'subscription',
        subscribeToTopic: topic,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Subscription saved with ID: ", docRef.id);
        document.getElementById('status').innerText = `Subscribed to ${topic}`;
    })
    .catch((error) => {
        console.error("Error saving subscription: ", error);
    });
    realTimeDB.ref('subscriptions/' + topic).set({
        status: 'subscribed',
        timestamp: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
        console.log(`Successfully wrote to Realtime Database for topic: ${topic}`);
    })
    console.log(`Subscribing to topic: ${topic}`);
    document.getElementById('status').innerText = `Subscribed to ${topic}`;
    new Notification("Subscription Success", {
        body: `Successfully subscribed to topic: ${topic}`,
      
    });
}

// Handle unsubscription from a topic
function unsubscribeFromTopic(topic) {
    console.log(`Unsubscribing from topic: ${topic}`);
    document.getElementById('status').innerText = `Unsubscribed from ${topic}`;
    realTimeDB.ref('subscriptions/' + topic).remove()
    .then(() => {
        console.log("Successfully unsubscribed from db topic:", topic);
    }
    )
    .catch((error) => {
        console.error("Error removing subscription:", error);
    });
    new Notification("Unsubscription Success", {
        body: `Successfully unsubscribed from topic: ${topic}`,
    });
}

// Request Notification Permission
Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Get FCM token
        messaging.getToken({ vapidKey: 'BObWCDQgII2xtVDG_3V0ebN3XJqB3h7PPAySu5yIgljh96yGLtTjWhzBW1hIHBowQzmplcjeI47M1VQNf7mRf5Y' }).then(function(token) {
            if (token) {
                console.log('FCM Token:', token);
            } else {
                console.log('No registration token available.');
            }
        }).catch(function(error) {
            console.error('Error retrieving token:', error);
        });
    } else {
        console.error('Notification permission denied.');
    }
});

// Listen for FCM messages when the app is in the foreground
messaging.onMessage(function(payload) {
    console.log('Message received in foreground:', payload);
    console.log(payload.data);

   
    // Check if this is a subscription message
    if (payload.data && payload.data.subscribeToTopic) {
        handleSubscription(payload);
    }
    // Check if this is an unsubscription message
    else if (payload.data && payload.data.unsubscribeFromTopic) {
        console.log('Unsubscribing from topic:', payload.data.unsubscribeFromTopic);
        handleUnsubscription(payload);
    }
    // realTimeDB.ref('subscriptions/' + payload).set({
    //     status: 'subscribed',   
    //     timestamp: firebase.database.ServerValue.TIMESTAMP  
    // })
    new Notification(payload.notification.title, {
        body: payload.notification.body,
    });
});

function handleSubscription(payload) {
    const topic = payload.data.subscribeToTopic;
    realTimeDB.ref('foreground messages/'+ topic).push({
        type: 'Message received in foreground:',        
        messageId: payload.messageId,
        data: payload.data.subscribeToTopic,
        subscribeToTopic: topic,
        from: payload.from,
        collapseKey: payload.collapseKey,
        messageId: payload.messageId,
    })
    .then(() => {
        console.log("Subscription saved in db with ID: ", topic);
        document.getElementById('status').innerText = `Subscribed to ${topic}`;
    }
    )
    .catch((error) => {
        console.error("Error saving subscription: ", error);
    }
    )
    // Add message data to Firestore
    db.collection('subscriptions').add({
        type: 'subscription',
        subscribeToTopic: topic,
        from: payload.from,
        collapseKey: payload.collapseKey,
        messageId: payload.messageId,
    })
    .then((docRef) => {
        console.log("Subscription saved with ID: ", docRef.id);
        document.getElementById('status').innerText = `Subscribed to '${topic}`;
    })
    .catch((error) => {
        console.error("Error saving subscription: ", error);
    });
}

function handleUnsubscription(payload) {
    const topic = payload.data.unsubscribeFromTopic;
    
    console.log(`Unsubscribing from topic: ${topic}`);
    realTimeDB.ref('foreground messages/' + topic).remove()
    .then(() => {
        console.log("Successfully unsubscribed from db topic:", topic);
    })
    .catch((error) => {
        console.error("Error removing subscription:", error);
    }
    )
    // Add message data to Firestore
    db.collection('subscriptions').add({
        type: 'unsubscription',
        unsubscribeToTopic: topic,
        from: payload.from,
        collapseKey: payload.collapseKey,
        messageId: payload.messageId,
        notification: payload.notification,
        data: payload.data,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Unsubscription saved with ID: ", docRef.id);
        document.getElementById('status').innerText = `Unsubscribed from ${topic}`;
    })
    .catch((error) => {
        console.error("Error saving unsubscription: ", error);
    });
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
            console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
            console.error('Service Worker registration failed:', error);
        });
}