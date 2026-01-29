"use strict";
module.exports = {
  // POST /api/cart/add

    async addToCart(ctx) {
    try {
      //Check logged-in user
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      //Read request body
      const { productId, quantity } = ctx.request.body;
      if (!productId || !quantity) {
        return ctx.badRequest("productId and quantity are required");
      }

      //Check product exists
      const product = await strapi.db.query("api::product.product").findOne({
        where: { id: productId  },
      });

      if (!product) return ctx.notFound("Product not found");

      //Find or create cart for user
      let cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
      });

      if (!cart) {
        cart = await strapi.entityService.create("api::cart.cart", {
          data: { user: user.id },
        });
      }

      //Check if Cart Item already exists
      const existingCartItem = await strapi.db
        .query("api::cart-item.cart-item")
        .findOne({
          where: {
            cart: cart.id,
            product: product.id,
          },
        });

      //If exists then update quantity
      if (existingCartItem) {
        const updatedItem = await strapi.entityService.update(
          "api::cart-item.cart-item",
          existingCartItem.id,
          {
            data: {
              quantity: existingCartItem.quantity + quantity,
            },
          }
        );

        return ctx.send({
          message: "Cart quantity updated",
          cartItem: updatedItem,
        });
      }

      //If not exists then create Cart Item
      const newCartItem = await strapi.entityService.create(
        "api::cart-item.cart-item",
        {
          data: {
            cart: cart.id,
            product: product.id,
            quantity: quantity,
          },
        }
      );

      //Success response
      return ctx.send({
        message: "Product added to cart",
        cartItem: newCartItem,
      });
    } catch (err) {
      console.error("addToCart ERROR:", err);
      return ctx.internalServerError("Unable to add product to cart");
    }
  },

  // DELETE /api/cart/remove/:productId
  async removeFromCart(ctx) {
    try {
      //Check logged-in user
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      //Read productId from URL
      const { productId } = ctx.params;
      if (!productId) return ctx.badRequest("productId is required");

      // Find user's cart
      const cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
      });

      if (!cart) {
        return ctx.notFound("Cart not found");
      }

      //Find cart item (cart and product)
      const cartItem = await strapi.db
        .query("api::cart-item.cart-item")
        .findOne({
          where: {
            cart: cart.id,
            product: productId,
          },
        });

      if (!cartItem) {
        return ctx.notFound("Product not found in cart");
      }

      //Delete cart item
      await strapi.entityService.delete(
        "api::cart-item.cart-item",
        cartItem.id
      );

      //Success response
      return ctx.send({
        message: "Product removed from cart",
      });
    } catch (err) {
      console.error("removeFromCart ERROR:", err);
      return ctx.internalServerError("Unable to remove product from cart");
    }
  },

  //GET /api/cart/viewCart
  async viewCart(ctx) {
    try {
      //Check logged-in user
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized("You must be logged in");

      //Find user's cart with cart items and products
      const cart = await strapi.db.query("api::cart.cart").findOne({
        where: { user: user.id },
        populate: {
          cart_items: {
            populate: ["product"],
          },
        },
      });

      //Empty cart check
      if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        return ctx.send({
          message: "Cart is empty",
          cartItems: [],
          cartTotal: 0,
        });
      }

      //Calculate totals using quantity
      let cartTotal = 0;

      const cartItems = cart.cart_items.map((item) => {
        const product = item.product;
        const quantity = item.quantity;
        const total = product.price * quantity;

        cartTotal += total;

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: total,
        };
      });

      //Send response
      return ctx.send({
        cartItems,
        cartTotal,
      });
    } catch (err) {
      console.error("viewCart ERROR:", err);
      return ctx.internalServerError("Unable to fetch cart");
    }
  },
};