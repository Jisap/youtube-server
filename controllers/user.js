import { createError } from "../error.js"
import User from "../models/User.js";
import Video from "../models/Video.js";


export const update = async ( req, res, next ) => {                         // req contiene los params y el user. user viene desde el middleware verifytoken

  if( req.params.id === req.user.id ) {                                     // Comparamos el id de los params de la url con el de la bd ( id validado por el verifytoken )
    try {                                                                   // Si son iguales,
        const updateUser = await User.findByIdAndUpdate( req.params.id, {   // Buscamos el usuario en bd por id y establecemos el nuevo contenido (req.body)
            $set: req.body
        }, 
        {new: true }
        );
        res.status(200).json( updateUser)                                   // Retornamos el usuario con los cambios realizados
    } catch (err) {
       next(err); 
    }

  }else{
    return next( createError( 403, "You cant update only your account" ))
  }
}

export const deleteUser = async( req, res, next ) => {
  
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted.");
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can delete only your account!"));
  }

}


export const getUser = async( req, res, next ) => {
  
   try {
    const user = await User.findById( req.params.id );
    res.status(200).json( user );
  } catch (err) {
    next(err);
  }
}


export const subscribe = async( req, res, next ) => {   // req contiene los params(id) y el user. user viene desde el middleware verifytoken
  
   try {
    await User.findByIdAndUpdate(req.user.id, {         // Buscamos usuario por id(params) y lo añadimos al campo subscribedUser[] del modelo User
      $push: { subscribedUsers: req.params.id },       
    });
    await User.findByIdAndUpdate(req.params.id, {       // Volvemos a buscar el usuario por id(params) y aumentamos en 1 la var subscribers del modelo User
      $inc: { subscribers: 1 },
    });
    res.status(200).json("Subscription successfull.")
  } catch (err) {
    next(err);
  }

}


export const unsubscribe = async( req, res, next ) => {
  
  try {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { subscribedUsers: req.params.id },
      });
      await User.findByIdAndUpdate(req.params.id, {
        $inc: { subscribers: -1 },
      });
      res.status(200).json("Unsubscription successfull.")
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }

}

export const like = async( req, res, next ) => {
  
  const id = req.user.id;                    // id desde el user de verifytoken(cookie)
  const videoId = req.params.videoId;        // videoId de la url
  try {
    await Video.findByIdAndUpdate(videoId,{  // Buscamos el video en el modelo Video
      $addToSet:{likes:id},                  // Añadimos al campo likes la id del usuario al que le gusta el video
      $pull:{dislikes:id}                    // y lo quitamos del campo dislike 
    })
    res.status(200).json("The video has been liked.")
  } catch (err) {
    next(err);
  }

}


export const dislike = async( req, res, next ) => {
  
  const id = req.user.id;
    const videoId = req.params.videoId;
    try {
      await Video.findByIdAndUpdate(videoId,{
        $addToSet:{dislikes:id},                // Añadimos al campo dislike la id del video que no gusta
        $pull:{likes:id}                        // Quitamos del campo like la id del mismo video
      })
      res.status(200).json("The video has been disliked.")
  } catch (err) {
    next(err);
  }

}