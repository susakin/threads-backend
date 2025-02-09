export enum MentionAuth {
  Everyone = 'everyone',
  Following = 'following',
  Nobody = 'nobody',
}

export class CreateUserDto {
  id: string;
  username: string;
  isVerified?: boolean;
  profilePicUrl?: string;
  bioLink?: string;
  rank?: number;
  createdAt?: number;
  isPrivate?: boolean;
  biography?: string;
  fullName?: string;
  password?: string;
  location?: string;
  account?: string;
  friendshipStatus?: {
    following?: boolean;
    followedBy?: boolean;
    blocking?: boolean;
    isOwn?: boolean;
    outgoingRequest?: boolean;
    isBanned?: boolean;
    blockedBy?: boolean;
  };
  profileContextFacepileUsers?: Omit<
    CreateUserDto,
    'profileContextFacepileUsers'
  >[];
  mentionAuth?: MentionAuth;
}
