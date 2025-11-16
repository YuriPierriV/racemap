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
  // Adiciona um campo tipo_circuito para diferenciar circuitos fechados de ponto a ponto
  pgm.addColumns("circuits", {
    tipo_circuito: {
      type: "varchar(20)",
      notNull: false,
      default: "closed",
      comment:
        "Tipo do circuito: 'closed' (fechado) ou 'point-to-point' (ponto a ponto)",
    },
  });

  // Adiciona restrição CHECK para tipo_circuito
  pgm.addConstraint("circuits", "tipo_circuito_check", {
    check: "tipo_circuito IN ('closed', 'point-to-point')",
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint("circuits", "tipo_circuito_check");
  pgm.dropColumns("circuits", ["tipo_circuito"]);
};
