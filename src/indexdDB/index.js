class Idb {
    async init(config) {
        this.config = config;
        const { dbname, version, tables } = config;
        const makeDb = () => {
            return new Promise((resolve, reject) => {
                const openDb = window.indexedDB.open(dbname, version);
                openDb.onerror = event => {
                    reject(event);
                }
                openDb.onsuccess = event => {
                    this.db = event.target.result;
                    resolve(event.target.result);
                }
                openDb.onupgradeneeded = event => {
                    this.db = event.target.result;
                    tables.forEach((table) => {
                        const { name, keyPath, keys } = table;
                        console.log('keys', keys);
                        const tableStore = this.db.createObjectStore(name, { keyPath })
                        keys.forEach((key) => {
                            tableStore.createIndex(key.id, key.id, key.config);
                        })
                    })
                }
            })
        }
        try {
            await makeDb();
        } catch (err) {
            console.error(err);
        }
    }
    addData(tableName, data) {
        const request = this.db.transaction([tableName], 'readwrite').objectStore(tableName).add(data)
        return new Promise((resolve, reject) => {
            request.onerror = event => {
                reject(event)
            }
            request.onsuccess = event => {
                resolve(data.id)
            }
        })
    }
    changeData(tableName, id, data) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(tableName, 'readwrite').objectStore(tableName).get(id);
            request.onerror = event => reject(event);
            request.onsuccess = event => {
                const putdata = Object.assign(event.target.result, data);
                const uploadRequest = db.transaction([tableName], 'readwrite').objectStore(tableName).put(putdata);
                uploadRequest.onerror = event => reject(event);
                uploadRequest.onsuccess = event => resolve(event.target.result);
            }
        })
    }
    deleteData(tableName, id) {
        return new Promise((resolve, reject) => {
            let request = this.db.transaction(tableName, 'readwrite').objectStore(tableName).delete(id);
            request.onsuccess = event => {
                resolve(event)
            }
            request.onerror = event => {
                reject(event)
            }
        })
    }
    findByfield(tableName, key) {
        const index = this.db.transaction(tableName).objectStore(tableName).index(key);
        let result = [];
        return new Promise((reslove, reject) => {
            const readAll = index.openCursor()
            readAll.onsuccess = event => {
                const data = event.target.result;
                if (data) {
                    result.push(data.value);
                    data.continue();
                } else {
                    reslove(result);
                }
            }
            readAll.onerror = event => {
                reject(event);
            }
        })

    }
    getAll(tableName) {
        let result = [];
        let objectStore = this.db.transaction(tableName).objectStore(tableName);
        return new Promise((resolve, reject) => {
            const all = objectStore.openCursor()
            all.onsuccess = event => {
                let data = event.target.result;
                if (data) {
                    result.push(data.value);
                    data.continue();
                } else {
                    resolve(result);
                }
            }
            all.onerror = event => {
                reject(event)
            }
        })
    }
}

