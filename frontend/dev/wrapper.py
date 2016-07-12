#!/usr/local/bin/python

import simple

import os
import re
import sys
def magic_compile(html_file):
	"""
		Just takes the input app directory 
		and then calls compile template on
		templates/app.html
		styles/style.css
		recursive as True
	"""
	if os.path.basename(html_file).split('.')[-2] != 'partial' or  os.path.basename(html_file).split('.')[-1] != 'html':
		print html_file + ' is not an expected partial.html file as expected'
		return False

	html_file = ('/'+html_file) if html_file[0] == '/' else html_file
	base_dir = os.path.dirname(os.path.abspath(__file__))

	overwrite_css_check = False

	m = re.search(r'/templates/', html_file) 	
	if m is not None:
		#Check where this html file is. Based on its location, create the css files as required	
		if os.path.basename(html_file) != 'index.partial.html':
			print "Expecting partial to be index.partial.html"
			print "Quitting..."
			return False
			#Check if the css directory exists	
		css_dir = re.sub(r'templates', 'css', os.path.dirname(html_file))
		full_dir = base_dir+'/'+css_dir
		if not os.path.isdir(full_dir):
			print "No css directory found at expected location: " + css_dir
			print "No css directory found at expected location: " + full_dir 
			print "Quitting..."
			return False

		if os.path.exists(full_dir+"/style.partial.css"):
			css_file = css_dir+'/style.partial.css'
			print "Found " + css_file + ". Adding it to compile list" 
			compile_template(html_file, css_file)

		elif os.path.exists(full_dir+"/style.css"):
			print "Found " + css_dir + '/style.css' + ". Overwrite style.css and continue?[y/n]"
			if overwrite_css_check:
				response = raw_input("Overwrite style.css and continue?[y/n]?: ")

				if response == 'y':
					compile_template(html_file)
				else:
					print "Quitting..."
					return False
			else:
				print "Quitting..."
				return False

		else: #Neither style.partial.css nor style.css present
			compile_template(html_file)

		return True

	m = re.match(r'/partials/', html_file)
	#This HTML file is actually just /partials/<app>

	if m is not None:
		full_dir = base_dir+html_file
		if not os.path.exists(full_dir+'/index.partial.html'):
			print "Expecting index.partial.html at " + full_dir
			print "Quitting..."
			return False
		else:
			if os.path.exists(full_dir+'/style.partial.css'):
				print "style.partial.css found at " + html_file
				compile_template(html_file+"/index.partial.html", html_file+"/style.partial.css")	
			elif os.path.exists(full_dir+'/style.css'):
				print "Found " + html_file + '/style.css'
				response = raw_input("\tOverwrite style.css and continue?[y/n]?: ")
				if response == 'y':
					compile_template(html_file+"/index.partial.html")	
				else:
					print "Quitting..."
					return False
			else:
				compile_template(html_file+"/index.partial.html")	

			return True

	else:
		print html_file + " not expected as input"


def compile_template(html_file, css_file=None, js_file=None, recursive=True, replace=True):
	compiler = simple.SimplePartials(html_file, css_file) 

	print "Magic is good. Start compiler...\n" + os.path.basename(html_file)
	compiler.compile(recursive=recursive)


print "Trying to magically compile partials at: " + sys.argv[1]
magic_compile(sys.argv[1])
