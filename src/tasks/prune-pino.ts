import * as path from "path";
import { Project, SyntaxKind } from "ts-morph";
import {
  pruneDependencies,
  removeImportBySpecifier,
} from "./utils/prune-helpers";

export async function prunePinoLogger(projectRoot: string) {
  console.log("✂️  Starting Pino Logger pruning operation...");

  await pruneDependencies(projectRoot, [
    "pino-nestjs",
    "pino-http",
    "pino-pretty",
  ]);

  const project = new Project();

  const appModuleFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/app.module.ts"),
  );
  removeImportBySpecifier(appModuleFile, "pino-nestjs");

  const appModuleClass = appModuleFile.getClass("AppModule");
  const moduleDecorator = appModuleClass?.getDecorator("Module");
  if (moduleDecorator) {
    const decoratorArg = moduleDecorator
      .getArguments()[0]
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    const importsProperty = decoratorArg
      ?.getProperty("imports")
      ?.asKind(SyntaxKind.PropertyAssignment);
    const importsArray = importsProperty?.getInitializerIfKind(
      SyntaxKind.ArrayLiteralExpression,
    );

    if (importsArray) {
      importsArray.getElements().forEach((element) => {
        if (element.getText().startsWith("LoggerModule")) {
          importsArray.removeElement(element);
        }
      });
    }
  }

  const mainFile = project.addSourceFileAtPath(
    path.join(projectRoot, "src/main.ts"),
  );
  removeImportBySpecifier(mainFile, "pino-nestjs");

  const bootstrapFn = mainFile.getFunction("bootstrap");
  if (bootstrapFn) {
    const useLoggerStatement = bootstrapFn.getStatement((s) =>
      s.getText().includes("app.useLogger"),
    );
    if (useLoggerStatement) {
      useLoggerStatement.remove();
    }

    const createCall = bootstrapFn
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .find((call) => call.getExpression().getText() === "NestFactory.create");

    if (createCall && createCall.getArguments().length > 1) {
      createCall.removeArgument(1);
    }
  }

  await project.save();
  console.log("  └─ TS source files scrubbed of Pino Logger references.");
}
