module.exports = {

    select: function (selected,options) {
         console.log(`works... ${selected}`);
        return options.fn(this).replace(new RegExp(' value=\"' + selected + '\"'), '$&selected="selected"');
    }

};