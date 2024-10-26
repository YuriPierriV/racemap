exports.up = (pgm) => {
  // Cria a tabela auxiliar race_participants
  pgm.createTable("race_participants", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    race_id: {
      type: "integer",
      notNull: true,
      references: "races", // Adiciona a chave estrangeira referenciando a tabela "races"
      onDelete: "CASCADE", // Define comportamento de exclusão em cascata
    },
    esp_id: {
      type: "varchar(255)", // ou o tipo apropriado para o ID do ESP
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

  // Cria um índice para race_id, se necessário
  pgm.createIndex("race_participants", "race_id");
};

exports.down = (pgm) => {
  pgm.dropTable("race_participants");
};
