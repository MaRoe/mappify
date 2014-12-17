(function () {
    'use strict';

    angular.module('examples', [])
        .config(['$routeProvider', routeConfig])
        .controller('ExamplePreviewCtrl', controller)
        .service('SPARQLService', serviceFromConfig);
        //service('SPARQLService', service);

    function controller($scope, $rootScope, $log, SPARQLService, TemplateUrl, $http, $templateCache) {

        var vm = this;
        $scope.datasource = {};

        $scope.templateUrl = TemplateUrl;
        $scope.template = null;

        $http.get(TemplateUrl, {cache: $templateCache}).success(function (template) {
            $scope.template = template;
        });

        $scope.config = {
            viewCenter: {
                latitude: 52.339018,
                longitude: 13.3797776
            },
            zoom: 4,
            layers: [
                {
                    layer: 'layer 1',
                    concept: 'conceptA',
                    // todo: add template as string
                    'template-url': '/template/example.tpl.html',
                    icon: {
                        prefix: 'fa',
                        icon: 'info',
                        markerColor: 'green',
                        iconColor: 'blue'
                    }

                },
                {
                    layer: 'layer 2',
                    concept: 'conceptB',
                    'template-url': '/template/example.tpl.html',
                    icon: 'fa:home'
                }
            ]
        };

        $scope.foo = {};

        $scope.datasource.fetchData = function () {
            // returns a promise
            return SPARQLService.getCastles(100);
        };

        $log.debug('mappifyDefined', $scope.datasource);

        $scope.foo.bound = {};
        $scope.foo.selectedMarkers = [];

        $rootScope.$on('mappify.map.boundsChanged', function (e, bound) {
                vm.bound = bound;
                // todo:
                //$scope.$apply();
                $log.debug(bound);
            }
        );

        $rootScope.$on('mappify.selectedMarkerCollectionChanged', function (e, markers) {

            $log.debug(markers);

            vm.selectedMarkers = markers;
            //$scope.$apply();
        });
    }

    function routeConfig($routeProvider) {
        // Define fallback route
        $routeProvider
            .when('/examples/layer', {
                controller: 'ExamplePreviewCtrl',
                controllerAs: 'vm',
                templateUrl: 'components/examples/site.tpl.html',
                resolve: {
                    TemplateUrl: function () {
                        return 'components/examples/layer/map.tpl.html';
                    }
                }
            })
            .when('/examples/config', {
                controller: 'ExamplePreviewCtrl',
                controllerAs: 'vm',
                templateUrl: 'components/examples/site.tpl.html',
                resolve: {
                    TemplateUrl: function () {
                        return 'components/examples/config/map.tpl.html';
                    }
                }
            })
            .when('/examples/simple', {
                controller: 'ExamplePreviewCtrl',
                controllerAs: 'vm',
                templateUrl: 'components/examples/site.tpl.html',
                resolve: {
                    TemplateUrl: function () {
                        return 'components/examples/simple/map.tpl.html';
                    }
                }
            });
    }

    function serviceFromConfig($log) {
        var jassa = new Jassa(Promise, $.ajax);
        var sparql = jassa.sparql;
        var service = jassa.service;
        var sponate = jassa.sponate;

        var sparqlService = new service.SparqlServiceHttp(
            'http://dbpedia.org/sparql',
            ['http://dbpedia.org']
        );

        var store = new sponate.StoreFacade(sparqlService);
        var langPreference = ['es', 'de', 'en', ''];
        var blc = new sparql.BestLabelConfig(langPreference);
        var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(blc);

        var config = {
            "sponateTemplate": {
                "type": "serialized",
                "data": {
                    "id": "?r",
                    "name": {$bestLabel: {"langs": ['es', 'de', 'en', '']}} , // wenn der key mit ? beginnt "$name" (see $ref) => ruf die function*
                    "latitude": "?lat",
                    "longitude": "?long",
                    "pic": "?d"
                }
            }
        };

        //

        var map4Store = {
            name: 'classes',
            from: '?r a dbpedia-owl:Museum .' +
            '?r geo:long ?long .' +
            '?r geo:lat ?lat .' +
            'OPTIONAL { ?r foaf:depiction ?d }'
        };

        // notice: only the happy path is implemented:
        // add
        //   - bestLabel detection
        //   - handle passing errors
        //
        var template = config.sponateTemplate.data;
        template.name = {$ref: {target: mappedConcept, attr: 'displayLabel'}};

        map4Store.template = [];
        map4Store.template.push(template);
        console.log(map4Store);

        if (!store.hasOwnProperty('classes')) {
            store.addMap(map4Store);
        }

        var factory = {};
        factory.getCastles = function (limit) {
            var flow = store.classes.find().limit(limit);
            //returns a promise
            return flow.list().then(function (data) {
                // http://lodash.com/docs#pluck, extracts values from return
                return [{
                    concept: 'conceptA',
                    markers: _(data).pluck('val').first(50).value()
                }, {
                    concept: 'conceptB',
                    markers: _(data).pluck('val').rest(50).first(25).value()
                }, {
                    concept: 'conceptC',
                    markers: _(data).pluck('val').rest(50).rest(25).value()
                }];
            });
        };

        return factory;
    }


    function service($log) {
        var jassa = new Jassa(Promise, $.ajax);
        var sparql = jassa.sparql;
        var service = jassa.service;
        //var rdf = jassa.rdf;
        var sponate = jassa.sponate;

        var sparqlService = new service.SparqlServiceHttp(
            'http://dbpedia.org/sparql',
            //'http://dbpedia-live.openlinksw.com/sparql',
            ['http://dbpedia.org']
        );

        var store = new sponate.StoreFacade(sparqlService);

        var langPreference = ['es', 'de', 'en', ''];


        var blc = new sparql.BestLabelConfig(langPreference);
        var mappedConcept = sponate.MappedConceptUtils.createMappedConceptBestLabel(blc);

        /* todo: ask claus
         var commentTemplate = sponate.MappedConceptUtils.createMappedConceptBestLabel(
         new sparql.BestLabelConfig(langPreference, [
         new rdf.NodeFactory.createUri('http://dbpedia.org/ontology/abstract')
         ]
         )
         );
         */
        if (!store.hasOwnProperty('classes')) {

            var map4Store = {
                name: 'classes',
                template: [
                    {
                        id: '?r',
                        name: {$ref: {target: mappedConcept, attr: 'displayLabel'}},
                        //   abstract: { $ref: { target: commentTemplate, attr: 'displayLabel' }},
                        latitude: '?lat',
                        longitude: '?long',
                        pic: '?d'
                    }
                ],
                from: '?r a dbpedia-owl:Museum .' +
                '?r geo:long ?long .' +
                '?r geo:lat ?lat .' +
                'OPTIONAL { ?r foaf:depiction ?d }'
            };

            console.log(map4Store);

            store.addMap(map4Store);
        }

        var factory = {};

        factory.getCastles = function (limit) {
            var flow = store.classes.find().limit(limit);
            //returns a promise
            return flow.list().then(function (data) {
                // http://lodash.com/docs#pluck, extracts values from return
                return [{
                    concept: 'conceptA',
                    markers: _(data).pluck('val').first(50).value()
                }, {
                    concept: 'conceptB',
                    markers: _(data).pluck('val').rest(50).first(25).value()
                }, {
                    concept: 'conceptC',
                    markers: _(data).pluck('val').rest(50).rest(25).value()
                }];
            });
        };

        return factory;

    }
})
();