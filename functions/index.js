const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.webhook = functions.https.onRequest(require('./services/webhook'));

exports.cms = {
    save: functions.pubsub.topic('save-data').onPublish(require('./services/cms').save),
    get: functions.https.onRequest(require('./services/cms').get)
}
