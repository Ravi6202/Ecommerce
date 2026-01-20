"use strict";

module.exports = {
  // POST /api/cart/add
  async addToCart(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      const { productName, quantity } = ctx.request.body;

      if (!productName || !quantity) {
        return ctx.badRequest("productName and quantity are required");
      }

      // Make sure product exists
      const product = await strapi.db.query("api::product.product").findOne({
        where: { name: { $eqi: productName } },
      });
      if (!product) return ctx.notFound("Product not found");

      // Get user cart
      let cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
        populate: ["products"],
      });

      // If there is no cart then i have to create one
      if (!cart) {
          cart = await strapi.entityService.create("api::cart.cart", {
          data: { user: user.id,quantity },//change
          populate: ["products"],
        });
      }

      // Check if product is already in cart
      const existing = cart.products.find((p) => p.id === product.id);

      if (existing) {
        return ctx.badRequest("Product already in cart");
      }

      // Add product to cart relation
      cart = await strapi.entityService.update("api::cart.cart", cart.id, {
        data: {
          products: [...cart.products.map((p) => p.id), product.id,quantity],//change
        },
        populate: ["products"],
      });

      return { message: "Product added to cart", cart,quantity };
    } catch (err) {
      console.error("addToCart ERROR:", err);
      return ctx.internalServerError("Unable to add product to cart");
    }
  },

  // DELETE /api/cart/remove/:productId
  async removeFromCart(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      const { productId } = ctx.params;
      if (!productId) return ctx.badRequest("productId is required");

      // Get user cart
      let cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
        populate: ["products"],
      });

      if (!cart || cart.products.length === 0) {
        return ctx.notFound("Cart is empty");
      }

      // Remove product from cart
      const productExists = cart.products.some((p) => p.id == productId);
      if (!productExists) return ctx.notFound("Product not found in cart");

      const updatedProducts = cart.products.filter((p) => p.id != productId);
      cart = await strapi.entityService.update("api::cart.cart", cart.id, {
        data: { products: updatedProducts.map((p) => p.id) },
        populate: ["products"],
      });
      return { message: "Product removed from cart", cart };
    } catch (err) {
      console.error("removeFromCart ERROR:", err);
      return ctx.internalServerError("Unable to remove product from cart");
    }
  },

  //GET /api/cart/viewCart
  async viewCart(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");
      const userId = user.id;

      // Fetch cart and populate products
      const cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: userId },
        populate: ["products"],
      });

      if (!cart || cart.products.length === 0) {
        return ctx.send({
          message: "Cart is empty",
          cartItems: [],
          cartTotal: 0,
        });
      }

      // Map products and calculate total
      let cartTotal = 0;
      const cartItems = cart.products.map((product) => {
        const quantity = 1; // Default quantity (you can implement quantity later)
        const total = product.price * quantity;
        cartTotal += total;
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          total,
        };
      });

      return ctx.send({
        userId,
        cartItems,
        cartTotal,
      });
    } catch (err) {
      console.error("viewCart ERROR:", err);
      return ctx.internalServerError("Unable to fetch cart");
    }
  },
};
  // async viewCart(ctx) {
  //   try {
  //     const user = ctx.state.user;
  //     if (!user) return ctx.unauthorized("You must be logged in");
  //     const userId = ctx.state.user.id;

  //     const cart = await strapi.db.query("api::cart.cart").findOne({
  //       where: { user: userId },
  //       populate: {
  //         products: {
  //           populate: { product: true },
  //         },
  //       },
  //     });
  //     if (!cart || cart.items.length === 0) {
  //       return ctx.send({
  //         message: "Cart is empty",
  //         cartItems: [],
  //         cartTotal: 0,
  //       });
  //     }

  //     let cartTotal = 0;
  //     const cartItems = cart.products.map((item) => {
  //       const total = item.quantity * item.product.price;
  //       cartTotal += total;
  //       return {
  //         productId: item.product.id,
  //         name: item.product.name,
  //         price: item.product.price,
  //         quantity: item.quantity,
  //         total,
  //       };
  //     });
  //     return ctx.send({
  //       userId,
  //       cartItems,
  //       cartTotal,
  //     });
  //   } catch (err) {
  //     ctx.send(err);
  //   }
  // },


















// "use strict";

// module.exports = {
//   // GET /api/cart
//   async getCart(ctx) {
//     const user = ctx.state.user;

//     if (!user) return ctx.unauthorized();

//     let cart = await strapi.db.query("api::cart.cart").findOne({
//       where: { user: user.id },
//       populate: {
//         items: {
//           populate: ["product"],
//         },
//       },
//     });

//     if (!cart) {
//       cart = await strapi.entityService.create("api::cart.cart", {
//         data: { user: user.id },
//       });
//     }

//     return cart;
//   },

//   // POST /api/cart/add
//   async addToCart(ctx) {
//     const user = ctx.state.user;
//     const { productId, quantity } = ctx.request.body;

//     if (!user) return ctx.unauthorized();

//     let cart = await strapi.db.query("api::cart.cart").findOne({
//       where: { user: user.id },
//     });

//     if (!cart) {
//       cart = await strapi.entityService.create("api::cart.cart", {
//         data: { user: user.id },
//       });
//     }

//     const existingItem = await strapi.db
//       .query("api::cart-item.cart-item")
//       .findOne({
//         where: {
//           cart: cart.id,
//           product: productId,
//         },
//       });

//     if (existingItem) {
//       await strapi.entityService.update(
//         "api::cart-item.cart-item",
//         existingItem.id,
//         {
//           data: {
//             quantity: existingItem.quantity + quantity,
//           },
//         }
//       );
//     } else {
//       await strapi.entityService.create("api::cart-item.cart-item", {
//         data: {
//           cart: cart.id,
//           product: productId,
//           quantity,
//         },
//       });
//     }

//     return { message: "Product added to cart" };
//   },

//   // PUT /api/cart/update
//   async updateQuantity(ctx) {
//     const { itemId, quantity } = ctx.request.body;

//     await strapi.entityService.update("api::cart-item.cart-item", itemId, {
//       data: { quantity },
//     });

//     return { message: "Quantity updated" };
//   },

//   // DELETE /api/cart/remove/:itemId
//   async removeItem(ctx) {
//     const { itemId } = ctx.params;

//     await strapi.entityService.delete("api::cart-item.cart-item", itemId);

//     return { message: "Item removed" };
//   },

//   // DELETE /api/cart/clear
//   async clearCart(ctx) {
//     const user = ctx.state.user;

//     const cart = await strapi.db.query("api::cart.cart").findOne({
//       where: { user: user.id },
//     });

//     if (!cart) return;

//     await strapi.db.query("api::cart-item.cart-item").deleteMany({
//       where: { cart: cart.id },
//     });

//     return { message: "Cart cleared" };
//   },
// };

// // "use strict";

// // const { createCoreController } = require("@strapi/strapi").factories;

// // module.exports = createCoreController("api::cart.cart", ({ strapi }) => ({

// //   // Get logged-in user cart

// //   async myCart(ctx) {
// //     const user = ctx.state.user;

// //     if (!user) {
// //       return ctx.unauthorized("You must be logged in");
// //     }

// //     const cart = await strapi.db.query("api::cart.cart").findOne({
// //       where: { user: user.id },
// //       populate: {
// //         items: {
// //           populate: ["product"],
// //         },
// //       },
// //     });

// //     return cart || { items: [] };
// //   },

// //   // Add product to cart
// //   async addToCart(ctx) {
// //     const user = ctx.state.user;
// //     const { productId, quantity } = ctx.request.body;

// //     if (!user) {
// //       return ctx.unauthorized("You must be logged in");
// //     }

// //     let cart = await strapi.db.query("api::cart.cart").findOne({
// //       where: { user: user.id },
// //       populate: ["items"],
// //     });

// //     if (!cart) {
// //       cart = await strapi.entityService.create("api::cart.cart", {
// //         data: {
// //           user: user.id,
// //           items: [{ product: productId, quantity }],
// //         },
// //       });
// //     } else {
// //       cart.items.push({ product: productId, quantity });

// //       await strapi.entityService.update("api::cart.cart", cart.id, {
// //         data: { items: cart.items },
// //       });
// //     }

// //     return { message: "Product added to cart" };
// //   },

// //   // Remove item from cart
// //   async removeFromCart(ctx) {
// //     const user = ctx.state.user;
// //     const { itemId } = ctx.params;

// //     const cart = await strapi.db.query("api::cart.cart").findOne({
// //       where: { user: user.id },
// //       populate: ["items"],
// //     });

// //     cart.items = cart.items.filter((item) => item.id !== Number(itemId));

// //     await strapi.entityService.update("api::cart.cart", cart.id, {
// //       data: { items: cart.items },
// //     });

// //     return { message: "Item removed" };
// //   },
// // }));
