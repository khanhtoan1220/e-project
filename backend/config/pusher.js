const Pusher = require("pusher");
require("dotenv").config();

const pusherClient = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

module.exports = {
  trigger: async (...args) => {
    try {
      await pusherClient.trigger(...args);
    } catch (error) {
      console.error("Pusher trigger failed:", error.message);
    }
  },
};
