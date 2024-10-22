exports.up = (pgm) => {
  pgm.createTable('tracks', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    inner_track: {
      type: 'jsonb',
      notNull: true,
    },
    outer_track: {
      type: 'jsonb',
      notNull: true,
    },
    padding: {
      type: 'integer',
      notNull: true,
    },
    curveintensity: {
      type: 'float',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
    rotation: {
      type: 'integer',
      notNull: true,
    },
  });

  // Adiciona uma restrição CHECK para garantir que rotation esteja entre 0 e 360
  pgm.addConstraint('tracks', 'rotation_check', {
    check: 'rotation >= 0 AND rotation <= 360',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tracks');
};
