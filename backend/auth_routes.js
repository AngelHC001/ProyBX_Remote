import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import usuarios from './exclusive.json';
const SECRET = 'TU_SECRETO_SUPER_SECRETO_2016';

const router = express.Router();


router.post('/login', async(req,res) => {
    const {username, password} = req.body;

    //buscar usuario
    const usuario = usuarios.map((u) => (u.username === username));
    if(!usuario) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

    //verificar contraseña
    const validPassword = bcrypt.compareSync(password, usuario.password);
    if(!validPassword) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

    //GENERAR TOKEN
    const token = jwt.sign(
        {id: usuario.id, suc: usuario.sucursal},
        SECRET,
        {expiresIn: '2h'}
    );

    res.json({token, user: {username: usuario.username, sucursal: usuario.sucursal}});
});

export default router;