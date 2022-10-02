import jwt from 'jsonwebtoken';
import { createError } from "./error.js";

export const verifyToken = ( req, res, next ) => {

    const token = req.cookies.access_token; // Obtenemos el token de la cookie contenida en la petición de la url
    if(!token) return next( createError( 401, "You are not authenticated"));

    jwt.verify( token, process.env.JWT, ( err, user ) => {                  // Verificamos que el token es válido con el secret, esto generá un usuario o un error
        if( err ) return next( createError( 401, "token is not valid") );   // Si hay error mensaje
        req.user = user;                                                    // Sino, introducimos en la petición (req) el usuario válidado por el token.
        next();                                                             // Pasamos a la siguiente función de la ruta
    });


}