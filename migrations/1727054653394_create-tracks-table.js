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
    inner_trace: {
      type: 'jsonb',
      notNull: true,
    },
    outer_trace: {
      type: 'jsonb',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tracks');
};
