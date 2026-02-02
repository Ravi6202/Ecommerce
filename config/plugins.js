module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "ravikumar11@wattmonk.com",
        defaultReplyTo: "happysingh1@wattmonk.com",
      },
    },
  },

  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
    },
  },
  // ...
});
