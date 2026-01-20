module.exports = {
  routes: [
    {
      method: "POST",
      path: "/order/:productId",
      handler: "customorder.orderFromCart",
      config: {
        auth: {},
      },
    },
    {
      method:"GET",
      path:"/vieworder/:cartId",
      handler:"customorder.viewOrder",
      config:{
        auth:{},
      },
    },
  ],
};
