module.exports = {
    proxy: "http://localhost:3000",
    files: ["public/**/*.{html,css,js}", "src/**/*.js"],
    port: 3001,
    notify: false,
    ui: false,
    open: false,
    ignore: ["node_modules", "docker-compose.yml", "Dockerfile"]
};
