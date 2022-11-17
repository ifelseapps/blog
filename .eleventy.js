const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const Image = require('@11ty/eleventy-img');
const { format } = require('date-fns');
const ruLocale = require('date-fns/locale/ru');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const embedTwitter = require('eleventy-plugin-embed-twitter');
const pluginTOC = require('eleventy-plugin-toc');
const pluginBlogTools = require('eleventy-plugin-blog-tools');
const htmlmin = require('html-minifier');
const path = require('path');


module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(embedTwitter);
  eleventyConfig.addPlugin(pluginTOC);
  eleventyConfig.addPlugin(pluginBlogTools);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addPassthroughCopy('src/robots.txt');
  eleventyConfig.addPassthroughCopy('src/css/fonts');
  eleventyConfig.addPassthroughCopy('src/images/template/**/*.(jpg|svg|png|gif|webmanifest|xml|ico)');
  eleventyConfig.addPassthroughCopy('src/scripts');

  eleventyConfig.setLiquidOptions({
    strictFilters: false,
  });

  const markdownItOptions = {
    html: true,
  };

  const markdownLib = markdownIt(markdownItOptions).use(
    markdownItAnchor,
    {
      permalink: markdownItAnchor.permalink.headerLink()
    }
  );

  eleventyConfig.setLibrary('md', markdownLib);

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if( outputPath && outputPath.endsWith(".html") ) {
      return htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
    }

    return content;
  });

  eleventyConfig.addCollection('favorite', (collection) => {
    const posts = collection.getFilteredByTag('post');
    const reversed = [...posts].reverse();
    const favorite = reversed.find(post => post.data.is_favorite);

    return [favorite];
  });

  eleventyConfig.addCollection('travels', (collection) => {
    const travels = collection.getFilteredByTag('travel');

    const groups = travels.reduce((acc, item) => {
      if (!item.data.group) {
        return acc;
      }

      acc[item.data.group] = acc[item.data.group] || [];
      acc[item.data.group].push({
        date: item.data.date_label,
        link: item.url,
      });

      return acc;
    }, {});


    travels.forEach((item) => {
      if (item.data.group) {
        item.data.years = [...groups[item.data.group]].reverse();
      }
    });

    return travels;
  });

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
            case 'travel':
            case 'travels':
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

  eleventyConfig.addLiquidFilter("encode", (url) => {
    return encodeURIComponent(url);
  });

  eleventyConfig.addLiquidFilter("reverse", (collection) => {
    return [...collection].reverse();
  });

  eleventyConfig.addFilter('date_formatted', dateObj => {
    if (!dateObj) {
      return '';
    }
    return format(dateObj, 'dd.MM.yyyy');
  });

  eleventyConfig.addFilter('date_month_year', dateObj => {
    if (!dateObj) {
      return '';
    }
    return format(dateObj, 'LLLL yyyy', { locale: ruLocale });
  });

  eleventyConfig.addFilter('date_iso', dateObj => {
    if (!dateObj) {
      return '';
    }
    return format(dateObj, 'yyyy-MM-dd');
  });

  eleventyConfig.addLiquidTag('note', function (liquidEngine) {
    return {
      parse: function (tagToken, remainingTokens) {
        this.str = tagToken.args;
      },
      render: async function (scope, hash) {
        const str = await liquidEngine.evalValue(this.str, scope);
        return Promise.resolve(`<div class="important-block"><div class="important-block__inner">${str}</div></div>`);
      }
    };
  });

  eleventyConfig.addLiquidTag('key_content', function (liquidEngine) {
    return {
      parse: function (tagToken, remainingTokens) {
        this.str = tagToken.args;
      },
      render: async function (scope, hash) {
        const str = await liquidEngine.evalValue(this.str, scope);
        return Promise.resolve(`<div class="key-content">${str}</div>`);
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

  eleventyConfig.addLiquidTag('current_year', function (liquidEngine) {
    return {
      render: function () {
        return Promise.resolve(format(new Date(), 'yyyy'));
      }
    };
  });

  eleventyConfig.addLiquidFilter('dateToRfc3339', pluginRss.dateToRfc3339);
  eleventyConfig.addLiquidFilter('absoluteUrl', pluginRss.absoluteUrl);
  eleventyConfig.addLiquidFilter('getNewestCollectionItemDate', pluginRss.getNewestCollectionItemDate);

  eleventyConfig.addLiquidShortcode('image', async function (src, alt, caption, fullWidth = 'true') {
    if (!alt) {
      throw new Error(`Missing \`alt\` on myImage from: ${src}`);
    }

    const stats = await Image(src, {
      widths: fullWidth === 'false' ? [null] : [320, 640, 960, 1200, 1800],
      formats: [null],
      urlPath: '/images/',
      outputDir: './_site/images/',
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    });

    const format = path.extname(src) === '.jpg' ? 'jpeg' : 'png';
    const lowestSrc = stats[format][0];
    const highSrc = stats[format][stats[format].length - 1];

    const srcset = Object.keys(stats).reduce(
      (acc, format) => ({
        ...acc,
        [format]: stats[format].reduce(
          (_acc, curr) => `${_acc} ${curr.srcset} ,`,
          ''
        ).slice(0, -1),
      }),
      {}
    );

    const img = fullWidth === 'true' ? `<a href="${highSrc.url}"><img
      class="full-width"
      alt="${alt}"
      src="${lowestSrc.url}"
      sizes='(min-width: 1024px) 1024px, 100vw'
      srcset="${srcset[format]}"
    ></a>` : `<img
      alt="${alt}"
      src="${lowestSrc.url}"
    >`;

    return `<figure>${img}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
  });

  eleventyConfig.addLiquidShortcode('image_preview', async function (src) {
    const stats = await Image(src, {
      widths: [1200],
      formats: ['jpeg'],
      urlPath: '/images/',
      outputDir: './_site/images/',
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      }
    });

    const data = stats['jpeg'][0];

    return `<div class="pic" style="background-image: url(${data.url})"></div>`;
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
