import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

export const dbConn = async () => {
    config({path : './enviroments.env'});
    const _url = process.env.DB_URL;
    
    const conn = new MongoClient(_url, { useNewUrlParser: true, useUnifiedTopology: true });
    const client = await conn.connect();
    return client.db('vendas').collection('usuarios');
};
