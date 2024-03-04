const _ = require("lodash");
const Post = require("../models/post");
const postService = require("../services/postService");
const AppError = require("../utils/appError");
const wrapper = require("../utils/wrapper");
const getLocationQueryObj = require("../utils/getLocationQueryObj");
const sendResponse = require("../utils/sendResponse");

const postController = {
  getPost: async (req, res) => {
    const post = await Post.findById(req.params.id);

    sendResponse(res, { post }, 200);
  },

  getMyPosts: async (req, res) => {
    const userId = req.user.id;

    const posts = await postService.getPosts(req.query, { owner: userId });

    sendResponse(res, { length: posts.length, posts }, 200);
  },

  getPosts: async (req, res) => {
    const queryObj = {
      ...(_.omit(req.query, ["center", "distance", "unit"])),
      ...getLocationQueryObj(req.query)
    }

    const posts = await postService.getPosts(queryObj);

    sendResponse(res, { length: posts.length, posts: posts }, 200);
  },

  createPost: async (req, res) => {
    const userId = req.user.id;

    const post = await Post.create(Object.assign(req.body, { owner: userId }));

    sendResponse(res, { post }, 201);
  },

  createPostBulk: async (req, res) => {
    const posts = await Post.insertMany(req.body);

    sendResponse(res, { length: posts.length, posts }, 201);
  },

  updatePost: async (req, res) => {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.owner.toString() !== userId) {
      throw new AppError("You are not authorized to update this post", 403);
    }

    const updatedPost = _.merge(post, req.body);
    await updatedPost.save();

    sendResponse(res, { posts: updatedPost }, 200);
  },

  deletePost: async (req, res) => {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new AppError("Post not found", 404);
    }

    if (post.owner.toString() !== userId) {
      throw new AppError("You are not authorized to update this post", 403);
    }

    await post.deleteOne();

    sendResponse(res, {}, 204);
  },
};

module.exports = wrapper(postController);
