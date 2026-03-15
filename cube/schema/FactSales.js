cube(`FactSales`, {
  sql: `SELECT * FROM fact_sales`,

  measures: {
    count: {
      type: `count`
    },

    totalRevenue: {
      sql: `revenue`,
      type: `sum`,
      format: `currency`
    },

    totalQuantity: {
      sql: `quantity`,
      type: `sum`
    },

    avgUnitPrice: {
      sql: `unit_price`,
      type: `avg`
    },

    returnedItems: {
      sql: `CASE WHEN returned = true THEN 1 ELSE 0 END`,
      type: `sum`
    }
  },

  dimensions: {
    itemId: {
      sql: `item_id`,
      type: `string`,
      primaryKey: true
    },

    orderId: {
      sql: `order_id`,
      type: `string`
    },

    customerId: {
      sql: `customer_id`,
      type: `string`
    },

    productId: {
      sql: `product_id`,
      type: `string`
    },

    category: {
      sql: `category`,
      type: `string`
    },

    subCategory: {
      sql: `sub_category`,
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

    returned: {
      sql: `returned`,
      type: `boolean`
    },

    orderDate: {
      sql: `order_date`,
      type: `time`
    }
  }
});
