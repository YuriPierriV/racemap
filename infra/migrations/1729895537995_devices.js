exports.up = (pgm) => {
  pgm.createTable("devices", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      primaryKey: true,
    },
    chip_id: {
      type: "varchar(30)", // ou o tipo apropriado para o identificador do chip
      notNull: true,
      unique: true, // Garante que não haverá IDs duplicados
    },
    //https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Cria um índice para chip_id, se necessário
  pgm.createIndex("devices", "chip_id");
};

exports.down = false;
