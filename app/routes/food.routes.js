module.exports = app => {
    const foods = require("../controllers/foods.controller.js");
  
    var router = require("express").Router();
  
    // Create new food
    router.post("/", foods.create);
  
    // Obtener todos los foods
    router.get("/", foods.findAll);
  
    // Obtener una comida
    router.get("/:id", foods.findOne);
  
    // Actualizar una comida por el id
    router.put("/:id", foods.update);
  
    // Eliminar una comida por el id
    router.delete("/:id", foods.delete);
  
    // Eliminar TODAS las comidas
    router.delete("/", foods.deleteAll);
  
    app.use('/api/foods', router);
  };
  