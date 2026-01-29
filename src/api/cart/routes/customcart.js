//const admin = require("../../../../config/admin");

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/cart/add",
      handler: "customcart.addToCart",
      config: {
        auth: {},
      },
    },
    {
      method: "DELETE",
      path: "/cart/remove/:productId",
      handler: "customcart.removeFromCart",
      config: {
        auth: {},
      },
    },
    {
      method: "GET",
      path: "/cart",
      handler: "customcart.viewCart",
      config: {
        auth: {},
      },
    },
  ],
};
