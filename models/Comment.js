import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    
    userId: {                   // Usuario que comenta
        type: String, 
        required: true,
    },
    videoId:{                   // Video que se está comentando
        type: String,
        required: true,
    },
    desc:{
        type: String,
        required: true,
    },
    
}, 

{ timestamps: true }

);

export default mongoose.model("Comment", CommentSchema);