export function up(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('isVerified');
  });
}

export function down(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.boolean('isVerified').defaultTo(false);
  });
}