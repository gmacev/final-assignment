const { log } = require("nodemon/lib/utils");
const models = {
    postModel: require("../models/postSchema"),
    threadModel: require("../models/threadSchema"),
    userModel: require("../models/userSchema"),
    notificationsModel: require("../models/notificationsSchema"),
};

module.exports = {
    createPost: async (req, res) => {
        try {
            const { owner, post, threadId } = req.body;

            const threadPost = new models["postModel"]();

            threadPost.owner = owner.toLowerCase();
            threadPost.threadId = threadId;

            const thread = await models["threadModel"].findOne({
                _id: threadId,
            });

            threadPost.threadTitle = thread.title;
            threadPost.post = post;
            threadPost.createdTimeStamp = Date.now();

            const response = await threadPost.save();

            await models["threadModel"].findOneAndUpdate(
                { _id: threadId },
                { $inc: { postCount: 1 } }
            );

            const user = await models["userModel"].findOneAndUpdate(
                { email: owner.toLowerCase() },
                { $inc: { postCount: 1 } }
            );

            await models["threadModel"].findOneAndUpdate(
                { _id: threadId },
                { $set: { lastPostTimeStamp: Date.now() } }
            );

            if (thread.owner !== owner) {
                const notification = new models["notificationsModel"]();

                notification.owner = thread.owner;
                notification.postBy = user.username;
                notification.threadId = threadId;

                await notification.save();
            }

            return res.send({
                error: false,
                message: "Post created successfully",
                post: response,
            });
        } catch (error) {
            console.log(error);
            return res.send({ error: true, message: error });
        }
    },

    getPosts: async (req, res) => {
        let { count, limit, page, owner, threadId } = req.params;

        if (
            !/\d/.test(count) ||
            !/\d/.test(limit) ||
            !/\d/.test(page) ||
            owner.includes("$")
        )
            return res.send({ error: true, message: "Error" });

        count = Number(count);
        limit = Number(limit);
        page = Number(page) - 1;

        let posts = [],
            total = 0;

        let filterQuery = {};

        if (owner !== "0") {
            filterQuery = { owner: owner };
        } else if (threadId !== "0") {
            filterQuery = { threadId: threadId };
        }

        if (count === 0) {
            posts = await models["postModel"].find(
                filterQuery,
                {},
                { skip: limit * page, limit: limit }
            );
        } else total = await models["postModel"].count(filterQuery);

        return res.send({ error: false, posts: posts, total: total });
    },

    getPost: async (req, res) => {
        const { _id } = req.params;

        if (_id.includes("$"))
            return res.send({ error: true, message: "Error" });

        const post = await models["postModel"].findOne({ _id: _id });

        return res.send({ error: false, post: post });
    },
};
