import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient, ObjectId } from "mongodb";
import bodyParser from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

const CONTACTS_COLLECTION = "contacts";

// ===== MongoDB =====
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

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
} catch (err) {
  console.error("Ошибка подключения к MongoDB:", err);
  process.exit(1);
}

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
    const contacts = await db.collection(CONTACTS_COLLECTION).find().toArray();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
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
    console.log(result);
    console.log(newContact.name);
    console.log(newContact.email);
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
    const result = await db.collection(CONTACTS_COLLECTION).insertOne(req.body);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// DELETE контакт по id
app.delete("/api/contacts/:id", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const result = await db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectId(req.params.id)});
    if (result.deletedCount === 0) return res.status(404).json({error: "Контакт не найден"});
    res.status(200).json({_id: req.params.id});
  } catch (err) {
    res.status(500).json({error: "Не удалось удалить контакт"});
  }
});

// ===== Angular Frontend =====
const distPath = path.join(__dirname, "../dist/phonebook-app/browser");

app.use(express.static(distPath));

// SPA fallback: все остальные маршруты → index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

import fs from "fs";
console.log("Содержимое dist/phonebook-app/browser:", fs.readdirSync(path.join(__dirname, "../dist/phonebook-app/browser")));

