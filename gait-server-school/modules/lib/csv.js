'use strict'

let fs = require('fs');
let iconv=require('iconv-lite');

class CsvParser {
    constructor() {
    }

    parseFile(fileName) {
		let fileStr = fs.readFileSync(fileName,{encoding: 'binary'}).toString();
		let buf = new Buffer(fileStr , 'binary');
		let str = iconv.decode(buf, 'GBK');
        return this.parseText(str);
    }

    parseText(text) {
        let lines = text.split('\n').map(line => { //用\n来分行
            line = line.trim() //去除字符串左右两端空格
            if ( line.endsWith(',') ) { //去除字符串左右多余逗号
                line = line.slice(0, line.length - 1);
            }

            return line;
        }).filter(line => line.length > 0); //去掉空格的

        let cells = lines.map(line => {
            return line.split(',').map(cell => {
                if ( cell.startsWith('"') ) {md
                    cell = cell.slice(1, cell.length - 1); //把表头抽离出来，分为表头和表身
                }
                return cell;
            });
        });

        let headers = cells[0];//表头为head
        let dataLines = cells.slice(1); //表身为内容,数组格式

        return this.parseRecords(headers, dataLines);
    }

    parseRecords(headers, dataLines) {
        return dataLines.map(dataLine => { //对dateline再次进行读取分隔
            let record = Object.create(null); 
            headers.forEach((fieldName, fieldIndex) => {
                record[fieldName] = dataLine[fieldIndex];
            });

            return record;
        });
    }
	
//自动建立表头
    stringify(records, headers) {
        let rows = this.buildRows(headers, records);

        let headerLine = headers.join(',');
        let rowLines = rows.map(row => {
            return row.map(field => {
                return `"${field}"`;
            }).join(',');
        }).join('\n');

        return headerLine + '\n' + rowLines;
    }

    buildRows(headers, records) {
        return records.map(record => {
            return headers.map(header => {
                return record[header];
            });
        });
    }
}

module.exports = {
    CsvParser
};
