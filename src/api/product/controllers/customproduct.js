"use strict";
module.exports = {
  async find(ctx) {
    try {
      const user = ctx.state.user;

      //If not logged in  treat as normal user
      const isAdmin = user && user.role?.name === "Super Admin";

      //Admin fetch full product data
      if (isAdmin) {
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            populate: "*", // admin sees everything
          }
        );

        return ctx.send({
          role: "admin",
          products,
        });
      }

      //Normal user see limited fields
      const products = await strapi.entityService.findMany(
        "api::product.product",
        {
          fields: ["name", "description", "price"],
          filters:{
            stock:{$gt:0}
          },
         // populate:"*"
        }
      );

      return ctx.send({
        role: "user",
        products,
      });
    } catch (err) {
      console.error("customproduct.find ERROR:", err);
      return ctx.internalServerError("Unable to fetch products");
    }
  },

    // GET /api/products/:id 
    async findOne(ctx) {
     try {
      const { id } = ctx.params;

      // validate id
      const productId = Number(id);
      if (isNaN(productId)) {
        return ctx.badRequest("Invalid product id");
      }
      const user = ctx.state.user;

      // check role
      const isAdmin = user && user.role?.name === "Super Admin";

      //Admin see full product
      if (isAdmin) {
        const product = await strapi.entityService.findOne(
          "api::product.product",
          productId,
          { populate: "*" }
        );

        if (!product) return ctx.notFound("Product not found");

        return ctx.send({
          role:"Admin",
          product,
        });
      }

      //Normal user see limited fields
      else{
        const product = await strapi.entityService.findOne(
          "api::product.product",
          productId,
          {
            filters:{
              stock:{$gt:0}
            },
            fields: ["name", "description", "price"],
        //     populate: {
        // //      images: true,
        //     },
          }
        );
        if (!product) return ctx.notFound("Product not found");

        return ctx.send({
          role: "User",
          product,
        });
      }

    } catch (err) {
      console.error("findOne product ERROR:", err);
      return ctx.internalServerError("Unable to fetch product");
    }
  },
  // GET /api/products/search?name=productName
  async searchByName(ctx) {
    try {
      const { name } = ctx.params;

      if (!name) {
        return ctx.badRequest("Product name is required");
      }

      const user = ctx.state.user;

      const isAdmin = user && user.role?.name === "Super Admin";

      //Admin see full product
      if (isAdmin) {
        const product = await strapi.db
          .query("api::product.product")
          .findOne({
            where: {
              name: { $containsi: name }, // case-insensitive search
            },
          });

        if (!product) return ctx.notFound("Product not found");

        return ctx.send({
          role: "Admin",
          product,
        });
      }

      //Normal user see limited fields
      const product = await strapi.db.query("api::product.product").findOne({
          where: {
            name: { $containsi: name },
          },
          select: ["id", "name", "description", "price"],
        });

      if (!product) return ctx.notFound("Product not found");

      return ctx.send({
        role: "User",
        product,
      });

    } catch (err) {
      console.error("searchByName ERROR:", err);
      return ctx.internalServerError("Unable to search product");
    }
  },
  //DEL /api/products/remove/:id 
  async remove(ctx){
    try{
      const{id}=ctx.params;
      const productId=Number(id);
      if (isNaN(productId)) {
        return ctx.badRequest("Invalid product id");
      }
      const user = ctx.state.user;
      const isAdmin = user && user.role?.name === "Super Admin";
      if (isAdmin) {
        const product = await strapi.entityService.delete(
          "api::product.product",
          productId
        );
        if (!product) return ctx.notFound("Product not found");
        return ctx.send({
          message: "Product deleted successfully",
          product,
        });
      }
      else
      return ctx.send("Only Admin can delete products")  
    }
    catch(err){
      console.error("ERROR:", err);
      return ctx.internalServerError("Unable to delete product");
    }
  },

  //UPDATE /api/products/update/:id
  async updateProduct(ctx){
    try{
      const {id}=ctx.params;
      const data=ctx.request.body
      const productId=Number(id);
      if(isNaN(productId)){
        return ctx.badRequest("Invalid product Id")
      }
      const user=ctx.state.user;
      const isAdmin=user && user.role?.name==="Super Admin";
      if(!isAdmin){
        return ctx.forbidden("Only Admin can update products");
      }
      const updatedProduct= await strapi.entityService.update("api::product.product",productId,
        {
          data,
        }  
      );
      return ctx.send({
        message: "Product updated successfully",
        product: updatedProduct,
      });

    }
    catch(err){
      console.error("update product ERROR:", err);
      return ctx.internalServerError("Unable to update product");
    }
  },
};
