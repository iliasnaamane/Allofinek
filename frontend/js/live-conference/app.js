'use strict';

var angularInjections = angularInjections || [];

var app = angular.module('liveConferenceApplication', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'op.socketio',
  'op.easyrtc',
  'op.websocket',
  'op.live-conference',
  'op.notification',
  'op.localstorage',
  'op.dynamicDirective',
  'meetings.authentication',
  'meetings.session',
  'meetings.user',
  'meetings.conference',
  'meetings.configuration',
  'meetings.language',
  'meetings.i18n',
  'restangular',
  'uuid4',
  'mgcrea.ngStrap',
  'ngSocial',
  'matchmedia-ng',
  'op.live-conference-devmode',
  'ng.deviceDetector',
  'angularMoment',
  'ui.router',
  'facebook'
].concat(angularInjections)).config(function($locationProvider, RestangularProvider, $stateProvider,FacebookProvider) {
  
  FacebookProvider.init('1633202170326901') ;
  $stateProvider
    .state('app', {
      url: '/:conferenceId',
      templateUrl: '/views/live-conference/partials/main',
      controller: 'conferenceController',
      resolve: {
        conference: function($stateParams, $location, $log, conferenceService) {
          var id = $stateParams.conferenceId;
          return conferenceService.enter(id).then(
            function(response) {
              $log.info('Successfully entered room', id, 'with response', response);
              return response.data;
            },
            function(err) {
              $log.info('Failed to enter room', id, err);
              $location.path('/');
            }
          );
        }
      },
      data: {
        hasVideo: false
      }
    })
    .state('app.editor-mobile', {
      templateUrl: '/views/live-conference/partials/conference-mobile-video'})
    .state('app.conference', {
      templateUrl: '/views/live-conference/partials/conference-video'});


  $locationProvider.html5Mode(true);
  RestangularProvider.setBaseUrl('/api');
  RestangularProvider.setFullResponse(true);
})
  .run(['$log', 'session', '$state', function($log, session) {
    

    session.ready.then(function() {
      $log.debug('Session is ready.');
    });
  }]);

  

  