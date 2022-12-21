const init = require('./initializer');

init.initializeEnv().then(() => {
    require('./index');
})