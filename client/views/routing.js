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
Router.route('/admin/',{
     name: 'admin',
     template: 'admin',
 	 action: function () {
 	    this.render();
 	}
});
Router.plugin('ensureSignedIn', {
  only: ['currentsites','history','admin']
});
//AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('enrollAccount');
//AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');


