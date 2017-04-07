'use strict';

angular.module('meetings.configuration', ['meetings.session', 'meetings.wizard', 'meetings.user'])
  .factory('configurationService', ['$q', '$log', 'session', 'configurationHandlerService', function($q, $log, session, configurationHandlerService) {
    function configure(configuration) {
      $log.debug('Configuring conference', configurationHandlerService.getHandlers());

      var jobs = configurationHandlerService.getHandlers().map(function(handler) {
        return handler(configuration);
      });
      return $q.all(jobs);
    }

    return {
      configure: configure
    };

  }])
  .factory('configurationHandlerService', [function() {
    var handlers = [];

    function register(handler) {
      if (!handler) {
        return;
      }
      handlers.push(handler);
    }

    function getHandlers() {
      return handlers;
    }

    return {
      register: register,
      getHandlers: getHandlers
    };
  }])
  .directive('conferenceConfiguration', ['$log', 'widget.wizard', 'session', 'configurationService', 'userService', function($log, Wizard, session, configurationService, userService) {

    function link($scope) {

      $scope.configuration = {
        displayName: userService.getDisplayName()
      };
      $scope.lengthError = false;

      $scope.createConference = function() {
        configurationService.configure($scope.configuration)
         .then(onSuccess, onFailure);
      };

      $scope.wizard = new Wizard([
        '/views/live-conference/partials/configuration/username.html'
      ], $scope.createConference);

      function onSuccess() {
        $log.info('Conference has been configured');
        session.setConfigured(true);
      }

      function onFailure(err) {
        $log.error('Failed to configure', err);
        session.setConfigured(false);
      }
      $scope.sendUrl = function() {
        FB.ui({
          method: 'send',
          link: location.href ,
        });
      };
      $scope.onUsernameChange = function() {
        if (!$scope.configuration.displayName) {
          return;
        }

        if ($scope.configuration.displayName.length >= 200) {
          $scope.configuration.displayName = $scope.configuration.displayName.slice(0, 199 - $scope.configuration.displayName.length);
          $scope.lengthError = true;
        } else if ($scope.configuration.displayName.length === 199) {
          $scope.lengthError = true;
        } else {
          $scope.lengthError = false;
        }
      };
      $scope.initialize = function() {
        $('#modal1').openModal() ;
      };
      
      
      $scope.initialize() ;
      $scope.copyTextToClipboard = function(text) {
        var textArea = document.createElement("textarea");

        //
        // *** This styling is an extra step which is likely not required. ***
        //
        // Why is it here? To ensure:
        // 1. the element is able to have focus and selection.
        // 2. if element was to flash render it has minimal visual impact.
        // 3. less flakyness with selection and copying which **might** occur if
        //    the textarea element is not visible.
        //
        // The likelihood is the element won't even render, not even a flash,
        // so some of these are just precautions. However in IE the element
        // is visible whilst the popup box asking the user for permission for
        // the web page to copy to the clipboard.
        //

        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;

        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';

        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;

        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';

        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';


        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();

        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log('Copying text command was ' + msg);
        } catch (err) {
          console.log('Oops, unable to copy');
        }

        document.body.removeChild(textArea);
      };
      $scope.copyCurrentUrl = function() {
        $scope.copyTextToClipboard(location.href) ;
        Materialize.toast('Copié!', 500, 'rounded',{delay: 50}) ;
      };

    }

    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/configuration.html',
      link: link
    };
  }])
  .directive('bitrateConfiguration', ['webRTCService', 'easyRTCBitRates', 'easyRTCDefaultBitRate', 'localStorageService', function(webRTCService, easyRTCBitRates, easyRTCDefaultBitRate, localStorageService) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/bitrate-configuration.html',
      link: function($scope) {
        var bitRates = Object.keys(easyRTCBitRates);
        var storage = localStorageService.getOrCreateInstance('roomConfiguration');

        $scope.selectBitRate = function(rate) {
          if (bitRates.indexOf(rate) >= 0) {
            storage.setItem('bitRate', rate).finally(function() {
              $scope.selected = rate;
              webRTCService.configureBandwidth(rate);
            });
          }
        };

        $scope.isSelected = function(rate) {
          return $scope.selected === rate;
        };

        storage.getItem('bitRate').then(function(config) {
          if (config) {
            $scope.selectBitRate(config);
          } else {
            $scope.selectBitRate(easyRTCDefaultBitRate);
          }
        },
        function() {
          $scope.selectBitRate(easyRTCDefaultBitRate);
        });

      }
    };
  }])
  .directive('disableVideoConfiguration', ['webRTCService', '$alert', function(webRTCService, $alert) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/disable-video-configuration.html',
      link: function($scope) {
        $scope.videoEnabled = webRTCService.isVideoEnabled();
        $scope.canEnumerateDevices = webRTCService.canEnumerateDevices;

        var alertElement;
        $scope.$watch('videoEnabled', function(val) {
          webRTCService.enableVideo($scope.videoEnabled);
          if (!$scope.videoEnabled) {
            alertElement = $alert({
              container: '#disableVideoWarning',
              template: '/views/modules/configuration/disable-video-alert.html',
              duration: 5
            });
          } else if (alertElement) {
            alertElement.hide();
            alertElement = null;
          }
        });
      }
    };
  }]);