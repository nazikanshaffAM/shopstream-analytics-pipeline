cube(`Customers`, {
  sql: `SELECT * FROM customers`,

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    customerId: {
      sql: `customer_id`,
      type: `string`,
      primaryKey: true
    },

    name: {
      sql: `name`,
      type: `string`
    },

    email: {
      sql: `email`,
      type: `string`
    },

    gender: {
      sql: `gender`,
      type: `string`
    },

    city: {
      sql: `city`,
      type: `string`
    },

    country: {
      sql: `country`,
      type: `string`
    },

    tier: {
      sql: `tier`,
      type: `string`
    },

    signupDate: {
      sql: `signup_date`,
      type: `time`
    }
  }
});
