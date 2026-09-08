import express from "express"
import {Client} from "pg"


//app client
const app = express()
app.use(express.json())

// express client
const client = new Client({
  user: 'postgres',
  password: 'password',
  host: 'localhost',
  port: 5432,
  database: 'mydb'
});

(async function () {
    try {
        await client.connect();

        const res = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public';
        `);

        console.log(res.rows);
    } catch (err) {
        console.error(err);
    }
})();






app.listen(3000 , ()=>{
    console.log("server started running")
})
