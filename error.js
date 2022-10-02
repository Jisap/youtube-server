
export const createError = (status, message) => { // Función que recibe un status y un mensaje de error

  const err = new Error()                         // Instancia de Error              
  err.status= status                              // Define el status      
  err.message= message                            // Define el mensaje  
  return err                                      // Retornamos el error con ese status y message  
} 
