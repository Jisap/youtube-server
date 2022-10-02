import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    
    name: {
        type: String, 
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
    },img:{
        type: String,
    },
    subscribers:{           // Nº de suscriptores
        type: Number,
        default: 0
    },
    subscribedUsers:{       // Id´s de los usuarios a los que está subscrito
        type:[ String ]
    },
    fromGoogle:{
        type: Boolean,
        default: false
    }
}, 

{ timestamps: true }

);

export default mongoose.model("User", UserSchema);