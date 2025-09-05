const env = process.env;

module.exports = {
    port: env.PORT,
    secret: env.SECRET,
    frontend_server: env.FRONTEND_SERVER,
    db_url: env.DB_URL,
    db_name: env.DB_NAME,
    db_user: env.DB_USER,
    db_password: env.DB_PASSWORD,
    frontend_base_url: env.FRONTEND_BASE_URL,
};
