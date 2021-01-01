class Idb {
    constructor() {
        this.db = null;
    }
    async init(config) {
        this.config = config;
        const { dbname, version, tableName, id } = config;
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
                    console.log('onupgradeneeded');
                    this.db = event.target.result;
                    this.db.createObjectStore(tableName, { keyPath: id }).createIndex(id, id, { unique: true })
                }
            })
        }
        try {
            await makeDb();
        } catch (err) {
            console.error(err);
        }
    }
    addData(data) {
        const name = this.config.tableName;
        const request = this.db.transaction([name], 'readwrite').objectStore(name).add(data)
        return new Promise((resolve, reject) => {
            request.onerror = event => {
                reject(event)
            }
            request.onsuccess = event => {
                resolve(data.id)
            }
        })
    }
    changeData(id, data) {
        const name = this.config.tableName;
        return new Promise((resolve, reject) => {
            const request = this.db.transaction(name, 'readwrite').objectStore(name).get(id);
            request.onerror = event => reject(event);
            request.onsuccess = event => {
                const putdata = Object.assign(event.target.result, data);
                const uploadRequest = db.transaction([name], 'readwrite').objectStore(name).put(putdata);
                uploadRequest.onerror = event => reject(event);
                uploadRequest.onsuccess = event => resolve(event.target.result);
            }
        })
    }
    deleteData(id) {
        const name = this.config.tableName;
        return new Promise((resolve, reject) => {
            let request = db.transaction(name, 'readwrite').objectStore(name).delete(id);
            request.onsuccess = event => {
                resolve(event)
            }
            request.onerror = event => {
                reject(event)
            }
        })
    }
    getAll() {
        const name = this.config.tableName;
        let result = [];
        let objectStore = this.db.transaction(name).objectStore(name);
        return new Promise((resolve, reject) => {
            objectStore.openCursor().onsuccess = event => {
                let data = event.target.result;
                if (data) {
                    result.push(data.value);
                    data.continue();
                } else {
                    resolve(result);
                }
            }
            objectStore.openCursor().onerror = event => {
                reject(event)
            }
        })
    }
}

