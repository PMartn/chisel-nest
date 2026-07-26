import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";

export async function updateSwaggerMetadata(
  projectRoot: string,
  projectName: string,
) {
  console.log(
    `📝 Updating Swagger metadata with project name: "${projectName}"...`,
  );

  const project = new Project();
  const mainFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/main.ts"),
  );

  const setupSwaggerFn = mainFile.getFunction("setupSwagger");
  if (!setupSwaggerFn) {
    console.log("  ⚠️  Could not find setupSwagger function in main.ts");
    return;
  }

  const titleCall = setupSwaggerFn
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => call.getExpression().getText().endsWith(".setTitle"));

  if (titleCall) {
    // @ts-ignore
    titleCall.getArguments()[0].replaceWithText(`'${projectName} API'`);
  }

  const descCall = setupSwaggerFn
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => call.getExpression().getText().endsWith(".setDescription"));

  if (descCall) {
    // @ts-ignore
    descCall
      .getArguments()[0]
      .replaceWithText(
        `'The ${projectName} API.'`,
      );
  }

  await project.save();
  console.log("  └─ Swagger metadata successfully synchronized.");
}
