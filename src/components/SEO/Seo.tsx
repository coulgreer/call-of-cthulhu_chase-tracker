import * as React from "react";
import * as PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";

interface Props {
  title: string;
  description: string;
}

const Seo = ({ title, description }: Props) => {
  const query = graphql`
    query SEO {
      site {
        siteMetadata {
          defaultTitle: title
          defaultDescription: description
        }
      }
    }
  `;
  const { site } = useStaticQuery(query);
  const { defaultTitle, defaultDescription } = site.siteMetadata;
  const seo = {
    title: defaultTitle || title,
    description: defaultDescription || description,
  };

  return (
    <Helmet title={seo.title}>
      <html lang="en" />
      <meta name="description" content={seo.description} />
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined"
        rel="stylesheet"
      />
    </Helmet>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};

Seo.defaultProps = {
  title: null,
  description: null,
};

export default Seo;
