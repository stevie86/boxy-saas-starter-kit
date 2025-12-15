module.exports = {
  apps: [
    {
      name: "hostelpulse",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
