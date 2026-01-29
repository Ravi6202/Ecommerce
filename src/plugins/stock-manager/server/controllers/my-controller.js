'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('stock-manager')
      .service('myService')
      .getWelcomeMessage();
  },
});
