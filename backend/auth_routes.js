import express from 'express';
import process from 'process';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { getUsersFromDrive } from './drive_routes.js';

const TOKEN_HOMEMADE = process.env.VITE_TOKEN_HOMEMADE;
const router = express.Router();

router.post('/login', async(req,res) => {
    const {username, password} = req.body;

    try {
        //OBTENER JSON
        const usuarios = await getUsersFromDrive();

        //Buscar usuario
        const usuario = usuarios.find((u) => (u.username === username));
        if(!usuario) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

        //Verificar contraseña
        const validPassword = bcrypt.compareSync(password, usuario.pass);
        if(!validPassword) return res.status(401).json({message: 'CREDENCIALES INVALIDAS'});

        //GENERAR TOKEN
        const token = jwt.sign({id: usuario.id, suc: usuario.sucursal}, TOKEN_HOMEMADE, {expiresIn: '2h'});
        
        //GUARDAR EL TOKEN EN UNA COOKIE
        res.cookie('auth_token',token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 100
        });

        return res.status(200).json({token: token, user: {username: usuario.username, sucursal: usuario.sucursal}});
    } catch (error) {
        return res.status(500).json({message: 'Ocurrio un error (login)' + error});    
    }
});

//SALVAR LA SESION CUANDO SE RECARGA EN REACT
router.get('/verify',async(req,res) => {
    //buscar la cookie
    const token = req.cookies.auth_token;

    if(!token){
        return res.status(201).json({message: 'No hay sesion activa'});
    }

    try {
        const decoded = jwt.verify(token, TOKEN_HOMEMADE);
        const user = {id: decoded.id, sucursal: decoded.suc }
        return res.status(200).json({token: token, user: user});
    } catch (error) {
        return res.status(500).json({message: 'Ocurrio un error (verify) ' + error});
    }
});


router.get('/exit',async(req,res) => {
    //buscar la cookie
    const token = req.cookies.auth_token;

    if(!token){
        return res.status(201).json({message: 'No hay sesion activa'});
    }

    try {
        res.clearCookie('auth_token');
        return res.status(200).json({message: 'CERRO LA SESION'});
    } catch (error) {
        return res.status(500).json({message: 'Ocurrio un error (verify) ' + error});
    }
});




export default router;