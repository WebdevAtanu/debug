export function up(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments('id').primary();
    table.string('message').notNullable();
    table.boolean('read').defaultTo(false);
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.integer('bug_id').unsigned().references('id').inTable('bugs').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('notifications');
}
