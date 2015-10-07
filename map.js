(function(Style){
    var Map = null;
    //layersource
    var defaultLayer = {
      user_name: 'jtrickstorres',
      type: 'cartodb',
      sublayers: [
        {
                sql: "SELECT * FROM points",
                cartocss: '#points {marker-fill: #0F3B82; marker-opacity: 1; marker-width: 10; marker-height: 10}'
        },
        {
                sql: "SELECT * FROM polygons",
                cartocss: Style.qc
        }
      ]
    };

    var Polygon = {
        polygons: {},
        add: function(key, coordinates, point_count){
            var points = [];
            for (var i = 0; i < coordinates.length; i++) {
                var coord = coordinates[i];
                points.push({
                    lat: coord[1],
                    lng: coord[0]
                });
            }

            this.polygons[key] = new google.maps.Polygon({
                paths: points,
                strokeColor: '#FFFF00',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillOpacity: 0
            });
            this.polygons[key].setMap(Map);

            google.maps.event.addListener(this.polygons[key], 'click', function() {
              var infoWindow = new google.maps.InfoWindow();
              infoWindow.setContent("Point Count : " + point_count);

              infoWindow.setPosition(new google.maps.LatLng(points[0].lat ,points[0].lng ));
              infoWindow.open(Map);
            });

        },
        get: function(key){
            return this.polygons[key];
        },
        all: function(){
            return this.polygons;
        }
    };

    var POC = {
      layers: [],
      init : function(){
            Map = new google.maps.Map(document.getElementById('map'),{
                zoom: 15,
              center: new google.maps.LatLng(14.63, 121.03)
            });
           this.initializePolygons();
           this.initLayers();
      },
      initializePolygons: function() {
            var query = "SELECT * FROM polygons";
            var url = 'https://jtrickstorres.cartodb.com/api/v2/sql/?format=GeoJSON&q=SELECT * FROM polygons';

            $.getJSON(url)
                .done(function(data) {
                    alert(JSON.stringify(data));
                    $.each(data.features, function(key, feature) {
                        Polygon.add(feature.properties.gridcode, feature.geometry.coordinates[0][0], 30);
                    });
                });
        },
      initLayers: function(){
            cartodb.createLayer(Map, defaultLayer)
            .addTo(Map)
            .on('done', function(layer) {
              POC.showDots(layer.getSubLayer(0));
            })
            .on('error', function(err) {
                alert("some error occurred: " + err);
            });
      },
      showDots: function(layer){
        var startTime = new Date().getTime();
        var interval = setInterval(function(){
            var randomId = '';
            var num = 0;
            for(var i = 0; i < 5; i++){
              num = Math.floor(Math.random() * (300 - 2)) + 1;
              randomId += num.toString();

              if(i < 4){
                randomId += ", ";
              }
            }
            console.log(randomId);
            layer.setSQL("SELECT * FROM points WHERE cartodb_id IN (" + randomId + ")");
        }, 2000);
      }
    }

    POC.init();
})(Style);
