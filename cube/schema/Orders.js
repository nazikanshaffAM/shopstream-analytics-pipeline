cube(`Orders`, {
  sql: `SELECT * FROM orders`,

  measures: {
    count: {
      type: `count`
    },

    avgDiscountPct: {
      sql: `discount_pct`,
      type: `avg`
    }
  },

  dimensions: {
    orderId: {
      sql: `order_id`,
      type: `string`,
      primaryKey: true
    },

    customerId: {
      sql: `customer_id`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    channel: {
      sql: `channel`,
      type: `string`
    },

    shippingCountry: {
      sql: `shipping_country`,
      type: `string`
    },

    orderDate: {
      sql: `order_date`,
      type: `time`
    }
  }
});
