/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable("circuits", {
    id: {
      type: "uuid",
      default: pgm.func("gen_random_uuid()"),
      primaryKey: true,
    },
    nome: {
      type: "varchar(255)",
      notNull: true,
    },
    descricao: {
      type: "text",
      notNull: false,
    },
    tamanho_percurso: {
      type: "float",
      notNull: false,
    },
    pontos: {
      type: "jsonb",
      notNull: true,
    },
    direcao: {
      type: "varchar(20)",
      notNull: false,
      default: "clockwise",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('UTC', now())"),
    },
  });

  // Adiciona uma restrição CHECK para garantir que direcao seja válida
  pgm.addConstraint("circuits", "direcao_check", {
    check: "direcao IN ('clockwise', 'counterclockwise')",
  });

  // Cria índices para melhor performance
  pgm.createIndex("circuits", "nome");
  pgm.createIndex("circuits", "created_at");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("circuits");
};
