const fs = require('fs');
const bodyParser = require('body-parser');
const carbone = require('carbone');

const express = require('express');
const app = express();
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const util = require('util');
const redis = require('redis');
const redisUrl = 'redis://redis:6379';

const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

var options = {
    convertTo : 'pdf' //can be docx, txt, ...
  };

main()
app.listen(3000)

async function main(){
    client.on("error", function(error) {
        console.error(error);
    });
    
    app.get('/', function (req, res) {
        res.send('hello world')
      })
    
    app.post('/report', function (req, res) {
        let data = req.body
        let key = data.key
        let path1 ,path2
        let obj = getCacheById(key).then(obj => {
            path1 = "./report/redis_report_" + key + ".xlsx"
            path2 = "./report/redis_report_" + key + ".pdf"
            obj.forEach(offc => {
                offc.total = {
                    for_cred: 0.0,
                    for_debt: 0.0,
                    loc_cred: 0.0,
                    loc_debt: 0.0
                }
                offc.entries.forEach(e => {
                    i = 1
                    e.sum = {
                        for_cred: 0.0,
                        for_debt: 0.0,
                        loc_cred: 0.0,
                        loc_debt: 0.0
                    }
                    e.rec.forEach(r => {
                        r.num = i
                        i++
                        console.log(r)
                        r.for_cred !== "" ? e.sum.for_cred += r.for_cred : null
                        r.for_debt !== "" ? e.sum.for_debt += r.for_debt : null
                        r.loc_cred !== "" ? e.sum.loc_cred += r.loc_cred : null
                        r.loc_debt !== "" ? e.sum.loc_debt += r.loc_debt : null
                    });
                    offc.total.for_cred += e.sum.for_cred
                    offc.total.for_debt += e.sum.for_debt
                    offc.total.loc_cred += e.sum.loc_cred
                    offc.total.loc_debt += e.sum.loc_debt
                    e.sum.for_cred = e.sum.for_cred.toFixed(2)
                    e.sum.for_debt = e.sum.for_debt.toFixed(2)
                    e.sum.loc_cred = e.sum.loc_cred.toFixed(2)
                    e.sum.loc_debt = e.sum.loc_debt.toFixed(2)
                });
                offc.total.for_cred = offc.total.for_cred.toFixed(2)
                offc.total.for_debt = offc.total.for_debt.toFixed(2)
                offc.total.loc_cred = offc.total.loc_cred.toFixed(2)
                offc.total.loc_debt = offc.total.loc_debt.toFixed(2)
            });
            console.log(obj)

            carbone.render('./template/redis_template.xlsx', obj, function(err, result){
                if (err) return console.log(err);
                fs.writeFileSync(path1, result);
            });
    
            carbone.render('./template/redis_template.docx', obj, options, function(err, result){
                if (err) return console.log(err);
                fs.writeFileSync(path2, result);
            });

            res.json({"path1": path1, "path2":path2})
        })
    })
}

async function getCacheById(key) {
    let obj = await client.get(key)
    obj = JSON.parse(obj)
    return obj
  }
