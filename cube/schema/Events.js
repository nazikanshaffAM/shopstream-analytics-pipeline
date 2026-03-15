cube(`Events`, {
  sql: `SELECT * FROM events`,

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    eventId: {
      sql: `event_id`,
      type: `string`,
      primaryKey: true
    },

    sessionId: {
      sql: `session_id`,
      type: `string`
    },

    customerId: {
      sql: `customer_id`,
      type: `string`
    },

    eventType: {
      sql: `event_type`,
      type: `string`
    },

    productId: {
      sql: `product_id`,
      type: `string`
    },

    device: {
      sql: `device`,
      type: `string`
    },

    timestamp: {
      sql: `timestamp`,
      type: `time`
    }
  }
});
