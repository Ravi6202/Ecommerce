"use strict";
module.exports = {
  async orderFromCart(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");
      const userId = user.id;
      console.log("ctx==>", ctx);
      console.log("userid===>", userId);

      // Fetch the user cart
      const cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: userId },
        populate: ["products"],
      });
      console.log("cart===>", cart);

      if (!cart || cart.products.length === 0) {
        return ctx.badRequest("Cart is empty");
      }

      const cartItems = cart.products;
      console.log("cartItems===>", cartItems);

      // Check stock for each product
      for (const product of cartItems) {
        if (product.stock < 1) {
          return ctx.badRequest(
            `Insufficient stock for product ${product.name}`
          );
        }
      }

      // Reduce stock
      for (const product of cartItems) {
        let updatedstock = Number(product.stock) - 1;
        await strapi.entityService.update("api::product.product", product.id, {
          data: { stock: updatedstock },
        });
      }

      let totalAmount = 0;
      for (const product of cartItems) {
        totalAmount += Number(product.price);
      }
      // Create order in database
       const order = await strapi.entityService.create("api::order.order", {
        data: {
          orderNo: `ORD-${Math.floor(Math.random()*1000)}`,
          Total_amount: totalAmount
        },
      });

      // Clear the cart
      await strapi.entityService.update("api::cart.cart", cart.id, {
        data: { products: null },
      });
      console.log("____________________________________", cartItems);
      return ctx.send({
        message: "Order placed successfully",
        orderedItems: cartItems.map((p) => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          orderNo:order.orderNo,
          Total_amount:order.Total_amount,
          status:order.status
        })),
      });
    } catch (err) {
      console.error("orderFromCart ERROR:", err);
      return ctx.internalServerError("Unable to place order");
    }
  },

  //GET /api/order/vieworder
  async viewOrder(ctx){
    try{
      const user=ctx.state.user;
      if(!user) return ctx.unauthorized("you must be logged in");
      const userId=user.id;
      ctx.send('Order has been placed successfully');
    }
    catch(err){
      ctx.send(err);
    }
  }
};

//Order /api/cart/order/:productId
//   async orderFromCart(ctx) {
//     try {
//       const user = ctx.state.user;
//       if (!user) return ctx.unauthorized("You must be logged in");
//       const userId = user.id;

//       const userData = await strapi
//         .query("plugin::users-permissions.user")
//         .findOne({
//           where: { id: userId },
//         });

//       if (!userData) return ctx.unauthorized("User not found");

//     //   const { cartitem } = ctx.request.body;
//     //   if (!cartitem) return ctx.badRequest("cart item is required");
//     //   if (cartitem.length == 0) return ctx.badRequest("cart is empty");
//     const cart = await strapi.db.query("api::cart.cart").findOne({
//       where: { user: userId },
//       populate: ["products"],
//     });

//     if (!cart || cart.products.length === 0) {
//       return ctx.badRequest("Cart is empty");
//     }

//     const cartItems = cart.products;

//       for (const item of cartItems) {
//         if (!item.productId) return ctx.badRequest("ProductId missing");

//         if (item.quantity === null || item.quantity === undefined)
//           return ctx.badRequest("Quantity missing");

//         if (item.quantity <= 0) return ctx.badRequest("Invalid quantity");

//         const product = await strapi.entityService.findOne(
//           "api::product.product",
//           item.productId
//         );
//         if (!product) return ctx.notFound("Product not found");

//         if (product.stock < item.quantity) {
//           return ctx.badRequest("Insufficient stock");
//         }
//       }
//       ctx.send("Order placed successfully");
//     } catch (err) {
//       console.log(ctx.err);
//     }
//   },
