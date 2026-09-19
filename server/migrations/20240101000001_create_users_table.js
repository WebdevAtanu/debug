export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').nullable();
    table.string('avatar').nullable();
    table.string('avatarUrl').nullable();
    table.text('bio').nullable();
    table.text('provider').defaultTo('["local"]');
    table.string('googleId').unique().nullable();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
