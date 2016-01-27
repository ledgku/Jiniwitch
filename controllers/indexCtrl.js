exports.greeting = function(req, res)
{
    console.log(req.headers);
    return res.send(req.body);
};

