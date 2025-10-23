import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "recipehub",
  password: "khushie",
  port: 5432,
});
db.connect();


const __filename=fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//home page
app.get("/",(req,res)=>{
    res.render("index.ejs");
});

//search route
app.post("/search", async (req,res)=>{
    const searchQuery= req.body.searchRecipe?.toLowerCase()|| "";

    const result= await db.query(
        "SELECT * FROM recipes WHERE LOWER(name) LIKE $1 OR LOWER(cuisine) LIKE $1 OR LOWER(ingredients) LIKE $1",
        [`%${searchQuery}%`]
    );

    res.render("searchResults",{recipes:result.rows, query: searchQuery});
});

//recipe route
app.get("/recipe/:id",async (req,res)=>{
    const recipeId=req.params.id;
    const result= await db.query("SELECT * FROM recipes WHERE id= $1",[recipeId]);

    if(result.rows.length===0){
        return res.status(404).send("Recipe not found.");
    }

    const recipe= result.rows[0];
    res.render("recipe",{recipe});
});

app.get("/cake",(req,res)=>{
    res.render("cake.ejs");
});

app.get("/japanese",(req,res)=>{
    res.render("japanese.ejs");
});

app.get("/italian",(req,res)=>{
    res.render("italian.ejs");
});

app.get("/diet",(req,res)=>{
    res.render("diet.ejs");
});

app.get("/contact", (req, res) => {
  const contactInfo = {
    phone: "+91 1234567890",
    email: "support@recipehub.com",
    address: "123, Food Street, Nashik, India"
  };
  res.render("contact", { contactInfo });
});

app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await db.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );
    res.render("message-success", { senderName: name || "Friend" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).send("Oops! Something went wrong.");
  }
});



app.listen(port,()=>{
    console.log(`Listening on port http://localhost:${port}/`);
});
