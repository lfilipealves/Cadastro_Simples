const express = require("express")
const midlewareWebToken = require("./midlewareToken")
const { login } = require("./login")

const router = express.Router();


router.get("/", midlewareWebToken, async (req, res ) => {
    res.json({mensagem: "Usuários carregados com sucesso!"});
});

router.post("/usuarios", midlewareWebToken, async (req, res ) => {
    res.json({mensagem: "Usuário cadastrado com sucesso!"});
});

module.exports = router;
