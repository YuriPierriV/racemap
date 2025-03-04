const { unique } = require("next/dist/build/utils");

exports.up = (pgm) => {
    pgm.createTable('users', {
        id: {
            type: 'uuid',
            default: pgm.func('gen_random_uuid()'),
            primaryKey: true
        },

        //git hub permite apenas 39 caracteres
        username: { 
            type: 'varchar(30)',
            notNull: true,
            unique: true
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true
        },
        password: {
            type: 'varchar(72)',
            notNull: true
        },

        //https://justatheory.com/2012/04/postgres-use-timestamptz/
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('now()')
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('now()')
        }
    })
};


exports.down = false;
