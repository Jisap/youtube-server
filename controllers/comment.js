import { createError } from "../error.js";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

export const addComment = async (req, res, next) => {
  const newComment = new Comment({ ...req.body, userId: req.user.id }); // Creamos el comentario con el body de la req y el userId del verifyToken
  try {
    const savedComment = await newComment.save();                       // Grabamos en bd
    res.status(200).send(savedComment);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {    // Recibimos en los params un id del comentario que queremos borrar
  try {
    const comment = await Comment.findById(res.params.id);                      // Localizamos el comentario según ese id
    const video = await Video.findById(res.params.id);                          // Localizamos el video también
    if (req.user.id === comment.userId || req.user.id === video.userId) {       // Si el id del usuario === al id del comentario o id del usuario = id del video
      await Comment.findByIdAndDelete(req.params.id);                           // borramos el comentario según ese id pues se cumplen las normas de los modelos.
      res.status(200).json("The comment has been deleted.");
    } else {
      return next(createError(403, "You can delete ony your comment!"));
    }
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {  // Recibimos en los params un id correspondiente a un video ( será igual user.id )
  try {
    const comments = await Comment.find({ videoId: req.params.videoId });       // Localizamos los comentarios según ese id
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};