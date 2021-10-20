
    const goals = require("../controllers/goals.controller.js");
  
    var router = require("express").Router();
  
    // Crear un nuevo goal
    router.post("/", goals.create);

    // Obtener todos los goals de un usuario
    //router.get("/byUserId", goals.findAllByUser);

    // Obtener todos los goals
    router.get("/", goals.findGoals);
  
    // Obtener un solo goal
    //router.get("/graphBar", goals.graphBarData);
  
    // Actualizar un goal por el id
    router.put("/", goals.update);
  
    // Eliminar un goal por el id, pasado en el body
    router.delete("/", goals.delete);


    module.exports = router;
  