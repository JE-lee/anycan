const { _getRedirectUrl, _findRoute } = require('../src/helper/redirect')
const assert = require('assert')

describe('redirect', function(done){
  it('#_getRedirectUrl', function(){
    let url1 = `/api/getDiscList`
    let route1 = _findRoute(url1)
    assert.ok(route1, 'route1不能为空')
    let redirect1 = _getRedirectUrl(url1, route1)
    assert.equal(redirect1, 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg', 'redirect1')

    let url2 = `/api/getDiscList?songid=lc123456789`
    let route2 = _findRoute(url2)
    assert.ok(route2, 'route2不能为空')
    let redirect2 = _getRedirectUrl(url2, route2)
    assert.equal(redirect2, 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg?songid=lc123456789', 'redirect2')
  })
})
