
    const users = require("../controllers/users.controller.js");
  
    var router = require("express").Router();
  
    // Crear un nuevo usuario
    router.post("/register", users.create);
  
    // Obtener todos los usuarios
    router.get("/", users.findAll);
  
    // Obtener un solo usuario
    router.get("/:id", users.findOne);
  
    // Actualizar un usuario
    router.put("/:id", users.update);
  
    // Eliminar un usuario por el id
    router.delete("/:id", users.delete);
  
    // Eliminar TODOS los usuarios
    router.delete("/", users.deleteAll);

    //Login a un usuario
    router.post("/login", users.login);

    module.exports = router;
  
    //app.use('/api/users', router);
    