#!/usr/bin/env python2.7

import os

f = open('./allapps.lst','r')
for l in f.readlines():
	app = l.strip()
	print ("\n\nGrunting: ",app)
	#print "\n\nOptimizing: ",app
	os.system('grunt --target=%s --force' % app)
