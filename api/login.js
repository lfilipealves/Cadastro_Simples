const jwt = require("jsonwebtoken");

const login = (req, res) => {
    const usuario = {id: 1, nome: "Luis Filipe", email: "luis.rufino@exemplo.com"};

    const secretKey = process.env.JWT_SECRET || "seuSegredoSeguro";
    const token = jwt.sign(usuario, secretKey, { expiresIn: "1h"});

    res.json({token});

};

module.exports = {login};