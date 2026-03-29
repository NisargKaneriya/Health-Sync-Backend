const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Doctor–Patient Management API",
      version: "1.0.0",
      description: "API documentation for Doctor Patient App",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.js"], // 👈 scan all route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};