/** @type {import('@sveltejs/kit').Config} */
const dbConfig = {
    user: 'cl_blog',
    password: '221027',
    connectString: "localhost:1521/xe",
    externalAuth: process.env.NODE_ORACLEDB_EXTERNALAUTH || false,
    poolMin: 1,
    poolMax: 10,
    poolTimeout: 300,
    timezone: "+09:00"
}

export default dbConfig