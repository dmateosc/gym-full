module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { node: 'current' },
      modules: 'auto'
    }],
    ['@babel/preset-react', { 
      runtime: 'automatic',
      development: process.env.NODE_ENV !== 'production'
    }],
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true
    }],
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        ['@babel/preset-react', { 
          runtime: 'automatic',
          development: true
        }],
        ['@babel/preset-typescript', {
          isTSX: true,
          allExtensions: true
        }],
      ],
    },
  },
};
