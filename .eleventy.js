module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/css');

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
    }
  };
};
