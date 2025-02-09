import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class SecurityGuard implements CanActivate {
    constructor();
    canActivate(context: ExecutionContext): Promise<boolean>;
}
