require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// Config JSON response
app.use(express.json());
app.use(cors());

// Models
const User = require("./Models/User");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado!" });
  }

  try {

    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Token Inválido!' });
  }

}

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {

  const id = req.params.id;

  const user = await User.findById(id, '-password');

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado!" });
  }

  res.status(200).json({ user })
});

// Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // validations
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password !== confirmPassword) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(422).json({ msg: "Email já existe!" });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Aconteceu um erro no servidor!" });
  }
});

// Login User
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida!" });
  }

  try {

    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );

    user.password = undefined;

    res.status(200).json({ msg: 'Autenticação realizada com sucesso!', token, user });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Aconteceu um erro no servidor!" });
  }
})

const questionRoutes = require("./routes/questionRoutes");

app.use("/question", checkToken, questionRoutes);

// Credencials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@api-rest-cluster.4o5ps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou ao banco!");
  })
  .catch((err) => console.log(err));
