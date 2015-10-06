// Router.route('/', function() {
//     this.render('main');
// });
//
// Router.route('/maincampus', function() {
//     this.render('maincampus');
// });
//
// Router.route('/history', function() {
//     this.render('history');
// });
//
// Router.route('/currentsites', function() {
//     this.render('currentsites');
// });

Router.configure({
    layoutTemplate: 'Frame',
	loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound',
	yieldTemplates: {
		nav: {to: 'nav'}
	    }
});
Router.map(function() {
    this.route('map', {
        path: '/',
		template:'map', //rest of stuff from below in mainMapOld?
		action: function () {
			this.render();
		}
    });
    this.route('currentsites', {
    	path:'/currentsites',
		template:'currentsites',
		action: function () {
			this.render();
		}
    });
});
Router.route('/history/',{
     name: 'history',
     template: 'history',
 	 action: function () {
 	    this.render();
 	}
});
Router.plugin('ensureSignedIn', {
  only: ['currentsites','history']
});
//AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');


