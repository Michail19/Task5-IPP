const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const path = require("path");
const ObjectID = mongodb.ObjectID;

const CONTACTS_COLLECTION = "contacts";
const app = express();
app.use(bodyParser.json());

// ===== MongoDB =====
let db;
mongodb.MongoClient.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/test",
  { useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    db = client.db();
    console.log("База данных подключена");

    // стартуем сервер только после подключения к БД
    const server = app.listen(process.env.PORT || 8080, () => {
      console.log("Приложение запущено на порту", server.address().port);
    });
  }
);

// ===== API =====
function handleError(res, reason, message, code) {
  console.error("Ошибка: " + reason);
  res.status(code || 500).json({ error: message });
}

app.get("/api/contacts", (req, res) => {
  db.collection(CONTACTS_COLLECTION).find({}).toArray((err, docs) => {
    if (err) handleError(res, err.message, "Не удалось получить контакты");
    else res.status(200).json(docs);
  });
});

app.post("/api/contacts", (req, res) => {
  const newContact = req.body;
  if (!newContact.name || !newContact.email) {
    handleError(res, "Invalid input", "Имя и email обязательны", 400);
    return;
  }
  db.collection(CONTACTS_COLLECTION).insertOne(newContact, (err, result) => {
    if (err) handleError(res, err.message, "Не удалось создать контакт");
    else res.status(201).json(result.ops[0]);
  });
});

// ... остальные методы (get by id, put, delete) такие же ...

// ===== Angular build =====
const distDir = path.join(__dirname, "..", "dist", "phonebook-app");
app.use(express.static(distDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});
