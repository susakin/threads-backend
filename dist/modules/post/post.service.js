"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./schema/post.schema");
const uuid_1 = require("uuid");
const user_service_1 = require("../user/user.service");
const activity_service_1 = require("../activity/activity.service");
const short_unique_id_1 = require("short-unique-id");
const like_service_1 = require("../like/like.service");
const repost_service_1 = require("../repost/repost.service");
const lodash_1 = require("lodash");
const user_relation_service_1 = require("../user-relation/user-relation.service");
const quote_service_1 = require("../quote/quote.service");
const hide_post_service_1 = require("../hide-post/hide-post.service");
const poll_service_1 = require("../poll/poll.service");
const save_post_service_1 = require("../save-post/save-post.service");
const tag_service_1 = require("../tag/tag.service");
const view_service_1 = require("../view/view.service");
const uuid = new short_unique_id_1.default({ length: 11 });
let PostService = class PostService {
    constructor(postModel, userService, userRelationService, likeService, repostService, quoteService, activityService, hidePostService, pollService, savePostService, tagService, viewService) {
        this.postModel = postModel;
        this.userService = userService;
        this.userRelationService = userRelationService;
        this.likeService = likeService;
        this.repostService = repostService;
        this.quoteService = quoteService;
        this.activityService = activityService;
        this.hidePostService = hidePostService;
        this.pollService = pollService;
        this.savePostService = savePostService;
        this.tagService = tagService;
        this.viewService = viewService;
    }
    async isPostBanned(post, currentUid, allowedMentionUsers) {
        const user = await this.userService.findUserById(post.uid, currentUid);
        return (user?.friendshipStatus?.isBanned ||
            (post?.replyAuth === 'followedBy' &&
                !user?.friendshipStatus?.followedBy &&
                !user?.friendshipStatus?.isOwn) ||
            (post?.replyAuth === 'mention' &&
                !allowedMentionUsers.some((item) => item?.id === currentUid) &&
                !user?.friendshipStatus?.isOwn));
    }
    getMentionUser(caption = '') {
        const pattern = /@(\w+)\b/g;
        const matchedUsers = Array.from(new Set(caption.match(pattern))).map((match) => match.replace('@', '').trim());
        return matchedUsers;
    }
    createTag(textEntities, currentUid) {
        textEntities
            ?.filter((item) => item.type === 'tag')
            .map((item) => {
            this.tagService.create({
                displayText: item.displayText,
            }, currentUid);
        });
    }
    async getMentionUserAndCaption(caption = '', currentUid = '') {
        const mentionUsers = this.getMentionUser(caption);
        const allowedMentionUsers = [];
        for (let mentionUser of mentionUsers) {
            try {
                const user = await this.userService.findOneByUsername(mentionUser, currentUid);
                if (user?.mentionAuth === 'everyone' ||
                    (user?.mentionAuth === 'following' &&
                        !user?.friendshipStatus?.isBanned &&
                        user?.friendshipStatus.followedBy)) {
                    allowedMentionUsers.push(user);
                }
                else {
                    caption = caption.replace(new RegExp(`@${mentionUser}`, 'g'), mentionUser);
                }
            }
            catch (e) { }
        }
        return { caption, allowedMentionUsers };
    }
    async createMentionActivity(post, matchedUsers) {
        const caption = post?.caption;
        if (!caption)
            return;
        for (const username of matchedUsers) {
            const user = await this.userService.findOneByUsername(username, '');
            if (user) {
                const activityDto = {
                    type: 'mention',
                    from: post.uid,
                    to: user.id,
                    postCode: post.code,
                    relatePostId: post.id,
                };
                this.activityService.create(activityDto);
            }
        }
    }
    async createFirstPostActivity(post) {
        const followerUids = await this.userRelationService.getFollowerUids(post?.uid, { skip: 0, limit: 10000 });
        followerUids?.forEach((uid) => {
            const activityDto = {
                type: 'firstPost',
                from: post.uid,
                to: uid,
                postCode: post.code,
            };
            this.activityService.create(activityDto);
        });
    }
    async createPost(post) {
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
        const createPost = (0, lodash_1.pick)(post, allowedFields);
        createPost.code = uuid.rnd();
        createPost.id = (0, uuid_1.v4)();
        const { replyToPostId, poll, uid, id, textEntities, quotedPostId } = createPost;
        const { caption, allowedMentionUsers } = await this.getMentionUserAndCaption(post?.caption, uid);
        if (quotedPostId) {
            const quotedPost = await this.findPostById(quotedPostId, uid);
            const isBanned = await this.isPostBanned(quotedPost, uid, allowedMentionUsers);
            if (isBanned) {
                throw new Error('Insufficient permissions');
            }
        }
        let replyToPost;
        if (replyToPostId) {
            replyToPost = await this.findPostById(replyToPostId, uid);
            const owner = await this.userService.findUserById(uid);
            const relation = await this.userRelationService.getUserFriendshipStatus(replyToPost?.uid, uid);
            const isBanned = await this.isPostBanned(replyToPost, uid, allowedMentionUsers);
            if (isBanned ||
                (owner.isPrivate && !relation?.followedBy && !relation.isOwn)) {
                throw new Error('Insufficient permissions');
            }
        }
        else {
            const post = await this.postModel.findOne({
                uid,
                replyToPostId: { $exists: false },
            });
            if (!post) {
                createPost.isFirst = true;
            }
        }
        const createdPost = await this.postModel.create({ ...createPost, caption });
        if (createdPost.isFirst) {
            this.createFirstPostActivity(createdPost);
        }
        if (poll) {
            const _poll = await this.pollService.create({ ...poll, uid, postId: id });
            createdPost.pollId = _poll.id;
            await createdPost.save();
        }
        this.createTag(textEntities, uid);
        if (replyToPost) {
            await this.incrementCommentCount(replyToPostId);
            const replyToUid = replyToPost.uid;
            createdPost.replyToUid = replyToUid;
            await createdPost.save();
            if (post.uid !== replyToUid) {
                const activityDto = {
                    type: 'reply',
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
    async getUserPinned(uid) {
        const post = await this.postModel.findOne({ uid, isPinnedToProfile: true });
        return !!post;
    }
    async getPostCommentPinned(id) {
        const post = await this.postModel.findOne({
            replyToPostId: id,
            isPinnedToComment: true,
        });
        return !!post;
    }
    async updatePostReplyAuth(id, replyAuth) {
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
    async findPostById(id, currentUid) {
        const post = await this.postModel.findOne({ id });
        if (!currentUid) {
            return post;
        }
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
    }
    async findPostByCode(code, currentUid) {
        const post = await this.postModel.findOne({ code });
        const mergePost = await this.mergePostInfo(post, currentUid);
        return mergePost;
    }
    async findReplyUsersProfilePicUrl(id) {
        const posts = await this.postModel
            .aggregate([
            { $match: { replyToPostId: id } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: '$uid', latestPost: { $first: '$$ROOT' } } },
            { $replaceRoot: { newRoot: '$latestPost' } },
            { $limit: 3 },
        ])
            .exec();
        const profilePicUrls = await Promise.all(posts.map(async (post) => {
            const user = await this.userService.findUserById(post.uid);
            return user.profilePicUrl;
        }));
        return profilePicUrls;
    }
    async checkIsPostOwner(id, uid) {
        const post = await this.findPostById(id, uid);
        return post?.user?.id === uid;
    }
    async updatePost(id, updatedFields) {
        const post = await this.postModel.findOne({ id }).exec();
        const allowedFields = ['caption', 'medias', 'poll', 'textEntities'];
        const _updatedFields = (0, lodash_1.pick)(updatedFields, allowedFields);
        if (post && post.createdAt > Date.now() - 5 * 60 * 1000) {
            const updatedPost = await this.postModel
                .findOneAndUpdate({ id }, {
                $set: {
                    ..._updatedFields,
                    captionIsEdited: true,
                },
            }, { new: true })
                .exec();
            return updatedPost;
        }
        else {
            throw new Error('Cannot update post after 5 minutes of creation');
        }
    }
    async deletePost(id) {
        const post = await this.postModel.findOne({ id }).exec();
        if (post) {
            await this.postModel.deleteOne({ id });
            this.likeService.deletePostLikes(id);
            this.repostService.deletePostReposts(id);
            this.activityService.deleteActivitiesByPostCode(post.code);
            this.hidePostService.deleteByPostId(id, post.uid);
            this.viewService.deleteByPostId(id);
            if (post.replyToPostId) {
                this.decrementCommentCount(post.replyToPostId);
            }
            if (post.pollId) {
                this.pollService.deleteById(post.pollId);
            }
        }
    }
    async deleteRepliesById(replyToPostId) {
        const replies = await this.postModel.find({ replyToPostId }).exec();
        for (const reply of replies) {
            await this.deletePost(reply.id);
        }
    }
    async deletePostsByUid(uid) {
        const userPosts = await this.postModel.find({ uid }).exec();
        for (const post of userPosts) {
            await this.deletePost(post.id);
        }
    }
    async findPostWithQuotedPostById(id, currentUid) {
        const post = await this.postModel.findOne({ id }).exec();
        if (!post) {
            return null;
        }
        const { user, isLikedByViewer, isRepostedByViewer, replyToUser, poll, isUnavailable, canReply, } = await this.getPostDetail(post, currentUid);
        if (isUnavailable) {
            return {
                id: post.id,
                isUnavailable,
            };
        }
        let quotedPost = null;
        quotedPost = await this.postModel.findOne({ id: post.quotedPostId }).exec();
        if (post.quotedPostId && quotedPost) {
            const { user, isLikedByViewer, isRepostedByViewer, replyToUser, isUnavailable, poll, canReply, } = await this.getPostDetail(quotedPost, currentUid);
            quotedPost = isUnavailable
                ? { id: quotedPost.id, isUnavailable }
                : Object.assign(quotedPost, {
                    user,
                    isLikedByViewer,
                    isRepostedByViewer,
                    replyToUser,
                    poll,
                    canReply,
                });
        }
        return Object.assign(post, {
            quotedPost,
            user,
            isLikedByViewer,
            isRepostedByViewer,
            replyToUser,
            poll,
            canReply,
        });
    }
    async getPostDetail(post, currentUid) {
        const { id, uid, quotedPostId, replyToUid, pollId, caption } = post;
        const { allowedMentionUsers } = await this.getMentionUserAndCaption(caption, currentUid);
        const isBanned = await this.isPostBanned(post, currentUid, allowedMentionUsers);
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
        let replyToUser;
        if (replyToUid) {
            replyToUser = await this.userService.findUserById(replyToUid, currentUid);
        }
        const isLikedByViewer = await this.likeService.postIsLikedByUser(id, currentUid);
        const isRepostedByViewer = await this.repostService.isRepostedByUser(id, currentUid);
        const isHiddenByViewer = await this.hidePostService.isHiddenPost(id, currentUid);
        const isSavedByViewer = await this.savePostService.postIsSavedByUser(id, currentUid);
        const isViewedByViewer = await this.viewService.getByPostIdAndUid(id, currentUid);
        const viewCount = await this.viewService.getViewCount(id);
        return {
            quotedPost,
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
    async mergePostInfo(post, currentUid) {
        if (!post) {
            return null;
        }
        const { likeAndViewCountDisabled, likeCount } = post;
        const { isUnavailable, viewCount, ...rest } = await this.getPostDetail(post, currentUid);
        if (isUnavailable) {
            return {
                id: post.id,
                isUnavailable,
            };
        }
        return Object.assign(post, {
            ...rest,
            viewCount: likeAndViewCountDisabled ? 0 : viewCount,
            likeCount: likeAndViewCountDisabled ? (likeCount > 0 ? 1 : 0) : likeCount,
        });
    }
    async findPostsByUid(uid, currentUid, page, pageSize) {
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
        const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
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
        }));
        return { total: total?.[0]?.total, posts: postsWithUserInfo };
    }
    async incrementLikeCount(id) {
        const updatedPost = await this.postModel
            .findOneAndUpdate({ id }, {
            $inc: {
                likeCount: 1,
            },
        }, { new: true })
            .exec();
        return updatedPost;
    }
    async incrementCommentCount(id) {
        const updatedPost = await this.postModel
            .findOneAndUpdate({ id }, {
            $inc: {
                commentCount: 1,
            },
        }, { new: true })
            .exec();
        return updatedPost;
    }
    async incrementRepostCount(id) {
        const updatedPost = await this.postModel
            .findOneAndUpdate({ id }, {
            $inc: {
                repostCount: 1,
            },
        }, { new: true })
            .exec();
        return updatedPost;
    }
    async decrementLikeCount(id) {
        const post = await this.postModel.findOne({ id });
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.likeCount > 0) {
            const updatedPost = await this.postModel
                .findOneAndUpdate({ id }, {
                $inc: {
                    likeCount: -1,
                },
            }, { new: true })
                .exec();
            return updatedPost;
        }
        else {
            return post;
        }
    }
    async decrementRepostCount(id) {
        const post = await this.postModel.findOne({ id });
        if (!post) {
            throw new Error('Post not found');
        }
        if (post.repostCount > 0) {
            const updatedPost = await this.postModel
                .findOneAndUpdate({ id }, {
                $inc: {
                    repostCount: -1,
                },
            }, { new: true })
                .exec();
            return updatedPost;
        }
        else {
            return post;
        }
    }
    async decrementCommentCount(id) {
        const post = await this.postModel.findOne({ id }).exec();
        if (post && post.commentCount > 0) {
            const updatedPost = await this.postModel
                .findOneAndUpdate({ id }, {
                $inc: { commentCount: -1 },
            }, { new: true })
                .exec();
            return updatedPost;
        }
        else {
            return post;
        }
    }
    async findPostChildChainById(id, currentUid) {
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
        const fullList = await Promise.all(list.map((post) => this.mergePostInfo(post, currentUid)));
        return fullList;
    }
    async findPostParentChainByCode(code, currentUid) {
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
        const fullList = await Promise.all(list.map((post) => this.mergePostInfo(post, currentUid)));
        return fullList;
    }
    async findReplyPostsById(postId, currentUid, page, pageSize, excludePostCode) {
        const filter = this.getBannedFilter(currentUid, {
            replyToPostId: postId,
            code: { $ne: excludePostCode },
        }, true);
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
        const posts = await Promise.all(replyPosts.map((post) => this.findPostChildChainById(post.id, currentUid)));
        return { posts, total: total?.[0]?.total };
    }
    async pinToProfile(id) {
        const postToPin = await this.postModel.findOne({ id });
        if (postToPin.replyToPostId) {
            throw new Error('Cannot pin a post with a non-null replyToPostId value');
        }
        await this.postModel
            .findOneAndUpdate({ isPinnedToProfile: true, uid: postToPin.uid }, { isPinnedToProfile: false })
            .exec();
        postToPin.isPinnedToProfile = true;
        await postToPin.save();
        return postToPin;
    }
    async unpinToComment(postId, currentUid) {
        const post = await this.postModel.findOne({ id: postId });
        if (post.replyToUid !== currentUid) {
            throw new Error('not allowed');
        }
        post.isPinnedToComment = false;
        await post.save();
        return post;
    }
    async pinToComment(postId, currentUid) {
        const post = await this.postModel.findOne({ id: postId });
        if (post.replyToUid !== currentUid) {
            throw new Error('not allowed');
        }
        await this.postModel.findOneAndUpdate({ replyToPostId: post.replyToPostId, isPinnedToComment: true }, { isPinnedToComment: false });
        post.isPinnedToComment = true;
        await post.save();
        return post;
    }
    async unpinToProfile(id) {
        const updatedPost = await this.postModel
            .findOneAndUpdate({ id, isPinnedToProfile: true }, { isPinnedToProfile: false }, { new: true })
            .exec();
        return updatedPost;
    }
    async updateLikeAndviewtsDisabled(id, likeAndViewCountDisabled) {
        const updatedPost = await this.postModel
            .findOneAndUpdate({ id }, { likeAndViewCountDisabled }, { new: true })
            .exec();
        return updatedPost;
    }
    async findRepliesByUid(uid, currentUid, page, pageSize) {
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
        const replies = await Promise.all(posts.map((post) => Promise.all([
            this.findPostById(post.replyToPostId, currentUid),
            this.mergePostInfo(post, currentUid),
        ])));
        return { total: total?.[0]?.total, posts: replies };
    }
    async findFollowingPosts(currentUid, page, pageSize) {
        const skip = (page - 1) * pageSize;
        const followingUids = await this.userRelationService.getFollowingUids(currentUid, { skip: 0, limit: 10000 });
        const followingReposts = await this.repostService.getFollowingRepost(followingUids, currentUid);
        const followingRepostsIds = followingReposts?.map((repost) => repost.postId);
        const filter = this.getBannedFilter(currentUid, {
            $or: [
                { uid: { $in: followingUids } },
                { id: { $in: followingRepostsIds } },
            ],
            replyToPostId: { $exists: false },
        }, true);
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
        const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
            const mergePost = await this.mergePostInfo(post, currentUid);
            const repostedPost = followingReposts?.find?.((post) => post.postId === mergePost?.id);
            if (repostedPost) {
                const user = await this.userService.findUserById(repostedPost.uid, currentUid);
                mergePost.repostedBy = {
                    createdAt: repostedPost.createdAt,
                    user,
                };
            }
            return mergePost;
        }));
        return { total: total?.[0]?.total, posts: postsWithUserInfo };
    }
    async findFollowingPostsAfterId(currentUid, id, pageSize) {
        if (!id) {
            const { posts } = await this.findFollowingPosts(currentUid, 1, 10);
            return { posts };
        }
        const post = await this.postModel.findOne({ id });
        if (!post) {
            throw new Error('post not found');
        }
        const followingUids = await this.userRelationService.getFollowingUids(currentUid, { skip: 0, limit: 10000 });
        const posts = await this.postModel
            .find({
            createdAt: { $gt: post.createdAt },
            uid: { $in: followingUids },
            replyToPostId: { $exists: false },
        })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .exec();
        const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
            const mergePost = await this.mergePostInfo(post, currentUid);
            return mergePost;
        }));
        return { posts: postsWithUserInfo };
    }
    getBannedFilter(currentUid, extra = {}, hasMuting = false) {
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
                                        { $eq: ['$targetUid', '$$currentUid'] },
                                        { $eq: ['$uid', '$$postUid'] },
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
                                        { $eq: ['$targetUid', '$$postUid'] },
                                        { $eq: ['$uid', '$$currentUid'] },
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
    async findTimelinePosts(currentUid, page, pageSize) {
        const skip = (page - 1) * pageSize;
        const filter = this.getBannedFilter(currentUid, {
            replyToPostId: { $exists: false },
        }, true);
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
        const _posts = await Promise.all(posts.map(async (post) => {
            const mergePost = await this.mergePostInfo(post, currentUid);
            return mergePost;
        }));
        return { total: total?.[0]?.total || 0, posts: _posts };
    }
    async getReplyAfterId(currentUid, id, replyId, pageSize) {
        if (!replyId) {
            const { posts } = await this.findReplyPostsById(id, currentUid, 1, pageSize, id);
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
        const filter = this.getBannedFilter(currentUid, {
            replyToPostId: id,
            createdAt: { $gt: commentPost.createdAt },
        }, true);
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
        const posts = await Promise.all(replyPosts.map((post) => this.findPostChildChainById(post.id, currentUid)));
        return { posts };
    }
    async findTimeLinePostsAfterId(currentUid, id, pageSize) {
        if (!id) {
            const { posts } = await this.findTimelinePosts(currentUid, 1, pageSize);
            return { posts };
        }
        const post = await this.postModel.findOne({ id });
        if (!post) {
            return { posts: [] };
        }
        const filter = this.getBannedFilter(currentUid, {
            replyToPostId: { $exists: false },
            createdAt: { $gt: post.createdAt },
        }, true);
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
        const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
            const mergePost = await this.mergePostInfo(post, currentUid);
            return mergePost;
        }));
        return { posts: postsWithUserInfo };
    }
    async findPostsByQuery(query, currentUid, page, pageSize) {
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
                        displayText: query.tag,
                    },
                },
            };
        }
        const filter = this.getBannedFilter(currentUid, {
            ...queryFiler,
        }, true);
        let sortFilter = { likeCount: -1 };
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
        const postsWithUserInfo = await Promise.all(posts.map(async (post) => {
            const mergePost = await this.mergePostInfo(post, currentUid);
            return mergePost;
        }));
        return { total: total?.[0]?.total, posts: postsWithUserInfo };
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_relation_service_1.UserRelationService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => like_service_1.LikeService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => repost_service_1.RepostService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => quote_service_1.QuoteService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => activity_service_1.ActivityService))),
    __param(7, (0, common_1.Inject)((0, common_1.forwardRef)(() => hide_post_service_1.HidePostService))),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => poll_service_1.PollService))),
    __param(9, (0, common_1.Inject)((0, common_1.forwardRef)(() => save_post_service_1.SavePostService))),
    __param(10, (0, common_1.Inject)((0, common_1.forwardRef)(() => tag_service_1.TagService))),
    __param(11, (0, common_1.Inject)((0, common_1.forwardRef)(() => view_service_1.ViewService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        user_service_1.UserService,
        user_relation_service_1.UserRelationService,
        like_service_1.LikeService,
        repost_service_1.RepostService,
        quote_service_1.QuoteService,
        activity_service_1.ActivityService,
        hide_post_service_1.HidePostService,
        poll_service_1.PollService,
        save_post_service_1.SavePostService,
        tag_service_1.TagService,
        view_service_1.ViewService])
], PostService);
//# sourceMappingURL=post.service.js.map