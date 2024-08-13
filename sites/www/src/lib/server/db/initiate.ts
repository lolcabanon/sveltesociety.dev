import { Database as DuckDB } from "duckdb-async";
import Database from 'better-sqlite3';
import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

const TRIGGERS_FOLDER = './src/lib/server/db/triggers'
const VIEWS_FOLDER = './src/lib/server/db/views'

export const db = new Database(process.env.DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export const event_db = await DuckDB.create(process.env.EVENT_DB_PATH)

const initiate_db = async () => {
    console.log('Initiating database...')

    // Read schema.sql file, should probably split this up into multiple files eventually
    const schema = fs.readFileSync('./src/lib/server/db/schema/schema.sql', 'utf8')
    db.exec(schema)

    // Read triggers and insert them into the database
    const triggers = fs.readdir(TRIGGERS_FOLDER, (e, files) => {
        files.forEach(file => {
            const filePath = path.join(TRIGGERS_FOLDER, file);
            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                db.exec(content)
            });
        });
    })

    // Read views and insert them into the database
    const views = fs.readdir(VIEWS_FOLDER, (e, files) => {
        files.forEach(file => {
            const filePath = path.join(VIEWS_FOLDER, file);
            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                db.exec(content)
            });
        });
    })
}

const initiate_events_db = async () => {
    console.log('Initiating events database...')
    const schema = fs.readFileSync('./src/lib/server/event_db/schema/schema.sql', 'utf8')
    event_db.exec(schema)
}

initiate_db()
initiate_events_db()