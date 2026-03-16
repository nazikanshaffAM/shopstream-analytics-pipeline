require("dotenv").config();
const { CubejsServer } = require("@cubejs-backend/server");

const server = new CubejsServer({
  apiSecret: process.env.CUBEJS_API_SECRET,
  schemaPath: process.env.CUBEJS_SCHEMA_PATH || "schema",
});

server.listen().then(({ version, port }) => {
  console.log(`Cube.js server (${version}) is listening on port ${port}`);
});
