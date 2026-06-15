import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import usuarios from './exclusive.json' with {type: 'json'};
const SECRET = 'LA_CAJA_SECRETA_DEL_COMPARTIMENTO_SECRETO_QUE_ABRE_LA_CUERDA_SECRETA';

const router = express.Router();

router.post('/login', async(req,res) => {
    const {username, password} = req.body;

    //buscar usuario
    const usuario  = usuarios.find((u) => (u.username === username));
    if(!usuario) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

    //verificar contraseña
    const validPassword = bcrypt.compareSync(password, usuario.pass);
    if(!validPassword) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

    //GENERAR TOKEN
    const token = jwt.sign({id: usuario.id, suc: usuario.sucursal},
        SECRET, {expiresIn: '2h'});
    
    res.json({token, user: {username: usuario.username, sucursal: usuario.sucursal}});
});

export default router;