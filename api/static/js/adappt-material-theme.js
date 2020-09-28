app.config(function($mdThemingProvider) {

  $mdThemingProvider.definePalette('adapptTheme', {
    '50':'E0F2EF',
 '100':'B3DFD8',
 '200':'80C9BE',
 '300':'4DB3A4',
 '400':'26A391',
 '500':'00937D',
 '600':'008B75',
 '700':'00806A',
 '800':'007660',
 '900':'00644D',
 'A100':'94FFE2',
 'A200':'61FFD4',
 'A400':'2EFFC6',
 'A700':'14FFBF',
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light

    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
     '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    // could also specify this if default was 'dark'
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('adapptTheme')

});
