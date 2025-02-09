import { CreateUserDto } from './dto/create-user.dto';
import { User } from './schema/user.schema';
import { UserService } from './user.service';
import { Request } from 'express';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(user: CreateUserDto, req: Request): Promise<any>;
    getRecommendedUsers(page: number, pageSize: number, req: Request): Promise<{
        total: number;
        users: User[];
    }>;
    getUserById(id: string, req: Request): Promise<User>;
    findUsersByQuery(query: string, page: number, pageSize: number, req: Request): Promise<{
        total: number;
        users: User[];
    }>;
    getUserByUsername(username: string, req: Request): Promise<User>;
    updateUser(request: any, updatedFields: Partial<User>): Promise<void>;
    deleteUserByPassword(request: any, password: {
        password: string;
    }): Promise<void>;
    deleteUser(id: string): Promise<void>;
}
