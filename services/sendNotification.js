const admin = require("./firebase");

const sendNotification = async (token, title, body) => {
  if (!token) return;

  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
  };

  try {
    await admin.messaging().send(message);
    console.log("✅ Notification sent");
  } catch (error) {
    console.log("❌ Error sending notification:", error);
  }
};

module.exports = sendNotification;