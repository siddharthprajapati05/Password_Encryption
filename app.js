const express = require('express')
const cookieParser = require("cookie-parser");
const usermodel=require("./models/user")
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const app = express()
const path=require("path");
const port = 3000
app.set("view engine","ejs")

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());



app.get('/', (req, res) => {
    res.render("index");
})
app.post("/create", (req,res)=>{
  let{username,email,password,age}=req.body
  bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
              let createduser=await usermodel.create({
                username,
                email,
                password:hash,
                age,
              })
              let token =jwt.sign({email},"secret");
              res.cookie("token",token)
              res.send(createduser)
        })
  })
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login", async (req,res)=>{
    let user = await usermodel.findOne({email : req.body.email})
    if(!user) return res.send("something went wrong");
    console.log(user.password,req.body.password);
    bcrypt.compare(req.body.password,user.password, function(err,result){
      console.log(result)
      if(result) {
              let token =jwt.sign({email: user.email},"secret");
              res.cookie("token",token)
              res.send("yes you can login")
                }
          else {
            res.send("you cann't login")}
    })
})
app.get("/logout",function(req,res){
    res.cookie("token","")
    res.redirect("/");
})
app.get("/users", async (req, res) => {
  const users = await usermodel.find({});
  res.json(users);
});

app.get("/delete",async (req,res)=>{
  let delet = await usermodel.deleteMany({});
  res.json(delet)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})