import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { UserServicePort } from '../../application/ports/user-service.port';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { CreateUserRequestDto } from './dto/create-user.request.dto';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UserServicePort) {}

  @Post()
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const user = await this.service.create({
      email: dto.email,
      name: dto.name,
    });
    return UserResponseDto.fromDomain(user);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.service.findAll();
    return users.map((user) => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const user = await this.service.findById(id);
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
