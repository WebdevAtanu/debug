export function up(knex) {
  return knex.schema.createTable('comments', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.json('reactions');
    table.integer('bug_id').unsigned().references('id').inTable('bugs').onDelete('CASCADE');
    table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('comments');
}
