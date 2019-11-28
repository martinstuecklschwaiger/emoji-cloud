const emojiRegex = require("emoji-regex");
const mysql = require("mysql");
const express = require("express");
const path = require("path");
const app = express();

//

const inputConfig = {
  charset: "utf8mb4_unicode_ci",
  connectionLimit: 25,
  database: "wall",
  debug: false,
  host: "wallsio-sandbox-mysql",
  password: "add the password", # TODO add the password
  user: "wall",
};
const inputPool = mysql.createPool(inputConfig);

const storageConfig = {
  charset: "utf8mb4_unicode_ci",
  connectionLimit: 25,
  database: "emoji",
  debug: false,
  host: "wallsio-sandbox-mysql",
  password: "add the password", # TODO add the password
  user: "wall",
};
const storagePool = mysql.createPool(storageConfig);

const regex = emojiRegex();

inputPool.getConnection((err, inputSql) => {
  if (err) {
    console.error("err", err);
    return;
  }

  inputSql.query("set names 'utf8mb4';");

  storagePool.getConnection((err, storageSql) => {
    if (err) {
      console.error("err", err);
      return;
    }

    storageSql.query("set names 'utf8mb4';");

    app.use('/public', express.static(path.join(__dirname, 'public')))

    app.route("/").get((req, res) => {
      res.sendFile(__dirname + "/index.html");
    });

    app.route("/emojis").get((req, res) => {

      const query = "select emoji, cast(emoji as BINARY) as bin, count(*) as counter from emoji group by emoji, bin";

      storageSql.query(query, (err, result) => {
        if (err) {
          console.error("err", err);
          return;
        }

        const mapped = result.map(x => ({emoji: x.emoji, counter: x.counter}))

        const sorted = mapped.sort((a,b) => b.counter - a.counter);

        res.end(JSON.stringify(sorted));
      });
    });

    app.listen(1234, () => console.log("listening?"));

    storageSql.query("delete from emoji where checkin_id > 0");

    const saveEmoji = ({emoji, checkin_id: checkinId}) => {
      storageSql.beginTransaction({}, () => {
        storageSql.query(`insert into emoji.emoji (emoji, checkin_id, time) VALUES ('${emoji}', ${checkinId}, now())`, (err, result) => {
          if (err) {
            console.log("err", err);
            return;
          }
        });

        storageSql.commit((err, result) => {
          if (err) {
            console.error("error", err);
            return;
          }
        });
      });
    };

    const parseRow = ({id, comment}) => {
      let match;

      while (match = regex.exec(comment)) {
        const emoji = match[0];
        saveEmoji({emoji, checkin_id: id});
      }
    };

    inputSql.query("select id, comment from checkins where comment IS NOT NULL limit 1500", (err, result) => {
      if (err) {
        console.error("There's an error", err);
        return;
      }

      for (const row of result) {
        parseRow(row);
      }
    });
  });
});
