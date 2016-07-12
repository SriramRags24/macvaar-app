"""
Assumes that this is run in the dev directory of the workflow
- app/templates/foo.html
- app/css/main.css
- app/scripts/main.js

Using this as a base URL to access a directory named, 
say, 'directory' with the following contents:
directory
- index.html (replaced within HTML)
- style.css (concatenated to main.css)
- main.js
"""


import re
import os

class PartialProcessError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return repr(self.msg)

class MainJsProcessError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return repr(self.msg)


def check_partial_ext(f, ext):
    a = f.split('.')
    if a[-1] == ext and a[-2] == 'partial':
        return f
    else:
        return None

##------------------------------------------------#
class SimplePartials():

    def __init__(self, html_file, css_file=None, js_file=None, in_recursion=-1):
        """
            html_file css_file and js_file should be paths relative to the current directory
            They may or may not start with '/'
        """
        self.partials = {} #Dictionary of partial_name: partial_path values 

        self.base_dir=os.path.dirname(os.path.abspath(__file__)) #Should be BLAH/BLAH/dev

        self.html_file = check_partial_ext(html_file, 'html') #Should be app/templates/file.partial.html
        if self.html_file is None:
            #print("WARNING: No .partial.html file found")
            pass
        elif not os.path.exists(self.base_dir + '/' + self.html_file):
            raise PartialProcessError("No file found at " + html_file) 

        self.css_file = None if css_file is None else check_partial_ext(css_file, 'css') #Should be app/css/style.partial.css
        if self.css_file is None:
            #print("WARNING: No .partial.css file found")
            pass	
        elif not os.path.exists(self.base_dir + '/' + self.css_file):
            raise PartialProcessError("No file found at " + css_file) 

        self.js_file = None if js_file is None else check_partial_ext(js_file, 'js') #Should be app/scripts/main.js

        self.process_js = False if self.js_file is None else True #Don't process js files by default 
        self.in_recursion = in_recursion+1 
        self.html_processed = False

    def recurse_print (self,string):
        indent = ''
        for i in range(self.in_recursion):
            indent += '-'
        print indent + "> " + string

    def base_exists(self, path):
        return True if os.path.exists(self.base_dir + path) else False

    def add_base(self, path):
        return self.base_dir + "/" + path

    def get_partial_src_files(self, partial_path):
        """
            If the partial is within the partials directory, then the files are:
                partials/<partial>/index.html
                partials/<partial>/main.js
                partials/<partial>/style.css

            If it is within the app folder then the files are:
                app/templates/<partial>.html
                app/scripts/<partial>.js
                app/css/<partial>.css
        """
        partial_path = re.sub(r'[\'\"]', '', partial_path) #Remove the quotation marks
        paths = {}
        m = re.match(r'^/partials/', partial_path); 
        if m is not None:
            #Search for a .partial.<ext> version first
            if self.base_exists(partial_path+'/index.partial.html'):
                paths['html_file'] = partial_path+'/index.partial.html'
            elif self.base_exists(partial_path+'/index.html'):
                paths['html_file'] = partial_path+'/index.html'
            else:
                raise PartialProcessError('index.html or index.partial.html not found at ' + partial_path)  

            if self.process_js:
                if self.base_exists(partial_path+'/main.js'):
                    paths['js_file'] = partial_path+'/main.js'
                else:
                    self.recurse_print("No main.js found at " + partial_path)
                    paths['js_file'] = None 
            else:
                paths['js_file'] = None

            if self.base_exists(partial_path+'/style.partial.css'):
                paths['css_file'] = partial_path+'/style.partial.css'
            elif self.base_exists(partial_path+'/style.css'):
                paths['css_file'] = partial_path+'/style.css'
            else:
                self.recurse_print('style.css or style.partial.css not found at ' + partial_path)
                paths['css_file'] = None

            return paths

        cur_app_dir = os.path.dirname(self.html_file)
        cur_app_dir = ("/"+cur_app_dir) if (cur_app_dir[0] != '/') else cur_app_dir
        m = re.match(cur_app_dir, partial_path); 
        if m is not None:
            #Check if the partial is /app/templates/<partial>
            partial_dirs = {}
            partial_dirs['html'] = partial_path
            partial_dirs['css'] = re.sub(r'templates','css', partial_path)
            partial_dirs['js'] = re.sub(r'templates','scripts', partial_path)

            for ext in ['html', 'css']:
                if self.base_exists(partial_dirs[ext]+'.partial.'+ext): #Check .partial.[html,css]
                    paths[ext+'_file'] = partial_dirs[ext]+'.partial.'+ext
                elif self.base_exists(partial_dirs[ext]+'.'+ext): #Check .[html,css]
                    paths[ext+'_file'] = partial_dirs[ext]+'.'+ext
                else:
                    if ext == 'html': #Only raise error for HTML. Partial may not have a css 
                        partial_name = os.path.basename(partial_path)
                        raise PartialProcessError(partial_name+'.html or ' + partial_name+'.partial.html not found at ' + partial_dirs['html'])  
                    else:
                        paths[ext+'_file'] = None

            #When the partial is not a reusable partial and just an app partial
            # then don't process js files
            paths['js_file'] = None

            return paths

        raise PartialProcessError("Partial found in HTML file, but no corresponding files found in " + partial_path)


#------ HTML and CSS: Compiler and Assembler --#
    def write_lines_to_output(self, file_path, output, indent=''):
        """
            Output must be a file stream open for writing
        """
        if output is None:
            raise PartialProcessError("No output file. Compiler in unexpected place. Scared and stopping: "+self.html_file + ", " + self.css_file + ", in_recursion: " + str(self.in_recursion))
            return

        #Write away!
        i = open(file_path)
        lines = i.read().splitlines()
        for line in lines:
            output.write(indent + line + "\n")
        i.close()

    def handle_match(self, match, html_output, css_output):
        #self.recurse_print ("Adding "+match.group(5)+" html/css to " + self.html_file)

        #print match.group(0)	
        indent = match.group(1)
        partial_path = match.group(5)
        partial_path = re.sub(r'[\'\"]', '', partial_path) #Remove the quotation marks


        dir_path = self.base_dir+'/'+ partial_path
        #Add this to the list of partials
        self.partials[os.path.basename(dir_path)] = partial_path 

        #Check the partial type to set the correct source paths
        html_file_path = css_file_path = ''
        m = re.match(r'^/partials/', partial_path); 
        if m is not None:
            #This is /partials/<partial>
            html_file_path = dir_path + '/' + 'index.html'
            css_file_path = dir_path + '/' + 'style.css'
        else:
            cur_app_dir = os.path.dirname(self.html_file)
            cur_app_dir = ("/"+cur_app_dir) if (cur_app_dir[0] != '/') else cur_app_dir
            m2 = re.match(cur_app_dir, partial_path); 
            if m2 is not None:
                #This is /app/templates/<partial>
                html_file_path = dir_path + '.html' #.../dev/<app>/templates/<partial>.html
                css_file_path = re.sub(r'templates', 'css', (dir_path + '.css')) #.../dev/<app>/css/<partial>.css
            else:
                raise PartialProcessError("Invalid partial path found: " + partial_path)

        self.recurse_print("Assembling HTML/CSS files from " + html_file_path.split('dev/')[-1] + " and " + css_file_path.split('dev/')[-1])
        if os.path.isfile(html_file_path):
            self.write_lines_to_output(html_file_path, html_output, indent)
        else: #index.html file must exist compulsarily
            raise PartialProcessError(html_file_path + ' not found.')

        #Check if css files exist and add them to the path
        if os.path.isfile(css_file_path):
            css_output.write("\n/*-- " + partial_path + " (concatenated) --*/\n")
            self.write_lines_to_output(css_file_path, css_output)
        else:
            self.recurse_print(css_file_path + " does not exist (as expected). Not assembling CSS")

    def compile(self, recursive=False):
        """
            1) For each line in the partial.html file see if it matches ^\s+ {{ MODULE '/some/path' }} $
            2) If it doesn't, print as it is in the new file
            3) If it is then get the contents from the path/[index,partial].html file and paste every line from that in the new file,
               with the initial indent
            4) In the recursive mode, compile the path/[index,partial].partial.html file as well
        """
        if self.html_file is None:
            #self.recurse_print ("Nothing to compile")
            return

        f = open(self.add_base(self.html_file))
        lines = f.read().splitlines()
        f.close()

        new_html_file = open(self.add_base(re.sub(r'partial\.', '', self.html_file)), "w")
        new_html_file.write("<!-- Automatically generated from " + os.path.basename(self.html_file) + ". DO NOT EDIT. -->\n")

        #Open a new css file and copy the old CSS file into it
        if self.css_file is not None:
            new_css_file = open(self.add_base(re.sub(r'partial\.', '', self.css_file)), "w") 
        else:
            #Depending on the type of the partial file being processed, generate a CSS file
            if self.html_file.split('/')[-2] == 'templates':
                # Case 1: app/templates/index.html 
                #         Generate app/css/style.css 
                # Case 2: app/templates/<partial>.html 
                #         Generate app/css/<partial>.css 
                file_name = self.html_file.split('templates/')[1]
                if file_name == 'index.partial.html':
                    if self.in_recursion != 0: #ASSERT some assumptions
                        raise PartialProcessError("index.partial.html should only be processed at the root level")
                    css_file = os.path.dirname(self.html_file) + '/style.css'
                    css_file = re.sub(r'templates', 'css', css_file)
                else:
                    css_file = os.path.dirname(self.html_file) + "/" + file_name.split('.')[0] + ".css"
                    css_file = re.sub(r'templates', 'css', css_file)
            elif (re.match(r'^/partials',self.html_file)) is not None: 
                # Case 3: partials/<partial>/index.html 
                #         Generate partials/<partial>/style.css 
                css_file = os.path.dirname(self.html_file) + "/style.css"
            else:
                raise PartialProcessError("Unexpected location of " + self.html_file + ". Not in <app>/tempates/ or in partials/<partial>/ ")

            self.recurse_print("No CSS file found to compile, so creating new one at " + css_file)
            new_css_file = open(self.add_base(css_file), 'w')	

        if self.css_file is not None:
            if not self.in_recursion:
                new_css_file.write("\n/*-- " + self.css_file  + " (compiled) --*/\n")
            fcss = open(self.add_base(self.css_file))
            lcss = fcss.read().splitlines()
            fcss.close()
            for line in lcss:
                new_css_file.write(line+"\n")


        for line in lines:
            #print line
            m = re.match(r'(\s+)(\{\{\{\s*)(PARTIAL)(\s+)([^\s]+)(\s*\}\}\}\s*$)', line)
            if m is not None:
                #Check for recursive and compile
                if recursive:
                    self.recurse_print("Found a partial: " + m.group(5) + " Now trying to compile it...")
                    c = SimplePartials( in_recursion=self.in_recursion, **self.get_partial_src_files(m.group(5))) 
                    c.compile(recursive=True)
                    c.process_js_file(recursive=True)
                self.handle_match(m, new_html_file, new_css_file)
            else:
                new_html_file.write(line+"\n")

        new_html_file.close()
        new_css_file.close()

        self.html_processed = True
#----------------------------------------------#


#----------- JS BITS. DO NOT USE --------------#
    def add_require_paths(self, match, output):
        for key in self.partials.keys():
            #Process the path to remove the leading / if any
            #Process to get everything without the js extension
            require_path = re.sub(r'^/', '', self.partials[key])	
            print "Adding " + key + " at " + self.partials[key]
            output.write('\t\t"' +require_path + '/main",\n')

    def add_function_args(self, match, output):
        indent = match.group(1)
        for key in self.partials.keys():
            print "Adding " + key + " at " + self.partials[key] + " to function"
            output.write(indent + "\t" + key + ",\n")

    def add_attactTos(self, match, output):
        indent = match.group(1)
        for key in self.partials.keys():
            attach = key + '.attachTo("#' + key + '");\n'
            print "Adding " + attach
            output.write(indent + "\t" + attach)

    def process_js_file(self, recursive=False):
        """
            Decide whether to replace the main.js file or to create a new one.
            By default creates: out_main.js

            Find the main.js file
            Find the require([ statement 
                Add the partial paths to it
            Find the function( statement within this line 	
                Add the list of partial names to it

            Expected format of the main.js file
            ....
            require( [
                        "",
                        "",
                        ""
                    ], function ( 
                       partial1,
                       partial2,
                       partial3
                        )
                        {
                            partial1.attachTo("#partial1");
                            partial2.attachTo("#partial2");
                            partial3.attachTo("#partial3");
                        })
        """
        if (not self.process_js) or self.js_file is None:
            return

        print("Starting to process main.js file")
        parse_error = True
        require_done = False
        function_done = False
        attachTo_done = False

        f = open(self.add_base(self.js_file))
        lines = f.read().splitlines() 
        f.close()

        if not replace:
            new_js_file = open("out_main.js","w")	
        else:
            new_js_file = open(self.add_base(self.js_file),"w")	

        for line in lines:
            print line
            matched = True

            if not require_done:
                m = re.match(r'\s*require\s*\(\s*\[\s*$', line)
                if m is not None:
                    new_js_file.write("require([\n")
                    self.add_require_paths(m, new_js_file)
                    require_done=True
                else:
                    matched=False
            elif not function_done:
                m = re.match(r'(\s*)function\s*\(\s*$', line)
                if m is not None:
                    new_js_file.write(m.group(1)+"function(\n")
                    self.add_function_args(m, new_js_file)
                    function_done = True
                else:
                    matched=False
            else:
                m = re.match(r'(\s*)\{\s*$', line)
                if m is not None:
                    new_js_file.write(m.group(1)+"{\n")
                    self.add_attactTos(m, new_js_file)
                    attachTo_done = True
                else:
                    matched=False

            if not matched:
                new_js_file.write(line+"\n")

        new_js_file.close()

        if (not require_done) or (not function_done) or (not attachTo_done):
            raise MainJsProcessError("Process not completed. One of require/function modifications missing")
#----------- JS BITS END. ---------------------#	


