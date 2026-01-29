"use strict";

//const order = require("./order");

module.exports = {
  async orderFromCart(ctx) {
    try {
      //Check logged-in user
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      //Fetch cart with cart_items and product
      const cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
        populate: {
          cart_items: {
            populate: ["product"],
          },
        },
      });

      //Check empty cart
      if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        return ctx.badRequest("Cart is empty");
      }

      let totalAmount = 0;

      //Check stock and calculate total
      for (const item of cart.cart_items) {
        const product = item.product;
        const quantity = item.quantity;

        // stock check using quantity
        if (product.stock < quantity) {
          return ctx.badRequest(
            `Insufficient stock for product ${product.name}`
          );
        }

        // calculate total
        totalAmount += product.price * quantity;
      }

      //Reduce stock
      for (const item of cart.cart_items) {
        const product = item.product;
        const quantity = item.quantity;

        await strapi.entityService.update("api::product.product", product.id, {
          data: {
            stock: product.stock - quantity,
          },
        });
      }

      //Create order
      const order = await strapi.entityService.create("api::order.order", {
        data: {
          user: user.id,
          orderNo: `ORD-${Math.floor(Math.random() * 1000)}`,
          Total_amount: totalAmount,
        },
      });

      //Clear cart (delete cart items)
      for (const item of cart.cart_items) {
        await strapi.entityService.delete("api::cart-item.cart-item", item.id);
      }

      // Success response
      return ctx.send({
        message: "Order placed successfully",
        order: {
          orderId: order.id,
          orderNo: order.orderNo,
          totalAmount: order.Total_amount,
        },
        orderedItems: cart.cart_items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
        })),
      });
    } catch (err) {
      console.error("orderFromCart ERROR:", err);
      return ctx.internalServerError("Unable to place order");
    }
  },
  // GET /api/order/vieworder
  async viewOrder(ctx) {
    try {
      //Check logged-in user
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      // Fetch all orders of this user
      const orders = await strapi.db.query("api::order.order").findMany({
        where: {
          user: user.id,
        },
       // orderBy: { createdAt: "desc" },
      });
      //If no orders found
      if (!orders || orders.length === 0) {
        return ctx.send({
          message: "No orders found",
          orders: [],
        });
      }
      //Format response
      const formattedOrders = orders.map((order) => ({
        orderNo: order.orderNo,
        totalAmount: order.Total_amount,
        status: order.status || "PLACED",
        createdAt: order.createdAt,
      }));

      //Send response
      return ctx.send({
        message: "Your orders",
        orders: formattedOrders,
      });
    } catch (err) {
      console.error("viewOrder ERROR:", err);
      return ctx.internalServerError("Unable to fetch orders");
    }
  },
};