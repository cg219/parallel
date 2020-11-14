const { logger, config } = require('firebase-functions');
const { PubSub } = require('@google-cloud/pubsub');

async function webhook (req, res) {
    if (req.method.toUpperCase() != 'POST') return res.sendStatus(404);
    if (req.query.api != config().ghost.key ) return res.sendStatus(401);

    logger.log('Update Accepted');
    logger.log('Running Save');

    const pubsub = new PubSub({ projectId: process.env.GCLOUD_PROJECT });
    pubsub.topic('save-data').publish(Buffer.from('{}'));

    res.sendStatus(200);
}

module.exports = webhook;
