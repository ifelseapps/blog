const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const { format } = require('date-fns');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/css/fonts');
  eleventyConfig.addPassthroughCopy('src/css/bundle.css');
  eleventyConfig.addPassthroughCopy('src/images');

  eleventyConfig.addCollection('tags', function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach(function (item) {
      if ('tags' in item.data) {
        let tags = item.data.tags;

        tags = tags.filter(function (item) {
          switch (item) {
            case 'all':
            case 'nav':
            case 'post':
            case 'posts':
              return false;
          }

          return true;
        });

        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    return [...tagSet];
  });

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
