export function up(knex) {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').primary();
    table.string('token').unique().notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('tokens');
}
