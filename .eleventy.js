const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const Image = require('@11ty/eleventy-img');
const { format } = require('date-fns');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');


module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/css/fonts');
  eleventyConfig.addPassthroughCopy('src/images');
  eleventyConfig.addPassthroughCopy('src/scripts');

  const markdownItOptions = {
    html: true,
  };

  const markdownItAnchorOptions = {
    permalink: true,
    permalinkSymbol: '#'
  };

  const markdownLib = markdownIt(markdownItOptions).use(
    markdownItAnchor,
    markdownItAnchorOptions
  );

  eleventyConfig.setLibrary('md', markdownLib);

  eleventyConfig.addCollection('tags', function (collection) {
    let tagSet = new Set();
    const count = {};
    collection.getAll().forEach(function (item) {
      if ('tags' in item.data) {
        let tags = item.data.tags;

        tags.forEach(t => count[t] = (count[t] || 0) + 1);

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

    return [...tagSet].map(t => ({ name: t, count: count[t] }));
  });

  eleventyConfig.addFilter('dateFormatted', dateObj => {
    if (!dateObj) {
      return '';
    }
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

  eleventyConfig.addLiquidFilter('dateToRfc3339', pluginRss.dateToRfc3339);
  eleventyConfig.addLiquidFilter('absoluteUrl', pluginRss.absoluteUrl);
  eleventyConfig.addLiquidFilter('getNewestCollectionItemDate', pluginRss.getNewestCollectionItemDate);

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
    const highSrc = stats['jpeg'][stats['jpeg'].length - 1];

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

    const img = `<a href="${highSrc.url}"><img
      alt="${alt}"
      src="${lowestSrc.url}"
      sizes='(min-width: 1024px) 1024px, 100vw'
      srcset="${srcset['jpeg']}"
    ></a>`;

    return `<div class="post-page__picture"><picture>${source} ${img}</picture></div>`;
  });

  eleventyConfig.addLiquidShortcode('quote', function (quote, author, position, link) {
    const authorHtml = link && link.length
      ? `<a target="_blank" href="${link}">${author}</a>`
      : author;
    const parts = [
      `<blockquote><p>${quote}</p><footer>`,
      authorHtml
    ];

    if (position) {
      parts.push(
        `, <span>${position}</span>`
      );
    }

    parts.push('</footer></blockquote>');

    return parts.join('');
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
