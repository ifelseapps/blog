const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const { format } = require('date-fns');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy('src/css');
  eleventyConfig.addPassthroughCopy('src/images');

  eleventyConfig.addFilter('dateFormatted', dateObj => {
    return format(dateObj, 'dd.MM.yyyy');
  });

  eleventyConfig.addFilter('dateISO', dateObj => {
    return format(dateObj, 'yyyy-MM-dd');
  });

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

  eleventyConfig.addPairedShortcode('notewrapper', function (content) {
    return `<div class="note-wrapper">${content}</div>`;
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
