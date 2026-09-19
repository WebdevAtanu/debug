export function up(knex) {
  return knex.schema.dropTableIfExists('tokens');
}

export function down(knex) {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').primary();
    table.string('token').notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}