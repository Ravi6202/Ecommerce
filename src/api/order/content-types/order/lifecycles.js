module.exports = {
  async afterCreate(event) {
    try {
      const orderId = event?.result?.id;

      // console.log("afterCreate hook triggered for Order:", orderId);

      // if (!orderId) {
      //   console.warn("Order ID not found in event");
      //   return;
      // }

      // Fetch full order with relations
      const order = await strapi.entityService.findOne(
        "api::order.order",
        orderId,
        {
          populate: {
            user: true, // populate user relation
          },
        }
      );

      if (!order) {
        console.warn("Order not found:", orderId);
        return;
      }

      const user = order.user;
      if (!user) {
        console.warn("No user relation found on order", {
          orderId,
        });
        return;
      }

      if (!user.email) {
        console.warn("User has no email:", user);
        return;
      }

      await strapi.plugins["email"].services.email.send({
        to: user.email,
        // from: "shivamsingh@wattmonk.com",
        // replyTo: "happysingh1@wattmonk.com",
        subject: "Order placed",
        text: `Your order is confirmed.`,
        html: `<p>Your order with Order ID <strong>${order.id}</strong> <br> price:${order.Total_amount} </br> <br>Status:<strong>${order.status}</strong></br>.</p>`,
      });
    } catch (err) {
      console.error("Error :", {
        message: err.message,
        stack: err.stack,
        code: err.code || null,
      });
    }
  },
};
