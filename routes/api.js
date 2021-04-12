const router = require("express").Router();
const Transaction = require("../models/transaction.js");

router.post("/api/transaction", ({ body }, res) => {
  Transaction.create(body)
    .then(dbTransaction => {
      console.log(dbTransaction);
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.post("/api/transaction/bulk", ({ body }, res) => {
  Transaction.insertMany(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.get("/api/transaction", (req, res) => {
  Transaction.find({})
    .sort({ date: -1 })
    .then(dbTransaction => {
      console.log(JSON.stringify(dbTransaction));
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

router.post("/api/callbacks/:credentialMappingId", (req, res) => {
  console.log("--------req.body-----------------\n", JSON.stringify(req.body));
  console.log("--------req.query----------------\n", JSON.stringify(req.query));
  console.log("--------req.params---------------\n", JSON.stringify(req.params));
  console.log("--------request finished----------");
  res.status(200).json();
});

module.exports = router;
