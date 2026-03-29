const admin = require("firebase-admin");
const serviceAccount = require("../healthsync-5cfb1-firebase-adminsdk-fbsvc-9b77f5c8e3"); // your downloaded file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;