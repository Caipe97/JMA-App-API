
    const users = require("../controllers/users.controller.js");
  
    var router = require("express").Router();
  
    // Crear un nuevo usuario
    router.post("/register", users.create);
  
    // Obtener  usuarios
    router.get("/", users.findUsers);

  
    // Actualizar un usuario
    router.put("/", users.update);
  
    // Eliminar un usuario por el id
    router.delete("/", users.delete);

    //Login a un usuario
    router.post("/login", users.login);

    module.exports = router;
  
    //app.use('/api/users', router);
    