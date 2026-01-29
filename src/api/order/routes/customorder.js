module.exports = {
  routes: [
    {
      method: "POST",
      path: "/order",
      handler: "customorder.orderFromCart",
      config: {
        auth: {},
      },
    },
    {
      method:"GET",
      path:"/vieworder",
      handler:"customorder.viewOrder",
      config:{
        auth:{},
      },
    },
  ],
};
