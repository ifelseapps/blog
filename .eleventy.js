const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const Image = require('@11ty/eleventy-img');
const { format } = require('date-fns');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/css/fonts');
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
        return Promise.resolve(`<div class="note-wrapper"><p class="note">${str}</p></div>`);
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

  eleventyConfig.addLiquidShortcode('Image', async function (src, alt) {
    if (!alt) {
      throw new Error(`Missing \`alt\` on myImage from: ${src}`);
    }

    const stats = await Image(src, {
      widths: [320, 640, 960, 1200, 1800, 2400],
      formats: ['jpeg', 'webp'],
      urlPath: '/images/',
      outputDir: './_site/images/',
    });

    const lowestSrc = stats['jpeg'][0];

    const srcset = Object.keys(stats).reduce(
      (acc, format) => ({
        ...acc,
        [format]: stats[format].reduce(
          (_acc, curr) => `${_acc} ${curr.srcset} ,`,
          ''
        ),
      }),
      {}
    );

    const source = `<source type="image/webp" data-srcset="${srcset['webp']}" >`;

    const img = `<img
      alt="${alt}"
      src="${lowestSrc.url}"
      sizes='(min-width: 1024px) 1024px, 100vw'
      srcset="${srcset["jpeg"]}"
    >`;

    return `<div class="post-page__picture"><picture>${source} ${img}</picture></div>`;
  });

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      layouts: '_layouts',
      markdownTemplateEngine: 'liquid'
    }
  };
};
