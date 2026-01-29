"use strict";
module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    if (Number(data.stock) < 0) {
      throw new Error("Stock must be greater than 0");
    }
  },
};
