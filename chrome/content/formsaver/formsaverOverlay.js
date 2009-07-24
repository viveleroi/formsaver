//*************************************************
//* FormSaver was designed for Mozilla Firefox
//*  by Michael Botsko, www.botsko.net, Botsko.net: Programming & Web Services
//*  ported to Firefox 3.0 by stanley.chow@pobox.com
//*************************************************

//*************************************************
//* Eteneral gratitude to Bjorn Austinson - 
//* he spent a lot of time listening to me 
//* babble about this extension. 
//* We all miss him.
//*************************************************

//*************************************************
//* This function opens the formsaver options window
//*************************************************
  function saveForm(){
  
    window.openDialog("chrome://formsaver/content/formsaverOptions.xul", 
		      "FormSaver", "chrome,centerscreen,dialog=no", {title: content.document.title});
  
  }

//*************************************************
// Since we're saving form data as a javascript, single quotes and backslashes need to be escaped
// otherwise the bookmarklet will fail
//*************************************************
  function encodeFormData(value){
  
    var encodedValue = new String(value);
  	
    encodedValue = encodedValue.replace(/\\/g, "\\\\");
    encodedValue = encodedValue.replace(/'/g, "\\'");
  	
    encodedValue = encodedValue.replace(/\n/g, "\\n");
    encodedValue = encodedValue.replace(/\r/g, "\\r");
    encodedValue = encodedValue.replace(/\t/g, "\\t");
  	
    return encodedValue;
  
  }

//*************************************************
// Here we're gathering all of the frames available in the current tab
// This is including the parent document itself.
//*************************************************
  function gatherFrames(frame, documentList){
  
    const framesList = frame.frames;

    documentList.push(frame.document);

    // Loop through the frames
    for(var i = 0; i < framesList.length; i++){
    
        gatherFrames(framesList[i], documentList);
        
    }

    return documentList;
    
  }


//*************************************************
// Here is the main function that creates the bookmarklet.
//*************************************************
function createMyBookmarklet(bookmarkName){

//*************************************************
//* HERE WE'RE GATHERING THE PREFS
//*************************************************

  // We need to load the prefs
  var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);
          
  // Check if "save password fields" pref is set, otherwise the default is false     
  if (prefs.getPrefType("formsaver.savepassword") == prefs.PREF_BOOL){
    var savePasswords = prefs.getBoolPref("formsaver.savepassword");
  }
  
  // Check if "ignore errors" pref is set, otherwise set default value
  if (prefs.getPrefType("formsaver.ignorerrors") == prefs.PREF_BOOL){
    var ignoreErrors = prefs.getBoolPref("formsaver.ignorerrors");
  }

  
  // bookmarks folder is always set
  if (prefs.getPrefType("formsaver.sendtoFolderId") == prefs.PREF_INT){
    var folderId = prefs.getIntPref("formsaver.sendtoFolderId");
  }
  
  // Check if "bypass location check" pref is set, otherwise the default is false     
  if (prefs.getPrefType("formsaver.checklocationhref") == prefs.PREF_BOOL){
    var checkLocations = prefs.getBoolPref("formsaver.checklocationhref");
  } else {
    var checkLocations = true;
  }
  
  // Check if "ignore blank fields" pref is set, otherwise the default is false     
  if (prefs.getPrefType("formsaver.ignoreblankfields") == prefs.PREF_BOOL){
    var ignoreBlankFields = prefs.getBoolPref("formsaver.ignoreblankfields");
  }
  
  // Check if "save hidden fields" pref is set, otherwise the default is false
  if (prefs.getPrefType("formsaver.savehiddenfields") == prefs.PREF_BOOL){
    var saveHiddenFields = prefs.getBoolPref("formsaver.savehiddenfields");
  }
  
//*************************************************
//* HERE WE'RE DEFINING OUR VARIABLES
//*************************************************

  // Here we gather our document list.
  const mainTab       = getBrowser().mTabBox;
  const documentList  = gatherFrames(getBrowser().browsers[mainTab.selectedIndex].contentWindow, new Array());
  
  // Initialize the code string
  var code            = "";
  
  // This gets our URL
  var myUrl           = window.content.location.href;
  
  // This sets our bookmark name, coming from the options window
  var formName        = bookmarkName;
  
  // This sets our bookmark description
  var bookmarkDesc = "FormSaver Bookmarklet For " + myUrl;
  
//*************************************************
//* HERE WE'RE CREATING THE BOOKMARKLET JAVASCRIPT
//*************************************************
  
  // Begin writing text to the code output string
  code += "javascript:(function(){ ";
  
  if(checkLocations){
  
    code += "var fs_v = false; if(location.href == \""+myUrl+"\"){ fs_v = true; } else { if(!confirm('This bookmarklet was created from forms at a different web address. Click OK to be directed to the original page. Once the new web address has loaded you will need to click this bookmarklet again to complete the form fill. Click Cancel to attempt to execute the bookmarklet anyway.')){ fs_v = true; } else { fs_v = false; location.href = \""+myUrl+"\"; } } ";
    
  } else {
  
    code += "var fs_v = true; ";
  
  }
  
  code += "if(fs_v){";
  
  // add error code
  code += " var error = 0; var keepError = 'I tried my best, but I was unable to fill in your form perfectly.<br><br>';";
   
  // begin form code
  code += "var formsArray = content.document.getElementsByTagName('form');";
  
  // Loop through all of the documents we found using gatherFrames
  for(var t = 0; t < documentList.length; t++){
  
    // Within each document loop, get an array of forms in the document
    var formsArray = documentList[t].getElementsByTagName("form");
		
    // Go ahead and loop through said array of forms
    for(var f=0; f<formsArray.length; f++) {
    
      // If the document number is 1 or greater then we're in a frame/iframe
      // Our bookmarklet script will change it's path to the element
      // depending on whether it's in the parent or a frame.
      // There might be a better way to do this, but I don't have time.
      if(t < 1){
      
  		  var formPath = "formsArray["+f+"]";
  		  
  		} else {
  		
  		  var formPath = "window.frames["+(t - 1)+"].document.forms["+f+"]";
  		  
  		}
  
  		// Now we're going to loop through the elements of each form
  		for(var i=0; i<formsArray[f].elements.length; i++)  {
  		
  		  // Get the element
  			var e = formsArray[f].elements[i];
  			
  			// Some elements we can reference have a "type" attribute
  			// some do not, this gets the correct one
  			if(!e.type || e.type == "undefined"){
  			
  			 var elementType = e.getAttribute("type");
  			 
  			} else {
  			
  			 var elementType = e.type;
  			 
  			}
  			
  			// If the element has no name, we're going to skip it
  			// because the bookmarklet needs a name.
  			// TO-DO: If no name, reference by element number?
  			if(e.name) {
  			
          if(ignoreBlankFields && e.value == ''){
            var ignoreBlank = true;
  				} else {
            var ignoreBlank = false;
  				}
  			
    			// Ignore hidden values
    			if( elementType == 'hidden' ){
    			
            if(saveHiddenFields){
            
              code += "try{ "+formPath+"['"+e.name+"'].value='"+encodeFormData(e.value)+"'; } catch(e){ error = 1; keepError = keepError + '- Form field "+e.name+" could not be found.<br>'; } ";
              
            }
    			}
    			
    			// Ignore the submit button
    			if( elementType == 'submit' ) continue;
    			
    			// Ignore the reset button
    			if( elementType == 'reset' ) continue;
    			
    			// Ignore file inputs, the DOM does not allow javascript to fill these fields
    			// because of security issues.
    			if( elementType == 'file' ) continue;
    			
    			// If it's a radio field and it's checked, save that check
    			if( elementType == 'radio' && e.checked )  {
      
            code += "try { "+formPath+".elements["+i+"].checked=true; } catch(e){ error = 1; keepError = keepError + '- Form radio "+e.name+" could not be found.<br>'; } ";
              
          }
          // If it's a checkbox and it's checked, save that check
          else if( elementType == 'checkbox' )  {
          
            if(e.checked){
    
              code += "try { "+formPath+".elements["+i+"].checked=true; } catch(e){ error = 1; keepError = keepError + '- Form checkbox elements["+i+"] could not be found.<br>'; } ";
    
            } else {
            
              code += "try { "+formPath+".elements["+i+"].checked=false; } catch(e){ error = 1; keepError = keepError + '- Form checkbox elements["+i+"] could not be found.<br>'; } ";
              
            }
    			}
    			// If it's a select-multiple then we need to ensure we record each option selected
    			else if( elementType == 'select-multiple' )  {
    			
    			  // Initialize our variable to loop the select
            var whichitem = 0;
            
            // Loop through the select
            while (whichitem < e.length) {
              // If the option we're on now is actually selected, we'll save it
              if (e.options[whichitem].selected) {
              
                 code += "try { "+formPath+"['"+e.name+"'].options[" + whichitem + "].selected = true; } catch(e){ error = 1; keepError = keepError + '- Form select multiple "+e.name+".options[" + whichitem + "] could not be found.<br>'; } ";
                 
              } else {
              
                code += "try { "+formPath+"['"+e.name+"'].options[" + whichitem + "].selected = false; } catch(e){ error = 1; keepError = keepError + '- Form select multiple "+e.name+".options[" + whichitem + "] could not be found.<br>'; } ";
                 
              }
              whichitem++;
            }
    			}
    			// If it's a password field, then we need to see if we've been told
    			// to save it or not. If not, we'll set focus to it so that the user
    			// can fill it in manually.
          else if( elementType == 'password')  {
          
    				if(savePasswords == true){
    				
      				code += "try { "+formPath+"."+e.name+".value='"+encodeFormData(e.value)+"' } catch(e){ error = 1; keepError = keepError + '- Form password field "+e.name+" could not be found.<br>'; } ";
      				
    				} else {
    				
    				  code += "try { "+formPath+"."+e.name+".focus(); } catch(e){ error = 1; keepError = keepError + '- I can\\\'t set focus on the password field "+e.name+".<br>'; } ";
    				  
    				}
    				
    			}
    			// If it's a single select field, we'll just gather it's value.
    			else if( elementType == 'select-one')  {
          
    				// Otherwise we'll simply save the value of the form fields
    				code += "try{ "+formPath+"['"+e.name+"'].value='"+e.value+"'; } catch(e){ error = 1; keepError = keepError + '- Form field "+e.name+" could not be found.<br>'; } ";
    				
    			}
    			// If the field is text (the most common) we'll get the value, and encode it.
          else if( elementType == 'text')  {
          
    				// Otherwise we'll simply save the value of the form fields
            if(!ignoreBlank){
    				  code += "try{ "+formPath+"['"+e.name+"'].value='"+encodeFormData(e.value)+"'; } catch(e){ error = 1; keepError = keepError + '- Form field "+e.name+" could not be found.<br>'; } ";
    				}
    			}
    			// If this is a textarea we need to get the value and encode it.
    			else if( elementType == 'textarea')  {
          
    				// Otherwise we'll simply save the value of the form fields
    				if(!ignoreBlank){
    				  code += "try{ "+formPath+"['"+e.name+"'].value='"+encodeFormData(e.value)+"'; } catch(e){ error = 1; keepError = keepError + '- Form field "+e.name+" could not be found.<br>'; } ";
    				}
    			}
    			else {
    			 // If there is a form field we don't recognize, skip it. Did I miss anything?
    			}
  			} // End if no name
  		} // End loop through elements
    } // End loop through forms
  } // End loop through documents/frames
  
	// Open an error window unless errors need to be ignored
	if(!ignoreErrors){
	
		code += " if(error == 1){ var newwin = window.open('', 'formsaver', 'HEIGHT=250,WIDTH=600,resizable=1,scrollbars=1'); newwin.document.writeln(keepError); newwin.document.close(); newwin.focus(); }";
	
	}
	
	// Close the location check
  code += " }";
	
	// Close the code string function
  code += " } )()";
	
	// Now we'll add this to the bookmarks, in a folder the user set to prefs

  // connect to bookmarks service
  var bmarks = Components.classes["@mozilla.org/browser/nav-bookmarks-service;1"].
                getService(Ci.nsINavBookmarksService);

  // create an nsIURI for the URL to be bookmarked.
  var bmarkURI = Components.classes["@mozilla.org/network/io-service;1"].
                  getService(Ci.nsIIOService).newURI(code, null, null);


  var bookmarkId = bmarks.insertBookmark(
                       folderId, // The id of the folder the bookmark will be placed in.
                       bmarkURI,             // The URI of the bookmark - an nsIURI object.
                       bmarks.DEFAULT_INDEX, // The position of the bookmark in it's parent folder.
                       bookmarkName);    // The title of the bookmark.

  
}
