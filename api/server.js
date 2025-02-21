const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3000;

// Importação dos arquivos
const routes = require("./router");
const midlewareWebToken = require("./midlewareToken");
const { login } = require("./login");

// Lista de usuários simulada
let usuarios = [
  { id: 1, nome: "Luis Filipe", email: "luis.rufino@exemplo.com", cep: "37074010" },
  { id: 2, nome: "Ana", email: "ana.carolina@exemplo.com", cep: "37074010" },
];

//  Configuração de middlewares
app.use(express.json());
app.use(cors({
  origin: "*",
  allowedHeaders: ["Authorization", "Content-Type"],
}));

//  Middleware para debugging (remova se não precisar)
app.use((req, res, next) => {
  console.log("Headers recebidos:", req.headers);
  console.log("Authorization:", req.headers.authorization); // Exibir apenas o header Authorization
  next();
});

//  Rota de login (corrigida e mantida antes das outras)
app.post("/usuarios/login", login);

//  Rotas protegidas com middleware de autenticação
app.use("/usuarios", midlewareWebToken, routes);

//  Rota para listar usuários (corrigida)
app.get("/usuarios", midlewareWebToken, async (req, res) => {
  try {
    for (let usuario of usuarios) {
      if (!usuario.logradouro || !usuario.bairro || !usuario.localidade || !usuario.uf) {
        const response = await axios.get(`https://viacep.com.br/ws/${usuario.cep}/json/`);
        if (!response.data.erro) {
          usuario.logradouro = response.data.logradouro;
          usuario.bairro = response.data.bairro;
          usuario.localidade = response.data.localidade;
          usuario.uf = response.data.uf;
        }
      }
    }
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar os endereços" });
  }
});

//  Rota para criar um novo usuário
app.post("/usuarios", async (req, res) => {
  const { nome, email, cep } = req.body;

  if (!nome || !email || !cep) {
    return res.status(400).json({ erro: "Nome, email e CEP são obrigatórios" });
  }

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (response.data.erro) {
      return res.status(400).json({ erro: "CEP inválido" });
    }

    const { logradouro, bairro, localidade, uf } = response.data;

    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
    const novoUsuario = {
      id: novoId,
      nome,
      email,
      cep,
      logradouro,
      bairro,
      localidade,
      uf,
    };

    usuarios.push(novoUsuario);
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o endereço do CEP" });
  }
});

//  Rota para atualizar um usuário
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, cep } = req.body;

  const usuario = usuarios.find((u) => u.id === parseInt(id));
  if (!usuario) {
    return res.status(404).json({ erro: "Usuário não encontrado" });
  }

  if (!nome || !email || !cep) {
    return res.status(400).json({ erro: "Nome, email e CEP são obrigatórios" });
  }

  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);

    if (response.data.erro) {
      return res.status(400).json({ erro: "CEP inválido ou não encontrado" });
    }

    const { logradouro, bairro, localidade, uf } = response.data;

    usuario.nome = nome;
    usuario.email = email;
    usuario.cep = cep;
    usuario.logradouro = logradouro;
    usuario.bairro = bairro;
    usuario.localidade = localidade;
    usuario.uf = uf;

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar o endereço do CEP" });
  }
});

//  Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
