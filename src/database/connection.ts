import {Pool} from 'pg';

// Vem dom servidor postgresSQL
const poolConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
    ssl: false,
    max: 6
}

// Gerencia a "piscina de conexões" do banco de dados
//  - Reutiliza conexões
//  - Gerencia concorrência
//  - Facilita consultas usando querys (permitindo executar comandos SQL)
const pool = new Pool(poolConfig);


export default pool;