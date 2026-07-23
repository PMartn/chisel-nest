import { Test, TestingModule } from "@nestjs/testing";
import { __PASCAL_NAME__Service } from "./__KEBAB_NAME__.service";
import { __PASCAL_NAME__Repository } from "../domain/ports/__KEBAB_NAME__-repository.port";
import { __PASCAL_NAME__ } from "../domain/models/__KEBAB_NAME__.model";
import { __PASCAL_NAME__NotFoundError } from "../domain/errors/__KEBAB_NAME__-not-found.error";

describe("__PASCAL_NAME__Service", () => {
  let service: __PASCAL_NAME__Service;
  let repository: jest.Mocked<__PASCAL_NAME__Repository>;

  beforeEach(async () => {
    const repositoryMock: jest.Mocked<__PASCAL_NAME__Repository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        __PASCAL_NAME__Service,
        { provide: __PASCAL_NAME__Repository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get(__PASCAL_NAME__Service);
    repository = module.get(__PASCAL_NAME__Repository);
  });

  it("creates a __CAMEL_NAME__ and persists it", async () => {
    repository.save.mockImplementation(async (__CAMEL_NAME__) => __CAMEL_NAME__);

    const result = await service.create({ name: "Test __PASCAL_NAME__" });

    expect(result.name).toBe("Test __PASCAL_NAME__");
    expect(result.id).toBeDefined();
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("returns a __CAMEL_NAME__ by id", async () => {
    const existing = new __PASCAL_NAME__("id-1", "Existing", new Date());
    repository.findById.mockResolvedValue(existing);

    await expect(service.findById("id-1")).resolves.toBe(existing);
  });

  it("throws when a __CAMEL_NAME__ is not found", async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById("missing")).rejects.toBeInstanceOf(
      __PASCAL_NAME__NotFoundError,
    );
  });
});
