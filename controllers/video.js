import User from "../models/User.js";
import Video from "../models/Video.js";
import { createError } from "../error.js";

export const addVideo = async (req, res, next) => {                     // req contiene params, body y el user. user viene desde el middleware verifytoken

  const newVideo = new Video({ userId: req.user.id, ...req.body });     // Creamos una nueva instacia del Video con la id del usuario y el contenido del body

  try {
    const savedVideo = await newVideo.save();                           // Grabamos el video en bd
    res.status(200).json(savedVideo);                                   // Respuesta.
  } catch (err) {
    next(err);
  }

};

export const updateVideo = async (req, res, next) => { // Recibimos un id para actualizar el video ( user por verifytoken )
  try {
    const video = await Video.findById(req.params.id);              // Buscamos el video por ese id
    if (!video) return next(createError(404, "Video not found!"));  // Sino hay video mensaje de error
    if (req.user.id === video.userId) {                             // Si la id del usuario que actualiza = id del usuario que creo el video
      const updatedVideo = await Video.findByIdAndUpdate(           // actualizamos. Buscamos el video según el id de los params
        req.params.id,
        {
          $set: req.body,                                           // establecemos el nuevo contenido con el body de la petición
        },
        { new: true }
      );
      res.status(200).json(updatedVideo);
    } else {
      return next(createError(403, "You can update only your video!"));
    }
  } catch (err) {
    next(err);
  }
};

export const deleteVideo = async (req, res, next) => {  // Recibimos un id para borrar el video ( user por verifytoken )
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return next(createError(404, "Video not found!"));
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete(req.params.id);
      res.status(200).json("The video has been deleted.");
    } else {
      return next(createError(403, "You can delete only your video!"));
    }
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => { // Recibimos un id para obtener el video 
  try {
    const video = await Video.findById(req.params.id);
    res.status(200).json(video);
  } catch (err) {
    next(err);
  }
};

export const addView = async (req, res, next) => { // Recibimos un id para añadir al nº de visitas del video 
  try {
    await Video.findByIdAndUpdate(req.params.id, {          // Buscamos el video por id (params)
      $inc: { views: 1 },                                   // Aumentamos el campo views en 1 del modelo Video
    });
    res.status(200).json("The view has been increased.");
  } catch (err) {
    next(err);
  }
};

export const random = async (req, res, next) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 40 } }]); // Obtenemos del modelo una muestra aleatoria de 40 videos
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const trend = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ views: -1 });  // Obtenemos del modelo una lista de videos ordenados por los mas vistos ( -1 )
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

// Subscripciones/videos de un usuario
export const sub = async (req, res, next) => {  // Recibimos user por verifytoken 
  try {
    const user = await User.findById(req.user.id);      // User según id del usuario del token
    const subscribedChannels = user.subscribedUsers;    // Lista de ids de las subscripciones de este usuario    

    const list = await Promise.all(                         // Lista de videos de los usuarios a los que esta subscrito este user
      subscribedChannels.map(async (channelId) => {         // mapeo de la lista de ids de las subscripciones
        return await Video.find({ userId: channelId });     // con cada id buscamos un video que coincida con el campo userId del modelo Video 
      })
    );

    res.status(200).json(list.flat().sort((a, b) => b.createdAt - a.createdAt)); // retornamos la lista en un solo array ordenados de < a > por fecha de creación
  } catch (err) {
    next(err);
  }
};

export const getByTag = async (req, res, next) => {   // localhost:8800/api/videos/tags?tags=js,py,c
  const tags = req.query.tags.split(",");             // Ontenemos los querys separados por ,
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20); // Buscamos dentro del modelo Video los tags que contengan nuestros querys
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};

export const search = async (req, res, next) => { 
  const query = req.query.q;                      // Obtenemos el término de busqueda
  try {
    const videos = await Video.find({             // Buscamos en el modelo de Video
      title: { $regex: query, $options: "i" },    // por el título todo lo que coincida con el query sin importar mayúsculas o minúsculas
    }).limit(40);
    res.status(200).json(videos);
  } catch (err) {
    next(err);
  }
};