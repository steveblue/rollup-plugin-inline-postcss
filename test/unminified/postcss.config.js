module.exports = (ctx) => ({
  plugins: {
    'postcss-csso': ctx.env === 'PROD' ? {} : null,
  },
});
