exports.up = (pgm) => {
  pgm.createTable("races", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    track_id: {
      type: "integer",
      notNull: true,
      references: "tracks", // Adiciona a chave estrangeira referenciando a tabela "tracks"
      onDelete: "CASCADE", // Define comportamento de exclusão em cascata
    },
    status: {
      type: "varchar(50)",
      notNull: true,
    },
    link: {
      type: "varchar(255)",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
  });

  // Cria um índice para track_id, se necessário
  pgm.createIndex("races", "track_id");
};

exports.down = (pgm) => {
  pgm.dropTable("races");
};
