export interface CustomModule {
  name: string;
  database: "postgres" | "mongo";
}

export interface GeneratorAnswers {
  projectName: string;
  destinationPath: string;
  postgresEnabled: boolean;
  postgresOrm: string;
  mongoEnabled: boolean;
  mongoOrm: string;
  usersModuleDatabase: "postgres" | "mongo" | "none";
  modules: CustomModule[];
  usePinoLogger: boolean;
  useHelmet: boolean;
  useRateLimiting: boolean;
}
