import cache from 'memory-cache';

class MemCacheContainer {
  constructor() {
    this.cache = new cache.Cache(); // create a new cache instance 
    this.duration = 30;
  }

  set(key, data) {
    this.cache.put(key, data, this.duration * 1000); // set the cache with a duration in milliseconds
  }

  get(key, callback) {
    const saved = this.cache.get(key); // retrieve the cached data
    if (saved) {
      callback(saved);
    } else {
      callback(null);
    }
  }

  del(keys) {
    this.cache.del(keys); // delete the specified keys from the cache
  }

  flush() {
    this.cache.clear(); // clear all entries from the cache
  }
}

const MemCache = new MemCacheContainer(); // create an instance of the MemCacheContainer class

const clearCache = () => {
  return (req, res, next) => {
    const keys = MemCache.cache.keys();
    if (keys.length > 0) {
      const resourceUrl = '__express__' + req.originalUrl || req.url;
      const resourceKeys = keys.filter(k => resourceUrl.includes(k));
      console.log(resourceUrl, '*******', resourceKeys);

      MemCache.del(resourceKeys);
    }
    return next();
  };
};

const addCache = CacheName => {
  return (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url || CacheName;
    console.log(key);
    console.log('-----');
    console.log(MemCache.cache.keys());
    MemCache.get(key, (err, saved) => {
      if (err) {
        res.sendResponse = res.send;
        res.send = body => {
          MemCache.set(key, body);
          res.sendResponse(body);
        };
        next();
      } else {
        res.send(saved);
        return;
      }
    });
  };
};

export { MemCache, addCache, clearCache };