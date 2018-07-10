const request = require('request')
const _ = require('lodash')
const path = require('path')
const fs = require('fs-extra')
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
    {
        name: 'help',
        alias: 'h',
        type: Boolean,
        description: 'Display the usage guide.'
    },
    {
        name: 'dir',
        alias: 'd',
        type: String,
        description: 'The directory to download the SmartSync files to'
    },
    {
        name: 'url',
        alias: 'u',
        type: String,
        description: 'The url of the SmartSync file listing'
    }
]
const options = commandLineArgs(optionDefinitions)

if (options.help) {
    const usage = commandLineUsage([
        {
            header: 'SmartSync Directory Downloader Utility Thing',
            content: 'A simple example demonstrating typical usage.'
        },
        {
            header: 'Example',
            content: 'node index.js --dir ./player --url https://smartcontent-api.viooh.com/api/v2/players/85125338'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/me/example}'
        }
    ])
    console.log(usage)
    return
}
if (!options.dir || !options.url) {
    console.log('See --help for usage')
}

let dir = options.dir
let url = options.url

// kickoff with url and current directory
requestDirectory(dir, url)

function requestDirectory(dir, url) {
    request(url, function (error, response, body) {
        let directory = JSON.parse(body)
        processDirectory(dir, directory)
    });
}

function processDirectory(dir, listing) {
    let files = _.get(listing, 'data.attributes.files', null)
    if (files === null) {
        return
    }

    // Process directories
    Object.keys(files)
        .forEach(name => {
            let file = files[name]
            if (file.isDir) {
                requestDirectory(path.join(dir, name), file.path)
                return
            }
            request(file.path, function (error, response, body) {
                fs.outputFile(path.join(dir, name), body)
            });
        })
}
