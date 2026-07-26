import type { CustomModule } from "../../shared/types";

export interface FormState {
  projectName: string;
  destinationPath: string;
  includePostgres: boolean;
  postgresOrm: string;
  includeMongo: boolean;
  mongoOrm: string;
  includeUsersModule: boolean;
  usersModuleLocation: "postgres" | "mongo";
  modules: CustomModule[];
  usePinoLogger: boolean;
  useHelmet: boolean;
  useRateLimiting: boolean;
}

export const initialFormState: FormState = {
  projectName: "my-nest-app",
  destinationPath: "",
  includePostgres: false,
  postgresOrm: "TypeORM",
  includeMongo: false,
  mongoOrm: "Mongoose",
  includeUsersModule: true,
  usersModuleLocation: "postgres",
  modules: [],
  usePinoLogger: true,
  useHelmet: true,
  useRateLimiting: true,
};

export type UpdateForm = (patch: Partial<FormState>) => void;
