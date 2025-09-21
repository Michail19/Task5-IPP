const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const ObjectID = mongodb.ObjectID;

const CONTACTS_COLLECTION = "contacts";

const app = express();
app.use(bodyParser.json());

// Переменная для базы данных
let db;

// Подключение к MongoDB
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  db = client.db();
  console.log("База данных подключена");

  // Запуск сервера после подключения к БД
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log("Приложение запущено на порту", port);
  });
});

// Общий обработчик ошибок
function handleError(res, reason, message, code) {
  console.error("Ошибка: " + reason);
  res.status(code || 500).json({ "error": message });
}

// GET все контакты
app.get("/api/contacts", (req, res) => {
  db.collection(CONTACTS_COLLECTION).find({}).toArray((err, docs) => {
    if (err) {
      handleError(res, err.message, "Не удалось получить контакты");
    } else {
      res.status(200).json(docs);
    }
  });
});

// POST новый контакт
app.post("/api/contacts", (req, res) => {
  const newContact = req.body;
  if (!newContact.name || !newContact.email) {
    handleError(res, "Invalid input", "Имя и email обязательны", 400);
    return;
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, (err, result) => {
    if (err) {
      handleError(res, err.message, "Не удалось создать контакт");
    } else {
      res.status(201).json(result.ops[0]);
    }
  });
});

// GET контакт по id
app.get("/api/contacts/:id", (req, res) => {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, (err, doc) => {
    if (err) {
      handleError(res, err.message, "Не удалось получить контакт");
    } else {
      res.status(200).json(doc);
    }
  });
});

// PUT обновление контакта по id
app.put("/api/contacts/:id", (req, res) => {
  const updateDoc = req.body;
  delete updateDoc._id; // нельзя обновлять _id

  db.collection(CONTACTS_COLLECTION).updateOne(
    { _id: new ObjectID(req.params.id) },
    { $set: updateDoc },
    (err, result) => {
      if (err) {
        handleError(res, err.message, "Не удалось обновить контакт");
      } else {
        res.status(200).json(updateDoc);
      }
    }
  );
});

// DELETE контакт по id
app.delete("/api/contacts/:id", (req, res) => {
  db.collection(CONTACTS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
    if (err) {
      handleError(res, err.message, "Не удалось удалить контакт");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});
