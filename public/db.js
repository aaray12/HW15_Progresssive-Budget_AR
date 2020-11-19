const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

let db;
// create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  // create object store called "pending" and set autoIncrement to true
  db.createObjectStore("pending", {
    autoIncrement:true 
  });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pending = transaction.objectStore("pending");

  // add record to your store with add method.
  pending.add(record)
}

function checkDatabase() {
  
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const store = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = store.getAll();

  console.log("getAll", getAll)
  // getAll.onerror(err)
  getAll.onsuccess = function () {
    // console.log("another test")
    if (getAll.result.length >= 0) {
      // console.log("test 2")
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) =>
        
         response.json()
         )
        .then(() => {
          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear()
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
