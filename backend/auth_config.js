import process from "process";
import { google } from "googleapis";


//AUTENTICACION USANDO EL CLIENT ID
const auth2Client = new google.auth.OAuth2({
    clientId: process.env.VITE_OAUTH_ID,
    clientSecret: process.env.VITE_SECRET_KEY,
    redirectUri: process.env.VITE_REDIRECT_URI,
});

auth2Client.setCredentials({ refresh_token: process.env.VITE_REFRESH_TOKEN });

//EVENTOS DE CAMBIO
auth2Client.on('tokens',(tokens) => {
    if(tokens.refresh_token) { console.log('Nuevo token, Accesso renovado'); }
});

//Verificar token
export async function verifyCredentials(){
    try {
        const tokenResponse = await auth2Client.getAccessToken();
        if (!tokenResponse.token) throw new Error("NO SE PUDO GENERAR UN TOKEN ACCESS VALIDO");
        return true;
    } catch (authError) {
        console.error("Error crítico de autenticación:", authError.message);
        return false;
    }
}

export { auth2Client };


