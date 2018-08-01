'use strict';

const Fiber = require('fibers');
const wechat = require('wechat');
const config = require('../config');
const lib = {
    wechat: require('../modules/lib/wechat')
};

const Actions = {
    create: createMenu,
    print: printMenu,
    remove: removeMenu
};

function main() {
    if ( process.argv.length < 3 ) {
        console.log('Usage: wechat-menu <action>');
        process.exit(1);
    }

    let actionName = process.argv[2];
    let action = Actions[actionName];

    if ( !action ) {
        console.log('Please specify a valid action(create/print/remove)');
        process.exit(1);
    }

    action();
}

function createMenu() {
    const api = lib.wechat.getApi();
    const menu = generateApiMenu(config.wechat.menu);

    console.log(JSON.stringify(menu, null, ' '));

    api.createMenu(menu);
}

function printMenu() {
    const api = lib.wechat.getApi();

    console.log(JSON.stringify(api.getMenu(), null, ' '));
}

function removeMenu() {
    const api = lib.wechat.getApi();

    api.removeMenu({
        button: []
    });
}

function generateApiMenu(menuTemplate) {
    let buttons = [];

    menuTemplate.button.forEach(button => {
        let parsedButton = parseButton(button);
        if ( parsedButton ) {
            buttons.push(parsedButton);
        }
    });

    return {
        button: buttons
    };

    function parseButton(button) {
        if ( button.sub_button ) {
            let subButtons = [];
            button.sub_button.forEach(button => {
                let parsedButton = parseButton(button);
                if ( parsedButton ) {
                    subButtons.push(parseButton(button));
                }
            });

            return {
                name: button.name,
                sub_button: subButtons
            };
        }

        if ( button.type == 'auth_view' ) {
            return {
                type: 'view',
                name: button.name,
                url: lib.wechat.makeAuthUrl(
                    'http://' + config.wechat.server.host + button.url)
            };
        }
        else if ( button.type == 'insite_view' ) {
            return {
                type: 'view',
                name: button.name,
                url: 'http://' + config.wechat.server.host + button.url
            };
        }
        else {
            return button;
        }

        return null;
    }
}

Fiber(main).run();
