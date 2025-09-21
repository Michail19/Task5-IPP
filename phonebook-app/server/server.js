const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const CONTACTS_COLLECTION = "contacts";

// ===== MongoDB =====
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function startServer() {
  console.log("URI:", process.env.MONGODB_URI); // проверь вывод

  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      tls: true,
      tlsAllowInvalidCertificates: true
    });

    await client.connect();
    const db = client.db("Cluster0"); // или имя базы
    console.log("База данных подключена")

    app.locals.db = db;

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log("Приложение запущено на порту", PORT));
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

startServer();

// ===== API =====

// GET все контакты
app.get("/api/contacts", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const docs = await db.collection(CONTACTS_COLLECTION).find({}).toArray();
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({ error: "Не удалось получить контакты" });
  }
});

// GET контакт по id
app.get("/api/contacts/:id", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const doc = await db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Контакт не найден" });
    res.status(200).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Не удалось получить контакт" });
  }
});

// POST новый контакт
app.post("/api/contacts", async (req, res) => {
  const db = req.app.locals.db;
  const newContact = req.body;

  if (!newContact.name || !newContact.email) {
    return res.status(400).json({ error: "Имя и email обязательны" });
  }

  try {
    const result = await db.collection(CONTACTS_COLLECTION).insertOne(newContact);
    newContact._id = result.insertedId;
    res.status(201).json(newContact);
  } catch (err) {
    res.status(500).json({ error: "Не удалось создать контакт" });
  }
});

// PUT обновление контакта по id
app.put("/api/contacts/:id", async (req, res) => {
  const db = req.app.locals.db;
  const updateDoc = req.body;
  delete updateDoc._id;

  try {
    const result = await db.collection(CONTACTS_COLLECTION).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateDoc }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Контакт не найден" });
    res.status(200).json({ _id: req.params.id, ...updateDoc });
  } catch (err) {
    res.status(500).json({ error: "Не удалось обновить контакт" });
  }
});

// DELETE контакт по id
app.delete("/api/contacts/:id", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.collection(CONTACTS_COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Контакт не найден" });
    res.status(200).json({ _id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Не удалось удалить контакт" });
  }
});

// ===== Angular build =====
const distDir = path.join(__dirname, "..", "dist", "phonebook-app");
app.use(express.static(distDir));

// Правильный способ обработки всех маршрутов для Angular
app.get((req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});
