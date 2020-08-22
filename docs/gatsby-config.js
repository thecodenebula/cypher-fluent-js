module.exports = {
  siteMetadata: {
    siteTitle: `Cypher Fluent JS`,
    defaultTitle: `Cypher Fluent JS`,
    siteTitleShort: `cypher-fluent-js`,
    siteDescription: `A simple fluent library to build cypher queries`,
    siteUrl: `https://cypher-fluent-js.netlify.com`,
    siteAuthor: `@thecodenebula`,
    siteLanguage: `en`,
    siteImage: '',
    themeColor: `#7159c1`,
    basePath: `/`,
    footer: `Theme by Rocketseat`,
  },
  plugins: [
    {
      resolve: `@rocketseat/gatsby-theme-docs`,
      options: {
        configPath: `src/config`,
        docsPath: `src/docs`,
        githubUrl: `https://github.com/thecodenebula/cypher-fluent-js`,
        baseDir: `docs/`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Rocketseat Gatsby Themes`,
        short_name: `RS Gatsby Themes`,
        start_url: `/`,
        background_color: `#ffffff`,
        display: `standalone`,
        // icon: `static/favicon.png`,
      },
    },
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // trackingId: ``,
      },
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://cypher-fluent-js.netlify.com`,
      },
    },
    `gatsby-plugin-offline`,
  ],
};
