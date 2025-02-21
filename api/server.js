const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

app.use(express.json());

let usuarios = [
  { id: 1, nome: "Luis", email: "luis.rufino@exemplo.com", cep: "37074010" },
  { id: 2, nome: "Ana", email: "ana.carolina@exemplo.com", cep: "37074010" },
];

app.get("/usuarios", async (req, res) => {
  try {
    for (let usuario of usuarios) {
      if (
        !usuario.logradouro ||
        !usuario.bairro ||
        !usuario.localidade ||
        !usuario.uf
      ) {
        const response = await axios.get(
          `https://viacep.com.br/ws/${usuario.cep}/json/`
        );

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

    const novoId =
      usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
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
    const response = await axios.get(
      `https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`
    );

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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
