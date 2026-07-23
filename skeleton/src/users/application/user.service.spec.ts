import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from '../domain/ports/user-repository.port';
import { User } from '../domain/models/user.model';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const repositoryMock: jest.Mocked<UserRepository> = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get(UserService);
    repository = module.get(UserRepository);
  });

  it('creates a user and persists it', async () => {
    repository.save.mockImplementation(async (user) => user);

    const result = await service.create({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('Test User');
    expect(result.id).toBeDefined();
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('returns a user by id', async () => {
    const existing = new User('id-1', 'a@b.com', 'Existing', new Date());
    repository.findById.mockResolvedValue(existing);

    await expect(service.findById('id-1')).resolves.toBe(existing);
  });

  it('throws when a user is not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      UserNotFoundError,
    );
  });
});
