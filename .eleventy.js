module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/css');

  eleventyConfig.addLiquidTag('note', function (liquidEngine) {
    return {
      parse: function (tagToken, remainingTokens) {
        this.str = tagToken.args;
      },
      render: function (scope, hash) {
        const str = liquidEngine.evalValue(this.str, scope);
        return Promise.resolve(`<p class="note">${str}</p>`);
      }
    };
  });
  eleventyConfig.addLiquidTag('line', function (liquidEngine) {
    return {
      render: function () {
        return Promise.resolve('<hr class="line">');
      }
    };
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
    }
  };
};
