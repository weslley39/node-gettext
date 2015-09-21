'use strict';

var chai = require('chai');
var Gettext = require('../lib/gettext');
var fs = require('fs');

var expect = chai.expect;
chai.config.includeStack = true;

describe('Gettext', function() {

    describe('#_normalizeDomain', function() {
        it('should normalize domain key', function() {
            var gt = new Gettext();

            expect(gt._normalizeDomain('ab-cd_ef.utf-8')).to.equal('ab_CD-EF');
            expect(gt._normalizeDomain('ab-cd_ef', true)).to.equal('ab');
        });
    });

    describe('#addTextdomain', function() {

        it('Should add from a mo file', function() {
            var gt = new Gettext();
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            gt.addTextdomain('et-EE', moFile);

            expect(gt.domains.et_EE).to.exist;
            expect(gt.domains.et_EE.charset).to.equal('iso-8859-13');
        });

        it('Should add from a po file', function() {
            var gt = new Gettext();
            var poFile = fs.readFileSync(__dirname + '/fixtures/latin13.po');

            gt.addTextdomain('et-EE', poFile);

            expect(gt.domains.et_EE).to.exist;
            expect(gt.domains.et_EE.charset).to.equal('iso-8859-13');
        });
        it('should charge more than one file', function(){
            var gt = new Gettext();
            var poFile = fs.readFileSync(__dirname + '/fixtures/latin13.po');
            var poFile2 = fs.readFileSync(__dirname + '/fixtures/latin13-bis.po');

            gt.addTextdomain('et-EE', poFile, poFile2);
        })

    });

    describe('#textdomain', function() {
        it('should set default domain', function() {
            var gt = new Gettext();
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            expect(gt.textdomain()).to.be.false;
            gt.addTextdomain('et-EE', moFile);
            expect(gt.textdomain()).to.equal('et_EE');
            gt.addTextdomain('cd-EE', moFile);
            expect(gt.textdomain()).to.equal('et_EE');
        });

        it('should change default domain', function() {
            var gt = new Gettext();
            var moFile = fs.readFileSync(__dirname + '/fixtures/latin13.mo');

            expect(gt.textdomain()).to.be.false;
            gt.addTextdomain('et-EE', moFile);
            expect(gt.textdomain()).to.equal('et_EE');
            gt.addTextdomain('cd-EE', moFile);
            expect(gt.textdomain()).to.equal('et_EE');
            gt.textdomain('cd_EE');
            expect(gt.textdomain()).to.equal('cd_EE');
        });

    });

    describe('Resolve translations', function() {
        var gt;

        beforeEach(function() {
            gt = new Gettext();
            var poFile = fs.readFileSync(__dirname + '/fixtures/latin13.po');
            var poFile2 = fs.readFileSync(__dirname + '/fixtures/latin13-bis.po');

            gt.addTextdomain('et-EE', poFile, poFile2);
        });

        describe('#dnpgettext', function() {
            it('should return default singular', function() {
                expect(gt.dnpgettext('et_EE', '', '0 matches', 'multiple matches', 1)).to.equal('0 matches');
            });

            it('should return default plural', function() {
                expect(gt.dnpgettext('et_EE', '', '0 matches', 'multiple matches', 100)).to.equal('multiple matches');
            });

            it('should return singular match from default context', function() {
                expect(gt.dnpgettext('et_EE', '', 'o2-1', 'o2-2', 1)).to.equal('t2-1');
                expect(gt.dnpgettext('et_EE', '', 'oo2-1', 'oo2-2', 1)).to.equal('tt2-1');
            });

            it('should return plural match from default context', function() {
                expect(gt.dnpgettext('et_EE', '', 'o2-1', 'o2-2', 2)).to.equal('t2-2');
                expect(gt.dnpgettext('et_EE', '', 'oo2-1', 'oo2-2', 2)).to.equal('tt2-2');

            });

            it('should return singular match from selected context', function() {
                expect(gt.dnpgettext('et_EE', 'c2', 'co2-1', 'co2-2', 1)).to.equal('ct2-1');
                expect(gt.dnpgettext('et_EE', 'cc2', 'ccoo2-1', 'ccoo2-2', 1)).to.equal('cctt2-1');
            });

            it('should return plural match from selected context', function() {
                expect(gt.dnpgettext('et_EE', 'c2', 'co2-1', 'co2-2', 2)).to.equal('ct2-2');
                expect(gt.dnpgettext('et_EE', 'cc2', 'ccoo2-1', 'ccoo2-2', 2)).to.equal('cctt2-2');
            });

            it('should return singular match for non existing domain', function() {
                expect(gt.dnpgettext('cccc', '', 'o2-1', 'o2-2', 1)).to.equal('o2-1');
                expect(gt.dnpgettext('cccc', '', 'oo2-1', 'oo2-2', 1)).to.equal('oo2-1');
            });
        });

        describe('#gettext', function() {
            it('should return singular from default context', function() {
                expect(gt.gettext('o2-1')).to.equal('t2-1');
                expect(gt.gettext('oo2-1')).to.equal('tt2-1');
            });
        });

        describe('#dgettext', function() {
            it('should return singular from default context', function() {
                expect(gt.dgettext('et-ee', 'o2-1')).to.equal('t2-1');
                expect(gt.dgettext('et-ee', 'oo2-1')).to.equal('tt2-1');
            });
        });

        describe('#ngettext', function() {
            it('should return plural from default context', function() {
                expect(gt.ngettext('o2-1', 'o2-2', 2)).to.equal('t2-2');
                expect(gt.ngettext('oo2-1', 'oo2-2', 2)).to.equal('tt2-2');
            });
        });

        describe('#dngettext', function() {
            it('should return plural from default context', function() {
                expect(gt.dngettext('et-ee', 'o2-1', 'o2-2', 2)).to.equal('t2-2');
                expect(gt.dngettext('et-ee', 'oo2-1', 'oo2-2', 2)).to.equal('tt2-2');
            });
        });

        describe('#pgettext', function() {
            it('should return singular from selected context', function() {
                expect(gt.pgettext('c2', 'co2-1')).to.equal('ct2-1');
                expect(gt.pgettext('cc2', 'ccoo2-1')).to.equal('cctt2-1');
            });
        });

        describe('#dpgettext', function() {
            it('should return singular from selected context', function() {
                expect(gt.dpgettext('et-ee', 'cc2', 'ccoo2-1')).to.equal('cctt2-1');
            });
        });

        describe('#npgettext', function() {
            it('should return plural from selected context', function() {
                expect(gt.npgettext('cc2', 'ccoo2-1', 'ccoo2-2', 2)).to.equal('cctt2-2');
            });
        });

        describe('#getComment', function() {
            it('should return comments object', function() {
                expect(gt.getComment('et-ee', '', 'test')).to.deep.equal({
                    translator: 'Normal comment line 1\nNormal comment line 2',
                    extracted: 'Editors note line 1\nEditors note line 2',
                    reference: '/absolute/path:13\n/absolute/path:14',
                    flag: 'line 1\nline 2',
                    previous: 'line 3\nline 4'
                });
            });
        });
    });
});