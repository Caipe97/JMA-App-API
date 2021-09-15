
    const meals = require("../controllers/meals.controller.js");
  
    var router = require("express").Router();
  
    // Crear un nuevo meal
    router.post("/", meals.create);

    // Obtener todos los meals de un usuario
    //router.get("/byUserId", meals.findAllByUser);

    // Obtener todos los meals
    router.get("/", meals.findMeals);
  
    // Obtener un solo meal
    //router.get("/byId", meals.findOne);
  
    // Actualizar un meal por el id
    router.put("/", meals.update);
  
    // Eliminar un meal por el id, pasado en el body
    router.delete("/", meals.delete);


    module.exports = router;
    //app.use('/api/meals', router);
  