export function up(knex) {
  return knex.schema.createTable('bugs', (table) => {
    table.increments('id').primary();
    table.integer('number').unique().notNullable();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.string('status').defaultTo('open');
    table.json('labels');
    table.json('reactions');
    table.integer('author_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('bugs');
}
