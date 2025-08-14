import {Pool} from 'pg';

// Conexão com database servidor postgresSQL
const poolConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'saecomp',
  ssl: false,
  max: 6
};

// Gerencia a "piscina de conexões" do banco de dados
//  - Reutiliza conexões
//  - Gerencia concorrência
//  - Facilita consultas usando querys (permitindo executar comandos SQL)
const pool = new Pool(poolConfig);


export default pool;