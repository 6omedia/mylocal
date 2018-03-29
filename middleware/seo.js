const Setting = require('../models/setting');

function attachTitleAndMeta(req, res, next){

    Setting.findOne({name: 'SEO'}, (err, seo) => {

        if(err){ return next(err); }

        if(!seo){ return next(new Error('SEO Settings cannot be found')); }

        const urlParts = req.originalUrl.split('/');
        urlParts[urlParts.length - 1] = urlParts[urlParts.length - 1].split('?')[0];

        let page = 'default';

        if( urlParts[1] == '' ){ page = 'home'; }
        if( urlParts[1] == 'listing' || urlParts[1] == 'find' ){ page = 'listing'; }
        if( urlParts[1] == 'articles' ){ page = 'blog'; }
        if( urlParts[1] == 'articles' && urlParts.length == 3 ){ page = 'post'; }

        res.locals.title = seo.value.pages[page].title.replace('%url-title%', urlParts[1]);
        res.locals.meta = seo.value.pages[page].meta.replace('%url-title%', urlParts[1]);

        return next();

    });

}

module.exports.attachTitleAndMeta = attachTitleAndMeta;