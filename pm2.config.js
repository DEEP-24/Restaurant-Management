module.exports = {
  apps: [
    {
      name: "my-remix-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
