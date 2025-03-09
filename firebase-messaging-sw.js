
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.6.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.5/firebase-messaging-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.5/firebase-firestore-compat.js'); // Add this l
importScripts('https://www.gstatic.com/firebasejs/9.6.5/firebase-database-compat.js'); // Add this l

firebase.initializeApp({
    apiKey: "AIzaSyBHHDOeDqWy15PgLi5ZkTs-LMyFAQlieYc",
    authDomain: "task2-3-687fd.firebaseapp.com",
    projectId: "task2-3-687fd",
    storageBucket: "task2-3-687fd.firebasestorage.app",
    messagingSenderId: "883782646802",
    appId: "1:883782646802:web:bc5271320d6f9d1fe9accb",
    measurementId: "G-2QNYZV64FH",
    databaseURL: "https://task2-3-687fd-default-rtdb.firebaseio.com/"

});

const messaging = firebase.messaging();
const db = firebase.firestore();
const realTimeDB = firebase.database();  // Realtime Database initialization
messaging.onBackgroundMessage((payload) => {
    if (payload.data && payload.data.subscribeToTopic) {
    console.log('Received background message:', payload);
    const topic = payload.data.subscribeToTopic;
        
        // Add message data to Firestore
        // db.collection('messages').add({
        //     type: 'subscription',
        //     subscribeToTopic: topic,
        // })
        // .then((docRef) => {
        //     console.log("Subscription saved with ID: ", docRef.id);
        //     document.getElementById('status').innerText = `Subscribed to ${topic}`;
        // })
        // .catch((error) => {
        //     console.error("Error saving subscription: ", error);
        // });

        realTimeDB.ref('background messages/'+topic).push({
            type: 'Message received in background:',        
            messageId: payload.messageId,
            data: topic,
            subscribeToTopic: topic,
            from: payload.from,
            collapseKey: payload.collapseKey,
            messageId: payload.messageId,
           
        })
        .then(() => {
            console.log("Subscription saved with ID: ", topic);
            document.getElementById('status').innerText = `Subscribed to ${topic}`;
        })
        .catch((error) => {
            console.error("Error saving subscription: ", error);
        });

    }
    else if (payload.data && payload.data.unsubscribeToTopic) {
        const topic = payload.data.unsubscribeToTopic;
        console.log('Received background message:', payload);
        // Remove subscription from Firestore
        // db.collection('messages')
        //     .where('data.subscribeToTopic', '==', topic)
        //     .get()
        //     .then((querySnapshot) => {
        //         querySnapshot.forEach((doc) => {
        //             doc.ref.delete()
        //                 .then(() => {
        //                     console.log("Successfully unsubscribed from topic:", topic);
        //                 })
        //                 .catch((error) => {
        //                     console.error("Error removing subscription:", error);
        //                 });
        //         });
        //     })

        //     .catch((error) => {
        //         console.error("Error querying subscriptions:", error);
        //     });

        realTimeDB.ref('background messages/' + topic).remove()
        .then(() => {
            console.log("Successfully unsubscribed from db topic:", topic);
        })
        
        // realTimeDB.ref('background messages').orderByChild('subscribeToTopic').equalTo(topic).once('value', (snapshot) => {
        //     snapshot.forEach((childSnapshot) => {
        //         childSnapshot.ref.remove()
        //             .then(() => {
        //                 console.log("Successfully unsubscribed from topic:", topic);
        //             })
        //             .catch((error) => {
        //                 console.error("Error removing subscription:", error);
        //             });
        //     });
        // });
            // realTimeDB.ref('messages').where('data.subscribeToTopic', '==', topic)
            // .get().then((querySnapshot) => {
            //     querySnapshot.forEach((doc) => {
            //         doc.ref.delete()
            //             .then(() => {
            //                 console.log("Successfully unsubscribed from topic:", topic);
            //             })
            //             .catch((error) => {
            //                 console.error("Error removing subscription:", error);
            //             });
            //     });
            // })
    }

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,    
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});