const jwt = require('jsonwebtoken');

const midlewareWebToken = (req, res, next) => {
    
    console.log("Headers recebidos:", req.headers);

    const token = req.headers['authorization']
    
    console.log("Token recebido:", token);



    if(!token) {
        return res.status(401).json({erro: "Acesso negado. Token não fornecido"})

    }

    try {
        const secretKey = process.env.JWT_SECRET || "seuSegredoSeguro";
        const decoded = jwt.verify(token.replace("Bearer ", ""), secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({erro: "Token inválido ou expirado"});

    }
};

module.exports = midlewareWebToken;