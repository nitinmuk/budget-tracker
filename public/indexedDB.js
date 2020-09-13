const pendingTransactions = [];
/**
 * opens indexed DB connection and persist the pending transaction data
 * which is pending because of lack of network
 * @param {data which need to be persisted in indexed db} transaction
 */
const saveRecord = transaction => {
  const request = window.indexedDB.open("budgetTransactions", 1);
  request.onupgradeneeded = ({ target }) => {
    target.result.createObjectStore("budgetTransactions", {
      keyPath: "id",
      autoIncrement: true
    });
  };
  request.onsuccess = () => {
    const db = request.result;
    const dbTransaction = db.transaction(["budgetTransactions"], "readwrite");
    const transactionListStore = dbTransaction.objectStore(
      "budgetTransactions"
    );
    transactionListStore.add(transaction);
    dbTransaction.onerror = event =>
      console.error(`Error ocurred opening transaction. event : ${event}`);
  };
  request.onerror = event =>
    console.error(`Error ocurred opening database. event : ${event}`);
};
const processPendingTransactions = () => {
  const request = indexedDB.open("budgetTransactions", 1);
  request.onupgradeneeded = ({ target }) => {
    target.result.createObjectStore("budgetTransactions", {
      keyPath: "id",
      autoIncrement: true
    });
  };
  request.onsuccess = () => {
    const db = request.result;
    const dbTransaction = db.transaction(["budgetTransactions"], "readwrite");
    const transactionListStore = dbTransaction.objectStore(
      "budgetTransactions"
    );
    // Opens a Cursor request and iterates over the documents.
    const getCursorRequest = transactionListStore.openCursor();
    getCursorRequest.onsuccess = e => {
      const cursor = e.target.result;
      if (cursor) {
        pendingTransactions.push(cursor.value);
        cursor.continue();
      } else {
        postPendingTransactions();
      }
    };
  };
};
/**
 * opens a connection to indexed DB and call /api/transaction/bulk
 * to persist all those transactions which are currently pending.
 */
const postPendingTransactions = () => {
  if (pendingTransactions && pendingTransactions.length) {
    fetch("/api/transaction/bulk", {
      method: "POST",
      body: JSON.stringify(pendingTransactions),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        clearPendingTransactions();
      })
      .catch(error => console.log(error));
  }
};

/**
 * opens indexed db connection and clear the budgetTransactions storage
 */
const clearPendingTransactions = () => {
  const request = indexedDB.open("budgetTransactions", 1);
  request.onsuccess = () => {
    const db = request.result;
    const dbTransaction = db.transaction(["budgetTransactions"], "readwrite");
    const transactionListStore = dbTransaction.objectStore(
      "budgetTransactions"
    );
    transactionListStore.clear();
  };
};

module.exports = { saveRecord, processPendingTransactions };
