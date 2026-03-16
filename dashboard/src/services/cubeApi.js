import cubejs from "@cubejs-client/core";

const cubeApi = cubejs("shopstream_secret_key", {
  apiUrl: "http://localhost:4000/cubejs-api/v1"
});

export default cubeApi;
