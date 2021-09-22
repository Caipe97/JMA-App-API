
    const foodSuggestions = require("../controllers/foodSuggestions.controller.js");
  
    var router = require("express").Router();
  
    // Create new foodSuggestion
    router.post("/", foodSuggestions.create);
  
    // Obtener foodSuggestions
    router.get("/", foodSuggestions.findFoodSuggestions);
  
    // Obtener una comida
    //router.get("/", foodSuggestions.findOne);
  
    // Actualizar una comida por el id
    router.put("/", foodSuggestions.update);
  
    // Eliminar una comida por el id
    router.delete("/", foodSuggestions.delete);
  
    module.exports = router;
    //app.use('/api/foodSuggestions', router);

  