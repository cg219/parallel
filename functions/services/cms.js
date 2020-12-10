const { config, logger } = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const GhostContentAPI = require('@tryghost/content-api');
const API = new GhostContentAPI({
    url: config().ghost.url,
    key: config().ghost.key,
    version: 'v3'
})

module.exports.save = save;
module.exports.get = get;

function mapContent (acc, content) {
    acc[content.slug] = content;
    return acc;
}

function mapTeam (acc, content) {
    if (content.primary_tag && content.primary_tag.slug == 'team') {
        acc[Number(content.meta_title) - 1] = {
            slug: content.slug,
            title: content.title,
            html: content.html
        }
    }

    return acc;
}

function validateQuery (query) {
    var values = [null, null];
    var name = query.name;
    var type = query.type;

    if (name && typeof name == 'string') {
        values[0] = name;
    }

    if (type && typeof type == 'string') {
        type = type.toLowerCase();

        if (type != 'pages' && type != 'posts' && type != 'settings' && type != 'all') {
            type = 'all';
        }

        values[1] = type;
    }

    return values;
}

async function saveFile (file, data, { gzip = true, predefinedAcl = 'bucketOwnerFullControl', contentType = 'application/json' } = {}) {
    let buffer = Buffer.from(JSON.stringify(data));

    return await file.save(buffer, { gzip, predefinedAcl, contentType });
}

async function getFile (filename, bucket) {
    let file = bucket.file(`${filename}.json`);
    return await file.download();
}

async function save (message) {
    var storage = new Storage();
    var bucket = storage.bucket(config().storage.bucket);
    var pages = await API.pages.browse();
    var posts = await API.posts.browse();
    var team = await API.posts.browse({ include: 'tags'});
    var settings = await API.settings.browse();
    var data = new Map();

    pages = pages.reduce(mapContent, {});
    team = team.reduce(mapTeam, []);
    posts = posts.reduce(mapContent, {});

    data.set('pages', pages);
    data.set('posts', posts);
    data.set('team', team);
    data.set('settings', settings);
    data.set('cms', { pages, posts, settings, team });

    var saves = [...data].map(function createFile([key, rawData]) {
        let file = bucket.file(`${key}.json`);
        return saveFile(file, rawData);
    });

    await Promise.all(saves);

    return logger.log('Saved');
}

async function get (req, res) {
    var storage = new Storage();
    var bucket = storage.bucket(config().storage.bucket);
    var [name, type] = validateQuery(req.query);
    var data = { success: true };

    res.set('Content-Type', 'application/json');
    res.set('Access-Control-Allow-Origin', '*');

    if (!type) {
        data.success = false;
        data.data = {
            message: 'Error with request. Check request parameters for errors'
        }

        return res.send(data);
    }

    if (type != 'all') {
        var [file] = await getFile(type, bucket);
    } else {
        var [file] = await getFile('cms', bucket);
    }

    var json = JSON.parse(file.toString());

    data.data = name && type != 'all' ? json[name] : json;
    res.send(data)
}
