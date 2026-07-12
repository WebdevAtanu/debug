export function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('username').unique().notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('avatar');
    table.string('avatarUrl');
    table.text('bio');
    table.enu('provider', ['local', 'google']).defaultTo('local');
    table.string('googleId').unique();
    table.boolean('isVerified').defaultTo(false);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('users');
}
