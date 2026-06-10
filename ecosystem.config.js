module.exports = {
  apps: [
    {
      name: "rb-rubydev",
      script: ".next/standalone/server.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "127.0.0.1",
        NEXT_PUBLIC_SITE_URL: "https://rb-rubydev.fr",
        NEXT_PUBLIC_CONTACT_EMAIL: "contact@rb-rubydev.fr",
        SCORES_DB_PATH: "/var/www/rb-rubydev/data/scores.db",
      },
    },
  ],
};
