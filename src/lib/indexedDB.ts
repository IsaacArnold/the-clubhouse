import { openDB } from 'idb';

const DB_NAME = 'AppStateDB';
const STORE_NAME = 'AppState';

// Initialize the database
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

// Save data to IndexedDB
export const saveToDB = async (key: string, value: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, value, key);
};

// Get data from IndexedDB
export const getFromDB = async (key: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, key);
};

// Delete data from IndexedDB
export const deleteFromDB = async (key: string) => {
  const db = await initDB();
  await db.delete(STORE_NAME, key);
};
