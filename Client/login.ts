window.onload = function() {
  if(getUrlParameter('attempt') === 'failed') {
    console.log('invalid username or password')
  }
}

function getUrlParameter(name :string) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};
