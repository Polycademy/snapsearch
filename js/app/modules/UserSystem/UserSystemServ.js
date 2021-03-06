'use strict';

/**
 * User System Service Provider.
 * Relies on Restangular.
 */
module.exports = function () {

    var userState = false,
        userData = {},
        accountsResource = 'accounts',
        sessionResource = 'sessions';

    this.setAccountsResource = function (resource) {
        accountsResource = resource;
    };

    this.setSessionResource = function (resource) {
        sessionResource = resource;
    };

    this.$get = [
        '$rootScope',
        '$location',
        'Restangular',
        function ($rootScope, $location, Restangular) {

            //these functions will return a promise
            var userApi = {
                getUserState: function () {
                    return userState;
                },
                getUserData: function () {
                    return userData;
                },
                setUserData: function (data) {
                    userData = data;
                },
                mergeUserData: function (data) {
                    angular.extend(userData, data);
                },
                getAccount: function (id) {
                    return Restangular.all(accountsResource).get(id).then(function (response) {
                        $rootScope.$broadcast('accountProvided.UserSystem', response.content);
                        return response;
                    });
                },
                registerAccount: function (payload) {
                    return Restangular.all(accountsResource).post(payload).then(function (response) {
                        $rootScope.$broadcast('accountRegistered.UserSystem', payload);
                        return response;
                    });
                },
                updateAccount: function (payload) {
                    return Restangular.one(accountsResource, userData.id).customPUT(payload).then(function (response) {
                        $rootScope.$broadcast('accountUpdated.UserSystem', payload);
                        return response;
                    });
                },
                patchAccount: function (payload) {
                    return Restangular.one(accountsResource, userData.id).patch(payload).then(function (response) {
                        $rootScope.$broadcast('accountPatched.UserSystem', payload);
                        return response;
                    });
                },
                deleteAccount: function () {
                    return Restangular.one(accountsResource, userData.id).remove().then(function (response) {
                        $rootScope.$broadcast('accountDestroyed.UserSystem', userData.id);
                        return response;
                    });
                },
                getSession: function () {
                    return Restangular.all(sessionResource).customGET().then(function (response) {
                        $rootScope.$broadcast('sessionProvided.UserSystem', response.content);
                        return response;
                    });
                },
                loginSession: function (payload) {
                    return Restangular.all(sessionResource).post(payload).then(function (response) {
                        $rootScope.$broadcast('sessionLogin.UserSystem', response.content);
                        return response;
                    });
                },
                logoutSession: function () {
                    return Restangular.all(sessionResource).customDELETE().then(function (response) {
                        $rootScope.$broadcast('sessionLogout.UserSystem', userData.id);
                        return response;
                    });
                }
            };

            /**
             * Upon the account being provided, the user data is set to the response content.
             */
            $rootScope.$on('accountProvided.UserSystem', function (event, content) {
                userApi.setUserData(content);
            });

            /**
             * Upon the account being registered, attempt to login given the registration payload's username, email or password.
             */
            $rootScope.$on('accountRegistered.UserSystem', function (event, payload) {
                userApi.loginSession({
                    'username': payload.username,
                    'email': payload.email,
                    'password': payload.password
                });
            });

            /**
             * Upon the account being updated, replace the user data with the payload.
             */
            $rootScope.$on('accountUpdated.UserSystem', function (event, payload) {
                userApi.setUserData(payload);
            });

            /**
             * Upon the account being patched, merge the user data with the payload.
             */
            $rootScope.$on('accountPatched.UserSystem', function (event, payload) {
                userApi.mergeUserData(payload);
            });

            /**
             * Upon the account being destroyed, attempt to logout.
             */
            $rootScope.$on('accountDestroyed.UserSystem', function (event, id) {
                userState = false;
                userApi.logoutSession();
            });

            /**
             * Upon the session being provided, check if the session is registered. If registered broadcast a sessionLogin event.
             */
            $rootScope.$on('sessionProvided.UserSystem', function (event, id) {
                if (id !== 'anonymous') {
                    userState = true;
                }else{
                    userState = false;
                }
            });

            /**
             * Upon session login, get the account.
             */
            $rootScope.$on('sessionLogin.UserSystem', function (event, id) {
                userState = true;
                userApi.getAccount(id);
            });

            /**
             * Upon session logout, clear the userData.
             */
            $rootScope.$on('sessionLogout.UserSystem', function (event, args) {
                userState = false;
                userApi.setUserData({});
            });

            return userApi;

        }
    ];

};