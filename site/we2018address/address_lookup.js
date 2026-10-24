'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

new Vue({
  el: "#app",

  data: {
    address: '',
    json_url: 'https://data.winnipeg.ca/resource/w4xz-nc35.json?$order=street_name&$$app_token=VV2RlXrqSjCSzVfemlnJ1ZsBt',
    possible_addresses: []
  },

  watch: {
    // Fetch and set possible_addressses using the provided form-bound address.
    address: _.debounce(function (new_address, old_address) {
      var _this = this;

      var _street_number_and_na = street_number_and_name_from(new_address),
          _street_number_and_na2 = _slicedToArray(_street_number_and_na, 2),
          street_number = _street_number_and_na2[0],
          street_name = _street_number_and_na2[1];

      if (street_name.length < 3) {
        this.possible_addresses = [];
        localStorage.removeItem('address');
        setTimeout(iframe_dynamic_height, 100);
        return;
      }

      localStorage.address = new_address;

      var api_url = this.json_url + '&$where=street_number=' + street_number + ('%20AND%20street_name%20LIKE%20\'' + street_name.toUpperCase() + '%25\'');

      axios.get(api_url).then(function (addresses) {
        addresses.data.forEach(function (a) {
          a.ward_url = council_ward_to_url(a.ward_as_of_september_17);
          a.trustee_url = trustee_ward_to_url(a.school_division + ' ' + a.school_division_ward);
        });

        // This here is the magic. Triggers a v-for loop in the markup.
        _this.possible_addresses = addresses.data;

        if (addresses.data.length == 1) {
          localStorage.address = addresses.data[0].street_number + ' ' + addresses.data[0].street_name;
        }

        // Grow the iframe!
        setTimeout(iframe_dynamic_height, 100);
      }).catch(function (error) {
        bugsnagClient.notify(error);
      });
    }, 200)
  },

  mounted: function mounted() {
    window.bugsnagClient = bugsnag('7b140e53dca178959f99859ae09f391a');
    bugsnagClient.use(bugsnag__vue(Vue));

    if (localStorage.address) {
      this.address = localStorage.address;
    }
  }
});

function iframe_dynamic_height() {
  var iframe = window.parent.document.getElementById('address_frame');
  if (!iframe) return;
  var container = document.getElementById('app');
  iframe.style.height = container.offsetHeight + 45 + 'px';
}

function street_number_and_name_from(address) {
  var address_pattern = /(\d+)\s(.+)/;
  var address_matches = address.match(address_pattern);

  if (address_matches == null) return ['', ''];

  var _address_matches = _slicedToArray(address_matches, 3),
      _ = _address_matches[0],
      street_number = _address_matches[1],
      street_name = _address_matches[2];

  return [street_number, street_name.trim()];
}

function council_ward_to_url(ward) {
  var ward_map = { 'St. Vital': 'https://www.winnipegelection.ca/constituencies/st-vital/',
    'Elmwood - East Kildonan': 'https://www.winnipegelection.ca/constituencies/elmwood-east-kildonan/',
    'Charleswood - Tuxedo': 'https://www.winnipegelection.ca/constituencies/charleswood-tuxedo/',
    'Transcona': 'https://www.winnipegelection.ca/constituencies/transcona/',
    'Daniel McIntyre': 'https://www.winnipegelection.ca/constituencies/daniel-mcintyre/',
    'St. James': 'https://www.winnipegelection.ca/constituencies/st-james/',
    'Waverley West': 'https://www.winnipegelection.ca/constituencies/waverley-west/',
    'Old Kildonan': 'https://www.winnipegelection.ca/constituencies/old-kildonan/',
    'St. Boniface': 'https://www.winnipegelection.ca/constituencies/st-boniface/',
    'North Kildonan': 'https://www.winnipegelection.ca/constituencies/north-kildonan/',
    'Mynarski': 'https://www.winnipegelection.ca/constituencies/mynarski/',
    'Point Douglas': 'https://www.winnipegelection.ca/constituencies/point-douglas/',
    'River Heights - Fort Garry': 'https://www.winnipegelection.ca/constituencies/river-heights-fort-garry/',
    'St. Norbert - Seine River': 'https://www.winnipegelection.ca/constituencies/st-norbert-seine-river/',
    'Fort Rouge - East Fort Garry': 'https://www.winnipegelection.ca/constituencies/fort-rouge-east-fort-garry/' };
  return ward_map[ward];
}

function trustee_ward_to_url(ward) {
  var ward_map = { 'Louis Riel 3': 'https://www.winnipegelection.ca/constituencies/louis-riel-3/',
    'River East Transcona 3': 'https://www.winnipegelection.ca/constituencies/river-east-transcona-3/',
    'Pembina Trails 1': 'https://www.winnipegelection.ca/constituencies/pembina-trails-1/',
    'River East Transcona 2': 'https://www.winnipegelection.ca/constituencies/river-east-transcona-2/',
    'River East Transcona 1': 'https://www.winnipegelection.ca/constituencies/river-east-transcona-1/',
    'Winnipeg 6': 'https://www.winnipegelection.ca/constituencies/winnipeg-6/',
    'St James-Assiniboia Silver Heights-Booth': 'https://www.winnipegelection.ca/constituencies/st-james-assiniboia-silver-heights-booth/',
    'Pembina Trails 3': 'https://www.winnipegelection.ca/constituencies/pembina-trails-3/',
    'Seven Oaks 3': 'https://www.winnipegelection.ca/constituencies/seven-oaks-3/',
    'Louis Riel 1': 'https://www.winnipegelection.ca/constituencies/louis-riel-1/',
    'River East Transcona 4': 'https://www.winnipegelection.ca/constituencies/river-east-transcona-4/',
    'Winnipeg 8': 'https://www.winnipegelection.ca/constituencies/winnipeg-8/',
    'St James-Assiniboia Kirkfield-St Charles': 'https://www.winnipegelection.ca/constituencies/st-james-assiniboia-kirkfield-st-charles/',
    'Winnipeg 9': 'https://www.winnipegelection.ca/constituencies/winnipeg-9/',
    'Louis Riel 4': 'https://www.winnipegelection.ca/constituencies/louis-riel-4/',
    'Winnipeg 7': 'https://www.winnipegelection.ca/constituencies/winnipeg-7/',
    'St James-Assiniboia King Edward-Deer Lodge': 'https://www.winnipegelection.ca/constituencies/st-james-assiniboia-king-edward-deer-lodge/',
    'Pembina Trails 2': 'https://www.winnipegelection.ca/constituencies/pembina-trails-2/',
    'Winnipeg 1': 'https://www.winnipegelection.ca/constituencies/winnipeg-1/',
    'Seven Oaks 2': 'https://www.winnipegelection.ca/constituencies/seven-oaks-2/',
    'Winnipeg 5': 'https://www.winnipegelection.ca/constituencies/winnipeg-5/',
    'Louis Riel 2': 'https://www.winnipegelection.ca/constituencies/louis-riel-2/',
    'Winnipeg 3': 'https://www.winnipegelection.ca/constituencies/winnipeg-3/',
    'Seine River ': 'https://www.winnipegelection.ca/constituencies/seine-river-1/',
    'Winnipeg 2': 'https://www.winnipegelection.ca/constituencies/winnipeg-2/',
    'Winnipeg 4': 'https://www.winnipegelection.ca/constituencies/winnipeg-4/' };
  return ward_map[ward];
}

