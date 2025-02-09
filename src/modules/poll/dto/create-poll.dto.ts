export type Tally = {
  id: string;
  text: string;
  count?: number;
  voteUserAvatar?: string[];
};

export class CreatePollDto {
  id?: string;
  uid: string;
  tallies: Tally[];
  expiresAt?: number;
  postId: string;
}
