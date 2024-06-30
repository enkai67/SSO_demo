import redisClient from "../cas.js";

function setRedis(key, value) {
    redisClient.set(key, value);
}

function deleteRedis(key) {
    redisClient.del(key);
}

function getRedis(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, result) => {
            if (err) {
                console.error("Error retrieving key:", err);
                reject(err);
            } else {
                console.log("Get result:", result);
                resolve(result);
            }
        });
    });
}

export default {
    setRedis,
    getRedis,
    deleteRedis
};
