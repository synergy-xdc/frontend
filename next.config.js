/** @type {import('next').NextConfig} */

const withLess = require("next-with-less");


module.exports = withLess({
  eslint: {
    ignoreDuringBuilds: true,  // todo
  },
  typescript: {
    ignoreBuildErrors: true,  // todo
  },
  lessLoaderOptions: {},
});
