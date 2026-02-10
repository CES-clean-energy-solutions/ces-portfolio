/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ces-web",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    const site = new sst.aws.Nextjs("CesWeb", {
      path: "apps/web",
    });

    return {
      url: site.url,
    };
  },
});
