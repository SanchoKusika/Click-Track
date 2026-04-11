import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AdminService {
  constructor(private readonly usersService: UsersService) {}

  listUsers() {
    return this.usersService.listAll();
  }

  listMentors() {
    return this.usersService.listMentors();
  }

  createUser(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  updateUser(id: string, dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  deleteUser(id: string) {
    return this.usersService.delete(id);
  }
}
