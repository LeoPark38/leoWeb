/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function (config) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';

	config.resize_enabled = false;

	config.toolbar = [
		{name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar']},
		{name: 'document', items: ['Source']},
		'/',
		{name: 'basicstyles', items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat']},
		{name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquete']},
		{name: 'styles', items: ['Styles', 'Format']}
	];
	config.dialog_backgroundCoverColor = 'rgba(0,0,0,0.5)';
	config.dialog_backgroundCoverOpacity = '1';
};
CKEDITOR.dtd.$removeEmpty['span'] = false;