const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/expenseTracker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

.then(()=> console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB connection error: ", err));

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: Number, required: true }, 
  date: { type: String, required: true }
});

const Item = mongoose.model("Item", itemSchema);


app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);   
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/items", async (req, res) => {
  console.log("Incoming item:", req.body); 
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error saving item:", err); 
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/items/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted", item: deletedItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/items", async (req, res) => {
  try {
    await Item.deleteMany({});
    res.json({ message: "All items cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

