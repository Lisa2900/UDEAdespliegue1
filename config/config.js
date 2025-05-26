require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/biblioteca_virtual_udea',
    dialect: 'mysql',
  },
  test: {
    url: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/my_database_test',
    dialect: 'mysql',
  },
  production: {
    url: process.env.DATABASE_URL || 'mysql://root:root@127.0.0.1:3306/my_database_prod',
    dialect: 'mysql',
  },
};
