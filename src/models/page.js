'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Page extends Model {
  }

  Page.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Page',
    tableName: 'pages'
  });
  return Page;
};