// Create web server 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {randomBytes} = require('crypto');

// Create web server
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create comments object
const commentsByPostId = {};

// Create route for getting comments
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create route for posting comments
app.post('/posts/:id/comments', (req, res) => {
    // Generate random ID for comment
    const commentId = randomBytes(4).toString('hex');

    // Get comment content
    const {content} = req.body;

    // Check if post ID exists in comments object
    const comments = commentsByPostId[req.params.id] || [];

    // Push comment to comments object
    comments.push({id: commentId, content, status: 'pending'});

    // Assign comments to post ID in comments object
    commentsByPostId[req.params.id] = comments;

    // Send back comment
    res.status(201).send(comments);
});

// Create route for receiving events
app.post('/events', (req, res) => {
    // Get event type and data
    const {type, data} = req.body;

    // Check if event is comment created
    if (type === 'CommentCreated') {
        // Get comment ID
        const {id, content, postId} = data;

        // Get comments for post ID
        const comments = commentsByPostId[postId] || [];

        // Push comment to comments object
        comments.push({id, content, status: 'pending'});

        // Assign comments to post ID in comments object
        commentsByPostId[postId] = comments;
    }

    // Check if event is comment moderated
    if (type === 'CommentModerated') {
        // Get comment ID and status
        const {id, postId, status, content} = data;

        // Get comments for post ID
        const comments = commentsByPostId[postId];

        // Find comment in comments object
        const comment = comments.find(comment => {
            return comment.id === id;
        });

        // Assign status to comment
        comment.status = status;

        // Send event to
