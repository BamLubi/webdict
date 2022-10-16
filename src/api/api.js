import http from "./http.js";

/**
 * 模糊查询文献
 * @param {string} key 查询的关键字
 * @returns
 */
export function getFuzzyLiterature(key) {
  return new Promise(function (resolve, reject) {
    http
      .get("literature/search/" + key, {})
      .then(res => {
        res.data.filter(function (x) {
          x.rate = parseFloat(x.rate);
          x.num = parseInt(x.num);
        });
        resolve(res.data);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 删除文献
 * @param {*} literature
 * @returns
 */
export function deleteLiterature(literature) {
  return new Promise(function (resolve, reject) {
    literature.available = "0";
    literature.rate = literature.rate + "";
    literature.num = literature.num + "";
    http
      .post("literature/update", literature)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 评分文献
 * @param {*} literature
 * @returns
 */
export function rateLiterature(literature) {
  return new Promise(function (resolve, reject) {
    http
      .get("literature/get/" + literature.id, {})
      .then(res => {
        let rate_total = parseFloat(res.data.rate) * parseInt(res.data.num);
        rate_total += parseFloat(literature.rate);
        let num_total = parseInt(res.data.num) + 1;
        literature.rate = (rate_total / num_total).toFixed(1) + "";
        literature.num = num_total + "";
        return http.post("literature/update", literature);
      })
      .then(() => {
        resolve({
          rate: parseFloat(literature.rate),
          num: parseInt(literature.num),
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 获取文献的历史评分
 * @param {*} id 文献的id
 * @returns
 */
export function getHisRate(id) {
  return new Promise(function (resolve, reject) {
    http
      .get("literature/get/" + id, {})
      .then(res => {
        let rate = parseFloat(res.data.rate);
        resolve(rate);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 修改文献的内容
 * @param {*} literature
 * @returns
 */
export function editLiterature(literature) {
  return new Promise(function (resolve, reject) {
    http
      .post("literature/update", literature)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}
