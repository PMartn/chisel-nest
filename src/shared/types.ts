export interface CustomModule {
  name: string;
  database: "postgres" | "mongo";
}

export type AuthProvider = "none" | "local" | "auth0" | "keycloak" | "clerk";

export interface GeneratorAnswers {
  projectName: string;
  destinationPath: string;
  postgresEnabled: boolean;
  postgresOrm: string;
  mongoEnabled: boolean;
  mongoOrm: string;
  usersModuleDatabase: "postgres" | "mongo" | "none";
  authProvider: AuthProvider;
  modules: CustomModule[];
  usePinoLogger: boolean;
  useHelmet: boolean;
  useRateLimiting: boolean;
}
