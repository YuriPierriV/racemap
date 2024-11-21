exports.up = (pgm) => {
  // Cria a tabela chips
  pgm.createTable("chips", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    chip_id: {
      type: "varchar(255)", // ou o tipo apropriado para o identificador do chip
      notNull: true,
      unique: true, // Garante que não haverá IDs duplicados
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
  });

  // Cria um índice para chip_id, se necessário
  pgm.createIndex("chips", "chip_id");
};

exports.down = (pgm) => {
  // Remove a tabela chips
  pgm.dropTable("chips");
};
