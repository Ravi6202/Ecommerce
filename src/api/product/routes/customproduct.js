module.exports = {
  routes: [
    {
      method: "GET",
      path: "/getproducts",
      handler: "customproduct.find",
      config: {
        auth: {},
      },
    },

    {
      method: "GET",
      path: "/products/search/:name",
      handler: "customproduct.searchByName",
      config: {
        auth: {},
      },
    },

    {
      method: "GET",
      path: "/products/:id",
      handler: "customproduct.findOne",
      config: {
        auth: {},
      },
    },

    {
      method: "DELETE",
      path: "/products/remove/:id",
      handler: "customproduct.remove",
      config: {
        auth: {},
      },
    },

    {
      method: "PUT",
      path: "/products/update/:id",
      handler: "customproduct.updateProduct",
      config: {
        auth: {},
      },
    },
  ],
};
