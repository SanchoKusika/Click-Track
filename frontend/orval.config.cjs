module.exports = {
  clickInternCore: {
    input: '../swagger.json',
    output: {
      target: './src/shared/api/generated_api.ts',
      prettier: true,
      client: 'axios-functions',
      override: {
        mutator: {
          path: './src/shared/api/api-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
