'use strict';

const assert = require('assert');
const Fiber = require('fibers');
const userActions = require('../../../modules/action/user');
const chai = require('chai');
const should = chai.should();

const actionDeviceUnbound = userActions.actionDeviceUnbound.handler;
const actionCreateUser = deviceActions.createUser;
const actionGetInfo = userActions.actionGetInfo.handler;
const actionUpdateInfo = userActions.actionUpdateInfo.handler;
const actionInitInfo = userActions.actionInitInfo.handler;
const actionGetSportInfo = userActions.actionGetSportInfo.handler;
const actionGetHistoryDistance = userActions.actionGetHistoryDistance.handler;
const actionGetHistorySteps = userActions.actionGetHistorySteps.handler;
const actionGetHistoryCalories = userActions.actionGetHistoryCalories.handler;

const mockedExpress = require('../../mock/express');
const ExpressRequest = mockedExpress.ExpressRequest;
const ExpressResponse = mockedExpress.ExpressResponse;

describe('userActions', function() {
    describe('#actionCreateUser', function() {
        it('create user successfully', function(done) {
            Fiber(function() {
                let req = null;
                let res = null;
                req = new ExpressRequest();
                res = new ExpressResponse();
                let message = {};
                message.FromUserName = 'danyuanceshiopenid'; 
                actionCreateUser(message, req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: true
                });
                done();
            }).run();
        });

        it('message is null', function(done) {
            Fiber(function() {
                let req = null;
                let res = null;
                req = new ExpressRequest();
                res = new ExpressResponse();
                let message = {};
                actionCreateUser(message, req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: false
                });
                done();
            }).run();
        });
    });
    describe('#actionInitInfo', function() {
        it('init successfully', function(done) {
            Fiber(function() {
                let req = new ExpressRequest();
                let res = new ExpressResponse();
                req.params = {};
                req.params.id = '582190ac4493e10b547d441c';
                req.body = {
                    nickName: 'hammer',
                    sex: '女',
                    weight: '50',
                    height: '165',
                    birthday: '2016/5/5',
                    step: '3000'
                };
                actionInitInfo(req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: true
                });
                done();
            }).run();
        });

        it('id is null', function(done) {
            Fiber(function() {
                let req = new ExpressRequest();
                let res = new ExpressResponse();
                req.params = {};
                req.body = {
                    nickName: 'hammer',
                    sex: '女',
                    weight: '50',
                    height: '165',
                    birthday: '2016/5/5',
                    step: '3000'
                };
                actionInitInfo(req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: false
                });
                done();
            }).run();
        });
/*
        it('information is null', function(done) {
            Fiber(function() {
                let req = new ExpressRequest();
                let res = new ExpressResponse();
                req.params = {};
                req.params.id = '582190ac4493e10b547d441c';
                req.body = {};
                actionInitInfo(req, res);
                let content = JSON.parse(res.content);
                console.log('content', content);
                content.should.eql({
                    successful: false
                });
                done();
            }).run();
        });*/
    });
    describe('#actionUpdateInfo', function() {
        it('update successfully', function(done) {
            Fiber(function() {
                let req = new ExpressRequest();
                let res = new ExpressResponse();
                req.params = {};
                req.params.id = '582190ac4493e10b547d441c';
                req.body = {
                    nickName: 'hammer',
                    sex: '女',
                    weight: '50',
                    height: '165',
                    birthday: '2016/5/5',
                    step: '5000'
                };
                actionUpdateInfo(req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: true
                });
                done();
            }).run();
        });
        it('id is null', function(done) {
            Fiber(function() {
                let req = new ExpressRequest();
                let res = new ExpressResponse();
                req.params = {};
                req.body = {
                    nickName: 'hammer',
                    sex: '女',
                    weight: '50',
                    height: '165',
                    birthday: '2016/5/5',
                    step: '5000'
                };
                actionInitInfo(req, res);
                let content = JSON.parse(res.content);
                content.should.eql({
                    successful: false
                });
                done();
            }).run();
        });
    });
    describe('#actionGetInfo', function() {
        it('get info successfully', function() {
            Fiber(function() {
                
            }).run();
        });
    });

});