module.exports=function(grunt){

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		copy:{
			index:{
				cwd:'src/',
				dest:'dist/',
				src:['index.html'],
				expand: true
			},
			css:{
				cwd:'src/',
				dest: '.tmp/',
				src:['css/**/*.css'],
				expand: true
			},
			images:{
				cwd:'src/',
				dest:'dist/',
				src:['images/**/*.*'],
				expand:true
			}
		},
		concat:{
			css:{
				sourceMap:false,
				src: ['.tmp/**/*.css', '!.tmp/**/extra.css'],
				dest: '.tmp/mainSinExtras.css',
			},
			cssExtras:{
				sourceMap:false,
				src: ['.tmp/mainSinExtras.css', '.tmp/**/extra.css'],
				dest: '.tmp/main.css',
			}
		},
		clean:{
			tmp:{
				src: ['.sass-cache/', '.tmp/']
			}
		},
		connect:{
			src:{
				options:{
					port: 9002,
					hostname: '0.0.0.0',
					base: 'src',
					livereload: 35729,
					open: true
				}
			},
			dist:{
				options:{
					port: 9002,
					hostname: '0.0.0.0',
					keepalive: true,
					base: 'dist'
				}
			}
		},
		htmlmin: {
			dist: {
				options:{
					removeComments: true,
					collapseWhitespace: true
				},
				files:{
					'dist/index.html': 'dist/index.html'
				}
			} 
		},
		useminPrepare: {
			html: 'src/index.html',
			options: {
				dest: 'dist'
			}
		},
		usemin:{
			html:['dist/index.html']
		},
		ngtemplates:{
			oohlalaCart:{
				cwd:'src/',
				src:'app/**/*.html',
				dest:'.tmp/template.js',
				options:{
					usemin:'dist/app.min.js'
				}
			}
		},
		sass: {
			dist: {
				options:{
					sourcemap: 'none',
					style: 'compressed'
				},
				files:{
					'dist/main.css': 'src/scss/main.scss'
				}
			}
		},
		css_relative_url_replace: {
			options: {
		        staticRoot: '../'
		      },
			replace: {
				files: {
					'dist/main.css': [
						'.tmp/main.css'
					]
				}
			}
		},
		watch: {
			options: {
				livereload: {
					host: '0.0.0.0',
					port: 35729,
					reload: true
				}
			},
			css: {
				files: ['src/**/*.css'],
			},
			js: {
				files: ['src/app/**/*.js'],
			},
			html: {
				files: ['src/**/*.html'],
			}
		},
	});


	grunt.registerTask('build', function(){
		//compile SCSS and copy to dist folder
		//grunt.task.run('sass:dist');

		//copy and concat css files. Concat is run separate to ensure extras.css is added last
		grunt.task.run('copy:css');
		grunt.task.run('concat:css');
		grunt.task.run('concat:cssExtras');

		//process and minify html, concat js
		grunt.task.run('copy:index');
		grunt.task.run('useminPrepare');

		//process navigation URLs
		grunt.task.run('ngtemplates:oohlalaCart');

		grunt.task.run('concat:generated');
		grunt.task.run('uglify:generated');
		grunt.task.run('usemin');
		grunt.task.run('htmlmin:dist');

		//copy images folder
		grunt.task.run('copy:images');

		//clean css image URLs
		grunt.task.run('css_relative_url_replace:replace');

		//clear temporal folder
		grunt.task.run('clean:tmp');
	});

	grunt.registerTask('cleanTmp', function(){
		grunt.task.run('clean:tmp');
	})


	grunt.registerTask('serve', function(target){
		grunt.task.run('connect:'+(target?target:'src'));
		grunt.task.run('watch');
	})
};
