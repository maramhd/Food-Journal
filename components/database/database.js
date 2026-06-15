import * as SQLite from "expo-sqlite";

// فتح قاعدة البيانات

const database = SQLite.openDatabaseSync("foodJournal.db");

// =========================
// إنشاء الجداول
// =========================

export const initDatabase = async () => {
  try {
    // =========================
    // USERS TABLE
    // =========================

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        username TEXT
      );
    `);

    // =========================
    // JOURNALS TABLE
    // =========================

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS journals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        image TEXT,

        description TEXT,

        category TEXT,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("تم تهيئة قاعدة البيانات بنجاح");
  } catch (error) {
    console.log("Database Init Error:", error);
  }
};

// =========================
// تنفيذ SQL
// =========================

export const executeSql = async (query, params = []) => {
  try {
    // SELECT

    if (query.trim().toUpperCase().startsWith("SELECT")) {
      const result = await database.getAllAsync(query, params);

      return result;
    }

    // INSERT / UPDATE / DELETE

    const result = await database.runAsync(query, params);

    return result;
  } catch (error) {
    console.log("SQL Error:", error);

    throw error;
  }
};

export default database;
