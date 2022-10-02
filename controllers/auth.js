import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";

export const signup = async( req, res, next ) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync( req.body.password, salt );
        const newUser = new User({ ...req.body, password: hash });
        await newUser.save();
        res.status( 200 ).send( "User has been created" )
    } catch ( err ) {
        next( err )
    }
}

export const signin = async( req, res, next ) => {
    try {
        const user = await User.findOne({ name:req.body.name });                   // Buscamos el usuario en base al nombre en la bd
        if( !user ) return next( createError( 404, "User not found" ))

        const isCorrect = await bcrypt.compare( req.body.password, user.password ) // Comparamos la pass del body con la de la bd
        if( !isCorrect) return next( createError( 400, "Wrong credentials" ))

        const token = jwt.sign({ id: user._id }, process.env.JWT)                  // Creamos el jwt en base al id del usuario de la bd
        const { password, ...other } = user._doc;
        
        res
            .cookie( "access_token", token, {                                      // Creamos una cookie con el token 
                httpOnly: true
            })
            .status( 200 )                                                         // Devolvemos un status 200 
            .json( other )                                                         // y el usuario que ha logueado menos la password
         
    } catch ( err ) {
        next( err )
    }
}

export const googleAuth = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });     // Buscamos un usuario en bd que coincida con el correo del body
    if (user) {                                                     // Si el usuario existe,
      const token = jwt.sign({ id: user._id }, process.env.JWT);    // Creamos el jwt en base al id del usuario de la bd
      res
        .cookie("access_token", token, {                            // Creamos una cookie con el token 
          httpOnly: true,
        })
        .status(200)                                                // devolvemos un status 200
        .json(user._doc);                                           // y un json con la información del usuario logueado
    } else {
      const newUser = new User({                                    // Sino hay un usuario en nuestra bd procederemos a crearlo 
        ...req.body,                                                // con la información del formulario    
        fromGoogle: true,
      });
    
      const savedUser = await newUser.save();                           // Grabaremos el usuario en bd
    
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);   // Le asignamos un token
      res
        .cookie("access_token", token, {                                // Mismo proceso que antes en la respuesta. Creamos la cookie
          httpOnly: true,
        })
        .status(200)                                                    // devolvemos un status 200
        .json(savedUser._doc);                                          // y un json con la información del usuario creado y logueado.
    }
  } catch (err) {
    next(err);
  }
};