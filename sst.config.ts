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
    // Fix: Newer AWS accounts block public Lambda Function URL access by default.
    // SST only adds lambda:InvokeFunctionUrl, but AWS now requires lambda:InvokeFunction too.
    // See: https://github.com/anomalyco/sst/issues/6397
    $transform(aws.lambda.FunctionUrl, (args, opts, name) => {
      new aws.lambda.Permission(`${name}InvokePermission`, {
        action: "lambda:InvokeFunction",
        function: args.functionName,
        principal: "*",
        statementId: "FunctionURLInvokeAllowPublicAccess",
      });
    });

    // Domain is fixed per branch/project — stage is the environment (dev/prod), not the subdomain
    const domainName = "innovation.ic-ces.engineering";

    const site = new sst.aws.Nextjs("CesWeb", {
      path: "apps/web",
      domain: {
        name: domainName,
        dns: sst.aws.dns({ zone: "Z07972313GVRF4SEMXLOL" }),
      },
    });

    return {
      url: site.url,
    };
  },
});
