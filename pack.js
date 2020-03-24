const copy = require("copy-dir");
const path = require("path");

(function() {
  copy("./src/webviews/settings", "./out/src/webviews/settings", () => {
    console.log("页面拷贝完成！");
  });
})();
