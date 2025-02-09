import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { CreatePostDto, ReplyAuth, TextEntity } from './dto/create-post.dot';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from 'src/modules/user/user.service';
import { ActivityService } from 'src/modules/activity/activity.service';
import ShortUniqueId from 'short-unique-id';
import { LikeService } from '../like/like.service';
import { RepostService } from '../repost/repost.service';
import { pick } from 'lodash';
import { UserRelationService } from '../user-relation/user-relation.service';
import { QuoteService } from '../quote/quote.service';
import { HidePostService } from '../hide-post/hide-post.service';
import { PollService } from '../poll/poll.service';
import { SavePostService } from '../save-post/save-post.service';
import { TagService } from '../tag/tag.service';
import { ViewService } from '../view/view.service';

const uuid = new ShortUniqueId({ length: 11 });

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @Inject(forwardRef(() => UserRelationService))
    private readonly userRelationService: UserRelationService,
    @Inject(forwardRef(() => LikeService))
    private readonly likeService: LikeService,
    @Inject(forwardRef(() => RepostService))
    private readonly repostService: RepostService,
    @Inject(forwardRef(() => QuoteService))
    private readonly quoteService: QuoteService,
    @Inject(forwardRef(() => ActivityService))
    private readonly activityService: ActivityService,
    @Inject(forwardRef(() => HidePostService))
    private readonly hidePostService: HidePostService,
    @Inject(forwardRef(() => PollService))
    private readonly pollService: PollService,
    @Inject(forwardRef(() => SavePostService))
    private readonly savePostService: SavePostService,
    @Inject(forwardRef(() => TagService))
    private readonly tagService: TagService,
    @Inject(forwardRef(() => ViewService))
    private readonly viewService: ViewService,
  ) {}

  async isPostBanned(
    post: Post,
    currentUid: string,
    allowedMentionUsers: any[],
  ) {
    const user = await this.userService.findUserById(post.uid, currentUid);
    return (
      user?.friendshipStatus?.isBanned ||
      (post?.replyAuth === 'followedBy' &&
        !user?.friendshipStatus?.followedBy &&
        !user?.friendshipStatus?.isOwn) ||
      (post?.replyAuth === 'mention' &&
        !allowedMentionUsers.some((item) => item?.id === currentUid) &&
        !user?.friendshipStatus?.isOwn)
    );
  }

  private getMentionUser(caption: string = '') {
    const pattern = /@(\w+)\b/g;
    const matchedUsers = Array.from(new Set(caption.match(pattern))).map(
      (match) => match.replace('@', '').trim(),
    );
    return matchedUsers;
  }

  createTag(textEntities: TextEntity[], currentUid: string) {
    textEntities
      ?.filter((item) => item.type === 'tag')
      .map((item) => {
        this.tagService.create(
          {
            displayText: item.displayText,
          },
          currentUid,
        );
      });
  }

  //获取格式化的caption和提及用户
  async getMentionUserAndCaption(
    caption: string = '',
    currentUid: string = '',
  ) {
    const mentionUsers = this.getMentionUser(caption);
    const allowedMentionUsers = [];
    for (let mentionUser of mentionUsers) {
      try {
        const user = await this.userService.findOneByUsername(
          mentionUser,
          currentUid,
        );
        if (
          user?.mentionAuth === 'everyone' ||
          (user?.mentionAuth === 'following' &&
            !user?.friendshipStatus?.isBanned &&
            user?.friendshipStatus.followedBy)
        ) {
          allowedMentionUsers.push(user);
        } else {
          caption = caption.replace(
            new RegExp(`@${mentionUser}`, 'g'),
            mentionUser,
          );
        }
      } catch (e) {}
    }
    return { caption, allowedMentionUsers };
  }

  private async createMentionActivity(post: Post, matchedUsers: string[]) {
    const caption = post?.caption;
    if (!caption) return;
    for (const username of matchedUsers) {
      const user = await this.userService.findOneByUsername(username, '');
      if (user) {
        const activityDto = {
          type: 'mention' as any,
          from: post.uid,
          to: user.id,
          postCode: post.code,
          relatePostId: post.id,
        };
        this.activityService.create(activityDto);
      }
    }
  }

  //首条串文的activity
  private async createFirstPostActivity(post: Post) {
    const followerUids = await this.userRelationService.getFollowerUids(
      post?.uid,
      { skip: 0, limit: 10000 },
    );
    followerUids?.forEach((uid) => {
      const activityDto = {
        type: 'firstPost' as any,
        from: post.uid,
        to: uid,
        postCode: post.code,
      };
      this.activityService.create(activityDto);
    });
  }

  async createPost(post: CreatePostDto): Promise<Post> {
    const allowedFields = [
      'caption',
      'medias',
      'replyToPostId',
      'uid',
      'quotedPostId',
      'replyAuth',
      'poll',
      'textEntities',
    ];
    const createPost = pick(post, allowedFields) as Partial<Post>;
    createPost.code = uuid.rnd();
    createPost.id = uuidv4();
    const { replyToPostId, poll, uid, id, textEntities, quotedPostId } =
      createPost;
    const { caption, allowedMentionUsers } =
      await this.getMentionUserAndCaption(post?.caption, uid);

    //判断是否有引用权限
    if (quotedPostId) {
      const quotedPost = await this.findPostById(quotedPostId, uid);
      const isBanned = await this.isPostBanned(
        quotedPost,
        uid,
        allowedMentionUsers,
      );
      if (isBanned) {
        throw new Error('Insufficient permissions');
      }
    }

    let replyToPost;
    if (replyToPostId) {
      replyToPost = await this.findPostById(replyToPostId, uid);
      const owner = await this.userService.findUserById(uid);
      const relation = await this.userRelationService.getUserFriendshipStatus(
        replyToPost?.uid,
        uid,
      );
      const isBanned = await this.isPostBanned(
        replyToPost,
        uid,
        allowedMentionUsers,
      );
      if (
        isBanned ||
        (owner.isPrivate && !relation?.followedBy && !relation.isOwn)
      ) {
        //私密主页只能回复自己的粉丝
        throw new Error('Insufficient permissions');
      }
    } else {
      //判断是否是第一条帖子
      const post = await this.postModel.findOne({
        uid,
        replyToPostId: { $exists: false },
      });
      if (!post) {
        createPost.isFirst = true;
      }
    }
    const createdPost = await this.postModel.create({ ...createPost, caption });
    //如果是首条推文发送给粉丝通知
    if (createdPost.isFirst) {
      this.createFirstPostActivity(createdPost);
    }
    //投票
    if (poll) {
      const _poll = await this.pollService.create({ ...poll, uid, postId: id });
      createdPost.pollId = _poll.id;
      await createdPost.save();
    }

    this.createTag(textEntities, uid);

    //回复帖子
    if (replyToPost) {
      await this.incrementCommentCount(replyToPostId);
      const replyToUid = replyToPost.uid;
      createdPost.replyToUid = replyToUid;
      await createdPost.save();
      if (post.uid !== replyToUid) {
        const activityDto = {
          type: 'reply' as any,
          from: post.uid,
          to: replyToUid,
          postCode: createdPost.code,
          relatePostId: replyToPost.id,
        };
        this.activityService.create(activityDto);
      }
    }

    this.createMentionActivity(createdPost, allowedMentionUsers);

    if (createdPost.quotedPostId) {
      this.quoteService.createQuote({
        uid: createPost.uid,
        postId: createPost.quotedPostId,
        quoteToPostId: createPost.id,
      });
    }
    return await this.mergePostInfo(createdPost, createdPost.uid);
  }

  //判断用户首页是否pinned了
  async getUserPinned(uid: string) {
    const post = await this.postModel.findOne({ uid, isPinnedToProfile: true });
    return !!post;
  }

  //判断post comment是否有pinned
  async getPostCommentPinned(id: string) {
    const post = await this.postModel.findOne({
      replyToPostId: id,
      isPinnedToComment: true,
    });
    return !!post;
  }

  async updatePostReplyAuth(id: string, replyAuth: ReplyAuth) {
    const post = await this.postModel.findOne({ id });
    if (!post) {
      throw new Error('post not found');
    }
    const replyAuthEnum = ['everyone', 'followedBy', 'mention'];
    if (!replyAuthEnum.includes(replyAuth)) {
      throw new Error('replyAuthType not supported');
    }
    const updatePost = await this.postModel
      .findOneAndUpdate({ id }, { replyAuth }, { new: true })
      .exec();
    return updatePost;
  }

  async findPostById(id: string, currentUid?: string): Promise<Post> {
    const post = await this.postModel.findOne({ id });
    if (!currentUid) {
      return post;
    }
    const mergePost = await this.mergePostInfo(post, currentUid);
    return mergePost;
  }

  async findPostByCode(code: string, currentUid: string): Promise<Post> {
    const post = await this.postModel.findOne({ code });
    const mergePost = await this.mergePostInfo(post, currentUid);
    return mergePost;
  }

  async findReplyUsersProfilePicUrl(id: string): Promise<any> {
    // 找到该帖子下最新的三条评论的用户头像信息
    const posts = await this.postModel
      .aggregate([
        { $match: { replyToPostId: id } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$uid', latestPost: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$latestPost' } },
        { $limit: 3 },
      ])
      .exec();
    const profilePicUrls = await Promise.all(
      posts.map(async (post) => {
        const user = await this.userService.findUserById(post.uid);
        return user.profilePicUrl;
      }),
    );
    return profilePicUrls;
  }

  async checkIsPostOwner(id: string, uid: string): Promise<boolean> {
    const post = await this.findPostById(id, uid); // 从数据库中查找帖子信息
    return post?.user?.id === uid;
  }

  async updatePost(id: string, updatedFields: Partial<Post>): Promise<Post> {
    const post = await this.postModel.findOne({ id }).exec();
    const allowedFields = ['caption', 'medias', 'poll', 'textEntities'];
    const _updatedFields = pick(updatedFields, allowedFields) as Partial<Post>;
    if (post && post.createdAt > Date.now() - 5 * 60 * 1000) {
      //5分钟内才允许编辑
      const updatedPost = await this.postModel
        .findOneAndUpdate(
          { id },
          {
            $set: {
              ..._updatedFields,
              captionIsEdited: true,
            },
          },
          { new: true },
        )
        .exec();
      return updatedPost;
    } else {
      throw new Error('Cannot update post after 5 minutes of creation');
    }
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postModel.findOne({ id }).exec();
    if (post) {
      await this.postModel.deleteOne({ id });
      this.likeService.deletePostLikes(id);
      this.repostService.deletePostReposts(id);
      this.activityService.deleteActivitiesByPostCode(post.code);
      //await this.quoteService.deleteQuotes(id);
      this.hidePostService.deleteByPostId(id, post.uid);
      this.viewService.deleteByPostId(id);
      if (post.replyToPostId) {
        this.decrementCommentCount(post.replyToPostId);
      }
      if (post.pollId) {
        this.pollService.deleteById(post.pollId);
      }
      //await this.deleteRepliesById(post.id);
    }
  }

  async deleteRepliesById(replyToPostId: string): Promise<void> {
    const replies = await this.postModel.find({ replyToPostId }).exec();
    for (const reply of replies) {
      await this.deletePost(reply.id);
    }
  }

  async deletePostsByUid(uid: string): Promise<void> {
    const userPosts = await this.postModel.find({ uid }).exec();
    for (const post of userPosts) {
      await this.deletePost(post.id);
    }
  }

  async findPostWithQuotedPostById(
    id: string,
    currentUid: string,
  ): Promise<any> {
    const post = await this.postModel.findOne({ id }).exec();

    if (!post) {
      return null;
    }
    const {
      //replyUsersProfilePicUrl,
      user,
      isLikedByViewer,
      isRepostedByViewer,
      replyToUser,
      poll,
      isUnavailable,
      canReply,
    } = await this.getPostDetail(post, currentUid);

    if (isUnavailable) {
      return {
        id: post.id,
        isUnavailable,
      };
    }

    let quotedPost = null;
    quotedPost = await this.postModel.findOne({ id: post.quotedPostId }).exec();
    if (post.quotedPostId && quotedPost) {
      const {
        //replyUsersProfilePicUrl,
        user,
        isLikedByViewer,
        isRepostedByViewer,
        replyToUser,
        isUnavailable,
        poll,
        canReply,
      } = await this.getPostDetail(quotedPost, currentUid);
      quotedPost = isUnavailable
        ? { id: quotedPost.id, isUnavailable }
        : Object.assign(quotedPost, {
            user,
            //replyUsersProfilePicUrl,
            isLikedByViewer,
            isRepostedByViewer,
            replyToUser,
            poll,
            canReply,
          });
    }
    return Object.assign(post, {
      quotedPost,
      //replyUsersProfilePicUrl,
      user,
      isLikedByViewer,
      isRepostedByViewer,
      replyToUser,
      poll,
      canReply,
    });
  }

  private async getPostDetail(post: Post, currentUid: string) {
    const { id, uid, quotedPostId, replyToUid, pollId, caption } = post;
    const { allowedMentionUsers } = await this.getMentionUserAndCaption(
      caption,
      currentUid,
    );
    const isBanned = await this.isPostBanned(
      post,
      currentUid,
      allowedMentionUsers,
    );
    const user = await this.userService.findUserById(uid, currentUid);
    if (user?.friendshipStatus?.isBanned) {
      return {
        isUnavailable: true,
      };
    }

    const poll = await this.pollService.findOne(pollId, currentUid, isBanned);

    const quotedPost = quotedPostId
      ? await this.findPostWithQuotedPostById(quotedPostId, currentUid)
      : null;

    //const replyUsersProfilePicUrl = await this.findReplyUsersProfilePicUrl(id);
    let replyToUser;
    if (replyToUid) {
      replyToUser = await this.userService.findUserById(replyToUid, currentUid);
    }
    const isLikedByViewer = await this.likeService.postIsLikedByUser(
      id,
      currentUid,
    );
    const isRepostedByViewer = await this.repostService.isRepostedByUser(
      id,
      currentUid,
    );
    const isHiddenByViewer = await this.hidePostService.isHiddenPost(
      id,
      currentUid,
    );

    const isSavedByViewer = await this.savePostService.postIsSavedByUser(
      id,
      currentUid,
    );
    const isViewedByViewer = await this.viewService.getByPostIdAndUid(
      id,
      currentUid,
    );

    const viewCount = await this.viewService.getViewCount(id);

    return {
      quotedPost,
      //replyUsersProfilePicUrl,
      user,
      viewCount,
      replyToUser,
      isLikedByViewer,
      isRepostedByViewer,
      isHiddenByViewer,
      poll,
      isSavedByViewer,
      canReply: !isBanned,
      isViewedByViewer,
    };
  }

  async mergePostInfo(post: Post, currentUid: string): Promise<any> {
    if (!post) {
      return null;
    }

    const { likeAndViewCountDisabled, likeCount } = post;
    const { isUnavailable, viewCount, ...rest } = await this.getPostDetail(
      post,
      currentUid,
    );

    if (isUnavailable) {
      return {
        id: post.id,
        isUnavailable,
      };
    }
    return Object.assign(post, {
      //replyUsersProfilePicUrl,
      ...rest,
      viewCount: likeAndViewCountDisabled ? 0 : viewCount,
      likeCount: likeAndViewCountDisabled ? (likeCount > 0 ? 1 : 0) : likeCount,
    });
  }

  async findPostsByUid(
    uid: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; posts: any }> {
    const skip = (page - 1) * pageSize;
    const filter = this.getBannedFilter(currentUid, {
      uid,
      replyToPostId: { $exists: false },
    });

    const [posts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { isPinnedToProfile: -1, createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        let ownChildPost = await this.postModel.findOne({
          uid,
          replyToUid: uid,
          replyToPostId: post.id,
        });
        if (ownChildPost) {
          ownChildPost = await this.mergePostInfo(ownChildPost, currentUid);
        }
        return ownChildPost ? [mergePost, ownChildPost] : [mergePost];
      }),
    );

    return { total: total?.[0]?.total, posts: postsWithUserInfo as any };
  }

  async incrementLikeCount(id: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { id },
        {
          $inc: {
            likeCount: 1,
          },
        },
        { new: true },
      )
      .exec();
    return updatedPost;
  }

  async incrementCommentCount(id: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { id },
        {
          $inc: {
            commentCount: 1,
          },
        },
        { new: true },
      )
      .exec();
    return updatedPost;
  }

  async incrementRepostCount(id: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { id },
        {
          $inc: {
            repostCount: 1,
          },
        },
        { new: true },
      )
      .exec();
    return updatedPost;
  }

  async decrementLikeCount(id: string): Promise<Post> {
    const post = await this.postModel.findOne({ id });
    if (!post) {
      throw new Error('Post not found');
    }

    // 检查点赞数是否大于 0
    if (post.likeCount > 0) {
      // 递减点赞数
      const updatedPost = await this.postModel
        .findOneAndUpdate(
          { id },
          {
            $inc: {
              likeCount: -1,
            },
          },
          { new: true },
        )
        .exec();
      return updatedPost;
    } else {
      // 如果点赞数已经为 0，则不进行递减操作，直接返回当前帖子信息
      return post;
    }
  }

  async decrementRepostCount(id: string): Promise<Post> {
    const post = await this.postModel.findOne({ id });
    if (!post) {
      throw new Error('Post not found');
    }

    // 检查点赞数是否大于 0
    if (post.repostCount > 0) {
      // 递减点赞数
      const updatedPost = await this.postModel
        .findOneAndUpdate(
          { id },
          {
            $inc: {
              repostCount: -1,
            },
          },
          { new: true },
        )
        .exec();
      return updatedPost;
    } else {
      // 如果点赞数已经为 0，则不进行递减操作，直接返回当前帖子信息
      return post;
    }
  }

  async decrementCommentCount(id: string): Promise<Post> {
    const post = await this.postModel.findOne({ id }).exec();
    if (post && post.commentCount > 0) {
      const updatedPost = await this.postModel
        .findOneAndUpdate(
          { id },
          {
            $inc: { commentCount: -1 },
          },
          { new: true },
        )
        .exec();
      return updatedPost;
    } else {
      // 可以根据业务需求选择在commentCount为零时的处理方式
      return post; // 或者返回null或者抛出错误
    }
  }

  async findPostChildChainById(id: string, currentUid: string) {
    let post = await this.postModel.findOne({ id }).exec();
    const list = [];
    if (post) {
      list.push(post);
      const total = await this.postModel.countDocuments({
        replyToPostId: post.id,
      });
      while (post && total === 1) {
        post = await this.postModel.findOne({ replyToPostId: post.id }).exec();
        post && list.push(post);
      }
    }
    const fullList = await Promise.all(
      list.map((post) => this.mergePostInfo(post, currentUid)),
    );
    return fullList;
  }

  async findPostParentChainByCode(
    code: string,
    currentUid: string,
  ): Promise<Post[]> {
    const list = [];
    let currentPost = await this.postModel.findOne({ code }).exec();
    if (currentPost) {
      list.push(currentPost);
      while (currentPost && currentPost.replyToPostId) {
        currentPost = await this.postModel
          .findOne({ id: currentPost.replyToPostId })
          .exec();
        list.unshift(currentPost);
      }
    }

    const fullList = await Promise.all(
      list.map((post) => this.mergePostInfo(post, currentUid)),
    );
    return fullList;
  }

  //获取post的回复
  async findReplyPostsById(
    postId: string,
    currentUid,
    page: number,
    pageSize: number,
    excludePostCode?: string,
  ): Promise<any> {
    const filter = this.getBannedFilter(
      currentUid,
      {
        replyToPostId: postId,
        code: { $ne: excludePostCode },
      },
      true,
    );

    const skip = (page - 1) * pageSize;
    const [replyPosts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { isPinnedToComment: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    const posts = await Promise.all(
      replyPosts.map((post) =>
        this.findPostChildChainById(post.id, currentUid),
      ),
    );

    return { posts, total: total?.[0]?.total };
  }

  async pinToProfile(id: string): Promise<Post> {
    const postToPin = await this.postModel.findOne({ id });

    if (postToPin.replyToPostId) {
      throw new Error('Cannot pin a post with a non-null replyToPostId value');
    }

    // 取消同一uid下面的其他post的置顶状态
    await this.postModel
      .findOneAndUpdate(
        { isPinnedToProfile: true, uid: postToPin.uid },
        { isPinnedToProfile: false },
      )
      .exec();

    // 置顶指定的帖子
    postToPin.isPinnedToProfile = true;
    await postToPin.save();

    return postToPin;
  }

  async unpinToComment(postId: string, currentUid) {
    const post = await this.postModel.findOne({ id: postId });
    if (post.replyToUid !== currentUid) {
      throw new Error('not allowed');
    }

    post.isPinnedToComment = false;
    await post.save();

    return post;
  }

  async pinToComment(postId: string, currentUid) {
    const post = await this.postModel.findOne({ id: postId });
    if (post.replyToUid !== currentUid) {
      throw new Error('not allowed');
    }
    await this.postModel.findOneAndUpdate(
      { replyToPostId: post.replyToPostId, isPinnedToComment: true },
      { isPinnedToComment: false },
    );

    post.isPinnedToComment = true;
    await post.save();

    return post;
  }

  async unpinToProfile(id: string): Promise<Post> {
    // 取消指定帖子的置顶状态
    const updatedPost = await this.postModel
      .findOneAndUpdate(
        { id, isPinnedToProfile: true },
        { isPinnedToProfile: false },
        { new: true },
      )
      .exec();

    return updatedPost;
  }

  async updateLikeAndviewtsDisabled(
    id: string,
    likeAndViewCountDisabled: boolean,
  ): Promise<Post> {
    // 更新指定帖子的 likeAndViewCountDisabled 字段
    const updatedPost = await this.postModel
      .findOneAndUpdate({ id }, { likeAndViewCountDisabled }, { new: true })
      .exec();

    return updatedPost;
  }

  //获取用户的回复
  async findRepliesByUid(
    uid: string,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; posts: any[] }> {
    const skip = (page - 1) * pageSize;
    const filter = this.getBannedFilter(currentUid, {
      uid,
      replyToPostId: { $ne: null },
      replyToUid: { $ne: uid },
    });

    const [posts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);
    const replies = await Promise.all(
      posts.map((post) =>
        Promise.all([
          this.findPostById(post.replyToPostId, currentUid),
          this.mergePostInfo(post, currentUid),
        ]),
      ),
    );

    return { total: total?.[0]?.total, posts: replies };
  }

  async findFollowingPosts(
    currentUid,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; posts: any }> {
    const skip = (page - 1) * pageSize;

    // 假设存在一个包含被关注用户 UID 的 following 数组字段的用户模型
    const followingUids = await this.userRelationService.getFollowingUids(
      currentUid,
      { skip: 0, limit: 10000 },
    );
    const followingReposts = await this.repostService.getFollowingRepost(
      followingUids,
      currentUid,
    );
    const followingRepostsIds = followingReposts?.map(
      (repost) => repost.postId,
    );

    const filter = this.getBannedFilter(
      currentUid,
      {
        $or: [
          { uid: { $in: followingUids } }, // Original posts by followed users
          { id: { $in: followingRepostsIds } }, // Reposted posts by followed users
        ],
        replyToPostId: { $exists: false },
      },
      true,
    );

    const [posts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        const repostedPost = followingReposts?.find?.(
          (post) => post.postId === mergePost?.id,
        );
        if (repostedPost) {
          const user = await this.userService.findUserById(
            repostedPost.uid,
            currentUid,
          );
          mergePost.repostedBy = {
            createdAt: repostedPost.createdAt,
            user,
          };
        }
        return mergePost;
      }),
    );

    return { total: total?.[0]?.total, posts: postsWithUserInfo as any };
  }

  async findFollowingPostsAfterId(
    currentUid: string,
    id: string,
    pageSize: number,
  ): Promise<{ posts: any }> {
    if (!id) {
      const { posts } = await this.findFollowingPosts(currentUid, 1, 10);
      return { posts };
    }

    const post = await this.postModel.findOne({ id });
    if (!post) {
      throw new Error('post not found');
    }

    // 假设存在一个包含被关注用户 UID 的 following 数组字段的用户模型
    const followingUids = await this.userRelationService.getFollowingUids(
      currentUid,
      { skip: 0, limit: 10000 },
    );

    const posts = await this.postModel
      .find({
        createdAt: { $gt: post.createdAt },
        uid: { $in: followingUids },
        replyToPostId: { $exists: false },
      }) // 查询创建时间大于给定活动记录的创建时间的记录，并根据需要过滤类型
      .sort({ createdAt: -1 })
      .limit(pageSize) // 限制返回的记录数为 pageSize
      .exec();

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
      }),
    );
    return { posts: postsWithUserInfo };
  }

  private getBannedFilter(currentUid, extra = {}, hasMuting = false) {
    const muting = {
      '_userRelation.muting': { $ne: true },
    };
    return [
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: 'id',
          as: '_user',
        },
      },
      {
        $lookup: {
          from: 'userrelations',
          let: { postUid: '$uid', currentUid },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetUid', '$$currentUid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$postUid'] }, // 匹配当前用户ID
                  ],
                },
              },
            },
          ],
          as: 'userRelation',
        },
      },
      {
        $lookup: {
          from: 'userrelations',
          let: { postUid: '$uid', currentUid },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$targetUid', '$$postUid'] }, // 匹配用户关系中的目标用户ID与帖子的用户ID
                    { $eq: ['$uid', '$$currentUid'] }, // 匹配当前用户ID
                  ],
                },
              },
            },
          ],
          as: '_userRelation',
        },
      },
      {
        $match: {
          $and: [
            {
              ...extra,
              'userRelation.blocking': { $ne: true },
              '_userRelation.blocking': { $ne: true },
              ...(hasMuting ? muting : {}),
            },
            {
              $or: [
                {
                  '_user.isPrivate': false,
                },
                {
                  $and: [
                    { uid: { $ne: '$currentUid' } },
                    { '_user.isPrivate': true },
                    { '_userRelation.following': true },
                  ],
                },
                {
                  uid: currentUid,
                },
              ],
            },
          ],
        },
      },
    ];
  }

  async findTimelinePosts(
    currentUid,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; posts: any }> {
    const skip = (page - 1) * pageSize;
    const filter = this.getBannedFilter(
      currentUid,
      {
        replyToPostId: { $exists: false },
      },
      true,
    );

    const [posts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    const _posts = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
      }),
    );

    return { total: total?.[0]?.total || 0, posts: _posts as any };
  }

  async getReplyAfterId(
    currentUid: string,
    id: string,
    replyId: string,
    pageSize: number,
  ): Promise<{ posts: any }> {
    if (!replyId) {
      const { posts } = await this.findReplyPostsById(
        id,
        currentUid,
        1,
        pageSize,
        id,
      );
      return { posts };
    }

    const post = await this.postModel.findOne({ id });
    if (!post) {
      return { posts: [] };
    }
    const commentPost = await this.postModel.findOne({ id: replyId });
    if (!commentPost) {
      return { posts: [] };
    }

    const filter = this.getBannedFilter(
      currentUid,
      {
        replyToPostId: id,
        createdAt: { $gt: commentPost.createdAt },
      },
      true,
    );

    const [replyPosts] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: +pageSize,
        },
      ]),
    ]);

    const posts = await Promise.all(
      replyPosts.map((post) =>
        this.findPostChildChainById(post.id, currentUid),
      ),
    );

    return { posts };
  }

  async findTimeLinePostsAfterId(
    currentUid: string,
    id: string,
    pageSize: number,
  ): Promise<{ posts: any }> {
    if (!id) {
      const { posts } = await this.findTimelinePosts(currentUid, 1, pageSize);
      return { posts };
    }
    const post = await this.postModel.findOne({ id });
    if (!post) {
      return { posts: [] };
    }

    const filter = this.getBannedFilter(
      currentUid,
      {
        replyToPostId: { $exists: false },
        createdAt: { $gt: post.createdAt },
      },
      true,
    );

    const [posts] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: { createdAt: -1 },
        },
        {
          $limit: +pageSize,
        },
      ]),
    ]);

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
      }),
    );

    return { posts: postsWithUserInfo as any };
  }

  async findPostsByQuery(
    query: Record<string, string>,
    currentUid: string,
    page: number,
    pageSize: number,
  ): Promise<{ total: number; posts: any }> {
    const skip = (page - 1) * pageSize;

    if (!query) {
      return { total: 0, posts: [] };
    }
    let queryFiler = {};
    if (query.caption) {
      queryFiler = {
        caption: { $regex: query.caption?.trim(), $options: 'i' },
      };
    }
    if (query.tag) {
      queryFiler = {
        textEntities: {
          $elemMatch: {
            type: 'tag',
            displayText: query.tag, // search for tag in displayText
          },
        },
      };
    }
    const filter = this.getBannedFilter(
      currentUid,
      {
        ...queryFiler,
        //replyToPostId: { $exists: false },
      },
      true,
    );

    let sortFilter: Record<string, any> = { likeCount: -1 };
    if (query.filter === 'recent') {
      sortFilter = { createdAt: -1 };
    }
    const [posts, total] = await Promise.all([
      await this.postModel.aggregate([
        ...filter,
        {
          $sort: sortFilter,
        },
        {
          $skip: skip,
        },
        {
          $limit: +pageSize,
        },
      ]),
      await this.postModel.aggregate([
        ...filter,
        {
          $count: 'total',
        },
      ]),
    ]);

    const postsWithUserInfo = await Promise.all(
      posts.map(async (post) => {
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
      }),
    );

    return { total: total?.[0]?.total, posts: postsWithUserInfo as any };
  }
}
