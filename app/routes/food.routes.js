
    const foods = require("../controllers/foods.controller.js");
  
    var router = require("express").Router();
  
    // Create new food
    router.post("/", foods.create);
  
    // Obtener foods
    router.get("/", foods.findFoods);
  
    // Obtener una comida
    //router.get("/", foods.findOne);
  
    // Actualizar una comida por el id
    router.put("/", foods.update);
  
    // Eliminar una comida por el id
    router.delete("/", foods.delete);
  
    module.exports = router;
    //app.use('/api/foods', router);

  