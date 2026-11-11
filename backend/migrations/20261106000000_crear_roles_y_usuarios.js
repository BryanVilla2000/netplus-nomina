exports.up = (knex) =>
  knex.raw(`
    CREATE TABLE roles (
        id      SMALLINT    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        codigo  VARCHAR(20) NOT NULL UNIQUE,
        nombre  VARCHAR(80) NOT NULL
    );

    CREATE TABLE usuarios (
        id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        usuario     VARCHAR(50)  NOT NULL,
        nombre      VARCHAR(100) NOT NULL,
        clave_hash  VARCHAR(100) NOT NULL,
        rol_id      SMALLINT     NOT NULL REFERENCES roles (id),
        activo      BOOLEAN      NOT NULL DEFAULT TRUE,
        creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX usuarios_usuario_uq ON usuarios (lower(usuario));
  `);

exports.down = (knex) =>
  knex.raw(`
    DROP TABLE IF EXISTS usuarios;
    DROP TABLE IF EXISTS roles;
  `);