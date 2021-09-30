
    const foodCategories = require("../controllers/foodCategories.controller.js");
  
    var router = require("express").Router();
  
    // Create new food
    router.post("/", foodCategories.create);
  
    // Obtener foodCategories
    router.get("/", foodCategories.findFoodCategories);
  
    // Obtener una comida
    //router.get("/", foodCategories.findOne);
  
    // Actualizar una comida por el id
    router.put("/", foodCategories.update);
  
    // Eliminar una comida por el id
    router.delete("/", foodCategories.delete);
  
    module.exports = router;
    //app.use('/api/foodCategories', router);

  