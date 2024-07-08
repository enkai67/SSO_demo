import redisClient from "../cas.js";

function setRedisValue(key, value) {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, result) => {
            if (err) {
                console.error("Error setting key:", err);
                reject(err);
            } else {
                console.log("Set result:", result);
                resolve(result);
            }
        });
    });
}

function deleteRedisValue(key) {
    return new Promise((resolve, reject) => {
        redisClient.del(key, (err, result) => {
            if (err) {
                console.error("Error deleting key:", err);
                reject(err);
            } else {
                console.log("Delete result:", result);
                resolve(result);
            }
        });
    });
}

function getRedisValue(key) {
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
    setRedisValue,
    getRedisValue,
    deleteRedisValue
};
