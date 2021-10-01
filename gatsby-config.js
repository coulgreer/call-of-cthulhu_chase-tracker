module.exports = {
  plugins: [
    `gatsby-plugin-material-ui`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Call of Cthulhu: Chase Tracker`,
        short_name: `CoC: Tracker`,
        icon: `src/images/favicon.png`,
      },
    },
  ],
  siteMetadata: {
    title: "Call of Cthulhu: Chase Tracker",
    description:
      "A utility application for keeping track of chase data in Call of Cthulhu 7th edition, a tabletop RPG.",
  },
};
