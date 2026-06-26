import process from 'process';
import { google } from 'googleapis';

//Variables de entorno en produccion
const DRIVE_FILE = process.env.VITE_DRIVE_FILE;

//OAuth
const OAUTH_ID = process.env.VITE_OAUTH_ID;
const SECRET = process.env.VITE_SECRET_KEY;
const RFK = process.env.VITE_REFRESH_TOKEN;

const REDIRECT_URI = process.env.VITE_REDIRECT_URI;

//AUTENTICACION USANDO EL CLIENT ID
const auth2Client = new google.auth.OAuth2({
    clientId: OAUTH_ID,
    clientSecret: SECRET,
    redirectUri: REDIRECT_URI
});

auth2Client.setCredentials({ refresh_token: RFK });

//EVENTOS DE CAMBIO
auth2Client.on('tokens',(tokens) => {
    if(tokens.refresh_token){
        console.log('Nuevo token');
    }
    console.log('Acceso temporal renovado');
});

//USA EL CLIENT ID
export const drive = google.drive({ version: "v3", auth: auth2Client});


export async function VerifyClient(req,res){
     //VERIFICACION DE CREDENCIALES
    try {
        const tokenResponse = await auth2Client.getAccessToken();
        if(!tokenResponse.token){
            throw new Error("NO SE PUDO GENERAR UN TOKEN ACCESS VALIDO");
        }
        console.log("¡Autenticación OAUTH exitoso!");
    } catch (authError) {
        console.error("Error crítico de autenticación:", authError.message);
        return res.status(401).json({ error: `La cuenta no pudo autenticarse: ${authError.message}` });
    }
}




//FUNCION PARA EXTRAER EXCLUSIVE.JSON DEL DRIVE
let usuariosCache = null;
let ultimaCarga = 0;
const CACHE_TIME = 1000 * 60 * 5; //5 minutos de cache

export async function getUsersFromDrive(){
    
    // Si han pasado menos de 5 minutos, retorna la caché
    if(usuariosCache && (Date.now() - ultimaCarga < CACHE_TIME)){
        return usuariosCache;
    }

    //Si no, vuelve a consultar
    const response = await drive.files.get({
        fileId: DRIVE_FILE,
        alt: 'media'
    });

    //El json
    usuariosCache = response.data;
    ultimaCarga = Date.now();
    return usuariosCache;
}













/*
//HERRAMIENTA AUXILIAR PARA REFRESH TOKEN PERMANENTE, TAREA YA RESUELTA
router.get('/login-google',(req,res) => {
    const authUrl = auth2Client.generateAuthUrl({
        access_type:'offline',
        scope: ['https://www.googleapis.com/auth/drive.file']
    })
    res.redirect(authUrl);
});

//CALLBACK PUESTO EN CLOUD CONSOLE
router.get('/callback',async (req,res) => {
    const {code} = req.query;
    try {
        const { tokens } = await auth2Client.getToken(code);
        console.log('--- COPIA ESTE REFRESH TOKEN ---');
        console.log(tokens.refresh_token);
        console.log('--------------------------------');
        res.send('Token generado. Revisa los logs de Render.');
    } catch (err) {
        res.status(500).send('Error al obtener token: ' + err.message);
    }
});*/