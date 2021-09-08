
    const records = require("../controllers/records.controller.js");
  
    var router = require("express").Router();
  
    // Crear un nuevo record
    router.post("/", records.create);
  
    // Obtener todos los records
    router.get("/", records.findAll);
  
    // Obtener un solo record
    router.get("/:id", records.findOne);
  
    // Actualizar un record por el id
    router.put("/:id", records.update);
  
    // Eliminar un record por el id
    router.delete("/", records.delete);


    module.exports = router;
    //app.use('/api/records', router);
  