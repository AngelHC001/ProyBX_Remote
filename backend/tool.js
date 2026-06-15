import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Configuración de la ruta al archivo JSON
//const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Si te da error de ruta en Windows, puedes usar string directo: const jsonPath = './exclusive.json';
const jsonPath = './exclusive.json'

const actualizarPassword = async (targetUsername, unhashedPassword) => {
  try {
    // 1. Leer el archivo exclusive.json de forma asíncrona
    const data = await fs.readFile(jsonPath, 'utf-8');
    const usuarios = JSON.parse(data);

    // 2. Buscar al usuario por su username
    const usuario = usuarios.find(u => u.username === targetUsername);

    if (!usuario) {
      console.error(`❌ Error: El usuario "${targetUsername}" no existe en exclusive.json`);
      return;
    }

    // 3. Hashear la nueva contraseña (Buena práctica obligatoria para auditoría)
    console.log(`🔑 Generando hash seguro para ${targetUsername}...`);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(unhashedPassword, saltRounds);

    // 4. Modificar la propiedad 'pass' directamente sobre el objeto encontrado
    usuario.pass = hashedPassword;

    // 5. Escribir de vuelta el JSON con formato legible (indentado con 2 espacios)
    await fs.writeFile(jsonPath, JSON.stringify(usuarios, null, 2), 'utf-8');
    
    console.log(`✅ ¡Éxito! Contraseña actualizada y cifrada para el usuario: ${targetUsername}`);
    console.log(`📍 Sucursal asociada: ${usuario.sucursal}`);

  } catch (error) {
    console.error('❌ Ocurrió un error al procesar el archivo:', error.message);
  }
};

// =========================================================================
// MODO DE USO: Cambia estos dos valores con el usuario que quieras modificar
// =========================================================================
const USUARIO_A_CAMBIAR = "bxHuayacan";
const NUEVA_CONTRASENA = "Hv4jacaN_bXR3m0teK4nCVn";

actualizarPassword(USUARIO_A_CAMBIAR, NUEVA_CONTRASENA);
